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
import { firestore } from '../../lib/firebase';
import { auth } from '../../lib/firebase';
import Constants from 'expo-constants';

const colors = {
    primary: '#431BB8',
    background: '#F2F2F7',
    cardBg: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    headerBorder: '#E5E5EA',
    separator: '#E5E5EA',
    avatarBg: '#EDE7FF',
    avatarIcon: '#7B5CF0',
    danger: '#FF3B30',
    noteText: '#6B6B6B',
    green: '#34C759',
};

interface UserInfo {
    name: string;
    phone: string;
    qrId: string;
    location: string;
}

export default function SettingsScreen() {
    const router = useRouter();
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
                const doc = await firestore()
                    .collection('qr_codes')
                    .doc(storedQrId)
                    .get();

                const data = doc.data();
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
                            await auth().signOut();
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

    const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
                <Ionicons name={icon as any} size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                    {value || '—'}
                </Text>
            </View>
        </View>
    );

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
                        {/* Profile Card */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarInitial}>
                                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {userInfo.name || 'Unknown User'}
                                </Text>
                                <Text style={styles.profilePhone} numberOfLines={1}>
                                    {userInfo.phone || 'No phone'}
                                </Text>
                            </View>
                        </View>

                        {/* Account Info */}
                        <Text style={styles.sectionLabel}>Account</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="call-outline"
                                label="Phone Number"
                                value={userInfo.phone}
                            />
                            <View style={styles.separator} />
                            <InfoRow
                                icon="person-outline"
                                label="Name"
                                value={userInfo.name}
                            />
                        </View>

                        {/* QR Info */}
                        <Text style={styles.sectionLabel}>Linked QR Code</Text>
                        <View style={styles.infoCard}>
                            <InfoRow
                                icon="qr-code-outline"
                                label="QR ID"
                                value={userInfo.qrId}
                            />
                            <View style={styles.separator} />
                            <InfoRow
                                icon="location-outline"
                                label="Location"
                                value={userInfo.location}
                            />
                        </View>

                        {/* QR Status Badge */}
                        {userInfo.qrId ? (
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>QR code is active and linked</Text>
                            </View>
                        ) : (
                            <View style={[styles.statusBadge, styles.statusBadgeWarn]}>
                                <Ionicons name="warning-outline" size={14} color="#B45309" />
                                <Text style={[styles.statusText, { color: '#B45309' }]}>
                                    No QR code linked yet
                                </Text>
                            </View>
                        )}

                        {/* Logout */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            activeOpacity={0.8}
                            disabled={loggingOut}
                        >
                            {loggingOut ? (
                                <ActivityIndicator color={colors.danger} />
                            ) : (
                                <>
                                    <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                                    <Text style={styles.logoutText}>Logout</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* App Version */}
                        <View style={styles.versionContainer}>
                            <Text style={styles.versionLabel}>KNOC · v{appVersion}</Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.headerBorder,
        gap: 10,
    },
    backButton: { padding: 2 },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 48,
    },

    // Profile card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 28,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.avatarBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: colors.avatarIcon,
    },
    profileName: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },
    profilePhone: {
        fontSize: 13,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
        marginTop: 2,
    },

    // Section label
    sectionLabel: {
        fontSize: 12,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMuted,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // Info card
    infoCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    infoIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0ECFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: { flex: 1 },
    infoLabel: {
        fontSize: 12,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },

    // Separator
    separator: {
        height: 1,
        backgroundColor: colors.separator,
        marginLeft: 60,
    },

    // Status badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E6F9EE',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 28,
    },
    statusBadgeWarn: {
        backgroundColor: '#FFFBEB',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.green,
    },
    statusText: {
        fontSize: 13,
        fontFamily: 'Gilroy-Medium',
        color: '#1A7A3A',
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFF0F0',
        borderRadius: 14,
        height: 54,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.danger,
    },

    // Version
    versionContainer: {
        alignItems: 'center',
        paddingTop: 4,
    },
    versionLabel: {
        fontSize: 13,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
});
