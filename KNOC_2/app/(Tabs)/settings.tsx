import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
                phone: guestPhone ? `+91 ${guestPhone}` : '',
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
                            : (guestPhone ? `+91 ${guestPhone}` : ''),
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
        // Format +919876543210 → +91 98765 43210
        const digits = phone.replace('+91', '').trim();
        if (digits.length === 10) {
            return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        return phone;
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

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.textMain} />
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
                                <Ionicons name="person-outline" size={24} color={colors.avatarIcon} />
                            </View>
                            <Text style={styles.profileName} numberOfLines={1}>
                                {userInfo.name || 'Your Name'}
                            </Text>
                        </View>

                        {/* Theme Section */}
                        <Text style={styles.sectionLabel}>Theme</Text>
                        <View style={styles.themeCard}>
                            {['Automatic', 'Light', 'Dark'].map((item, index, arr) => {
                                const isSelected = theme === item;
                                const isLast = index === arr.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.themeRow,
                                            !isLast && styles.themeRowBorder,
                                        ]}
                                        onPress={() => setTheme(item as any)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.themeRowText}>{item}</Text>
                                        <Ionicons
                                            name={isSelected ? 'checkmark-circle-outline' : 'ellipse-outline'}
                                            size={22}
                                            color={isSelected ? colors.primary : '#C7C7CC'}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.themeNote}>
                            Automatic is only supported on operating systems that allow you to control the system-wide color scheme
                        </Text>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            activeOpacity={0.8}
                            disabled={loggingOut}
                        >
                            {loggingOut ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : (
                                <Text style={styles.logoutText}>Logout</Text>
                            )}
                        </TouchableOpacity>

                        {/* App Version */}
                        <View style={styles.versionContainer}>
                            <Text style={styles.versionLabel}>App version</Text>
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
        backgroundColor: colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
        backgroundColor: colors.cardBg,
        gap: 16,
    },
    backButton: { padding: 2 },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 48,
    },

    // Profile Row
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.avatarProfileCircle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },

    // Section label
    sectionLabel: {
        fontSize: 15,
        fontFamily: 'Gilroy-Bold',
        color: isDark ? '#FFFFFF' : '#4A4A4A',
        marginBottom: 12,
    },

    // Theme card
    themeCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderMedium,
        overflow: 'hidden',
        marginBottom: 16,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    themeRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    themeRowText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
    },

    // Theme note
    themeNote: {
        fontSize: 12,
        fontFamily: 'Gilroy-Medium',
        color: isDark ? '#98989E' : '#1A1A1A',
        lineHeight: 16,
        marginBottom: 48,
        paddingRight: 20,
    },

    // Logout
    logoutButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderMedium,
        height: 48,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 14,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.primary,
    },

    // Version
    versionContainer: {
        alignItems: 'center',
        gap: 4,
    },
    versionLabel: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: isDark ? '#98989E' : '#4A4A4A',
    },
});
