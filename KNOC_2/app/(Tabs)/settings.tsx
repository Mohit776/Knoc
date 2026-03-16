import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Share,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../lib/firebase';
import firestore from '@react-native-firebase/firestore';
import { signOut } from '@react-native-firebase/auth';
import { clearCachedFcmToken } from '../../lib/NotificationProvider';

import Constants from 'expo-constants';
import { useTheme } from '../../lib/themeContext';

interface UserInfo {
    name: string;
    phone: string;
    qrId: string;
    location: string;
}

export default function SettingsScreen() {
    const router = useRouter();
    const { colors, themeMode: theme, setThemeMode: setTheme, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        phone: '',
        qrId: '',
        location: '',
    });
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const appVersion = Constants.expoConfig?.version ?? '54.26.0';

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            // Load from AsyncStorage first (fast)
            const [storedName, storedQrId, guestPhone] = await Promise.all([
                AsyncStorage.getItem('user_name'),
                AsyncStorage.getItem('linked_qr_id'),
                AsyncStorage.getItem('guest_phone'),
            ]);

            // Set whatever we have right away
            setUserInfo(prev => ({
                ...prev,
                name: storedName || '',
                phone: guestPhone ? guestPhone : '',
                qrId: storedQrId || '',
            }));

            // Fetch more details from Firestore if we have a QR ID
            if (storedQrId) {
                const docSnap = await firestore().collection('qr_codes').doc(storedQrId).get();

                const data = docSnap.data();
                if (data) {
                    setUserInfo({
                        name: data?.name || storedName || 'Unknown',
                        phone: data?.phone_number
                            ? formatPhone(data.phone_number)
                            : (guestPhone ? guestPhone : ''),
                        qrId: storedQrId,
                        location: data?.location || '',
                    });
                }
            }
        } catch (e) {
            console.error('[Settings] Error loading user info:', e);
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (phone: string) => {
        // Format +919876543210 → 9876543210 or just keep as is without +91
        const digits = phone.replace('+91', '').trim();
        return digits;
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        try {
                            // Clear FCM token from Firestore to stop notifications
                            const qrId = await AsyncStorage.getItem('linked_qr_id');
                            if (qrId) {
                                try {
                                    await firestore().collection('qr_codes').doc(qrId).update({ fcm_token: null });
                                    console.log('[Settings] FCM token cleared from Firestore for doc:', qrId);
                                } catch (e) {
                                    console.error('[Settings] Failed to clear FCM token:', e);
                                }
                            }

                            await signOut(auth);
                            await clearCachedFcmToken();
                            await AsyncStorage.multiRemove([
                                'is_guest',
                                'guest_phone',
                                'has_onboarded',
                                'user_name',
                                'linked_qr_id',
                            ]);
                            router.replace('/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Could not log out. Please try again.');
                        } finally {
                            setLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingAccount(true);
                        try {
                            const qrId = await AsyncStorage.getItem('linked_qr_id');
                            // 1. Remove user data from QR code in Firestore
                            if (qrId) {
                                await firestore().collection('qr_codes').doc(qrId).update({
                                    phone_number: firestore.FieldValue.delete(),
                                    name: firestore.FieldValue.delete(),
                                    location: firestore.FieldValue.delete(),
                                    fcm_token: firestore.FieldValue.delete(),
                                });
                                console.log('[Settings] User data unlinked from QR code');
                            }

                            // 2. Delete Firebase Auth user
                            const user = auth.currentUser;
                            if (user) {
                                await user.delete();
                                console.log('[Settings] Firebase auth user deleted');
                            }

                            // 3. Clear local device data
                            await clearCachedFcmToken();
                            await AsyncStorage.multiRemove([
                                'is_guest',
                                'guest_phone',
                                'has_onboarded',
                                'user_name',
                                'linked_qr_id',
                            ]);

                            Alert.alert(
                                'Account Deleted', 
                                'Your account and data have been successfully deleted.',
                                [{ text: 'OK', onPress: () => router.replace('/login') }]
                            );
                        } catch (error: any) {
                            console.error('Delete account error:', error);
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert('Session Expired', 'Please log out and log in again before deleting your account for security purposes.');
                            } else {
                                Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
                            }
                        } finally {
                            setDeletingAccount(false);
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out this awesome app TrueKNOC! Download it now.',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Profile Row */}
                        <View style={styles.profileRow}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{getInitials(userInfo.name)}</Text>
                            </View>
                            <View style={styles.profileInfoText}>
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {userInfo.name || 'User'}
                                </Text>
                                {userInfo.phone ? (
                                    <Text style={styles.profilePhone} numberOfLines={1}>
                                        {userInfo.phone}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Appearance Section */}
                        <Text style={styles.sectionLabel}>Appearance</Text>
                        <View style={styles.cardGroup}>
                            {['Automatic', 'Light', 'Dark'].map((item, index, arr) => {
                                const isSelected = theme === item;
                                const isLast = index === arr.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.cardRow,
                                            !isLast && styles.cardRowBorder,
                                        ]}
                                        onPress={() => setTheme(item as any)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.cardRowText}>{item}</Text>
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle-outline' : 'ellipse-outline'}
                                            size={22}
                                            color={isSelected ? '#7A52D1' : '#C7C7CC'}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Your Information Section */}
                        <Text style={styles.sectionLabel}>Your information</Text>
                        <View style={styles.cardGroup}>
                            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} onPress={() => router.push('/profile' as any)} activeOpacity={0.7}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="person-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>View your profile</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} onPress={() => router.push('/addAdress' as any)} activeOpacity={0.7}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>Addresses</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/notification' as any)} activeOpacity={0.7}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="notifications-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>Notification</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>

                        {/* Others Information Section */}
                        <Text style={styles.sectionLabel}>Others information</Text>
                        <View style={styles.cardGroup}>
                           
                            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} onPress={() => router.push('/aboutus' as any)} activeOpacity={0.7}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="information-circle-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>About us</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.cardRow, styles.cardRowBorder]} 
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL('https://knoc.vercel.app/privacy/')}
                            >
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="lock-closed-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>Privacy policy</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.cardRow, styles.cardRowBorder]} 
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL('https://knoc.vercel.app/term/')}
                            >
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="document-text-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>Terms & conditions</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.cardRow, styles.cardRowBorder]} onPress={handleDeleteAccount} activeOpacity={0.7} disabled={deletingAccount}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="trash-outline" size={18} color={isDark ? '#ff4d4d' : '#e60000'} />
                                    </View>
                                    <Text style={[styles.cardRowText, { color: isDark ? '#ff4d4d' : '#e60000' }]}>Delete account</Text>
                                </View>
                                {deletingAccount ? (
                                    <ActivityIndicator size="small" color={isDark ? '#ff4d4d' : '#e60000'} />
                                ) : (
                                    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cardRow} onPress={handleLogout} activeOpacity={0.7} disabled={loggingOut}>
                                <View style={styles.cardRowLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="log-out-outline" size={18} color={isDark ? '#CCC' : '#333'} />
                                    </View>
                                    <Text style={styles.cardRowText}>Log out</Text>
                                </View>
                                {loggingOut ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Logo and App Version */}
                        <View style={styles.footerContainer}>
                          <Image source={require('../../assets/new_knoc/withimg.svg')} style={styles.logo} />
                            <Text style={styles.versionLabel}>{appVersion}</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background, // Match light grayish background from design if customized in theme, otherwise white
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
        backgroundColor: colors.background,
        gap: 16,
    },
    backButton: { padding: 4 },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },

    // Scroll
    scroll: { flex: 1, backgroundColor: isDark ? '#000000' : '#F4F4F4' },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 48,
    },

    logo: {
        width: 150,
        height: 70,
        resizeMode: 'contain',
       
    },
    // Profile Row
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EBE5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: '#602CD9',
    },
    profileInfoText: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 18,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: isDark ? '#aaaaaa' : '#8E8E93',
    },

    // Section label
    sectionLabel: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
        marginBottom: 12,
        marginTop: 8,
    },

    // Cards
    cardGroup: {
        backgroundColor: colors.cardBg || (isDark ? '#1C1C1E' : '#FFFFFF'),
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    cardRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#2C2C2E' : '#F0F0F0',
    },
    cardRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        marginRight: 12,
        alignItems: 'flex-start',
    },
    cardRowText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
    },

    // Logo & Version
    footerContainer: {
        alignItems: 'center',
     
     
    },
    logoText: {
        fontSize: 20,
        fontFamily: 'Gilroy-Bold',
        letterSpacing: -0.5,
    },
    logoTextBlue: {
        color: '#3B5998', 
    },
    logoTextPurple: {
        color: '#602CD9',
    },
    versionLabel: {
        fontSize: 12,
        fontFamily: 'Gilroy-Medium',
        color: isDark ? '#98989E' : '#8E8E93',
    },
});

