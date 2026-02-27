import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../../lib/firebase';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

const { width } = Dimensions.get('window');

const colors = {
    primary: '#431BB8',
    primaryLight: '#7B5CF0',
    background: '#F2F2F7',
    cardBg: '#FFFFFF',
    statsBg: '#EDE9FF',
    statsCard: '#DDDAFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    textPrimary: '#431BB8',
    ignore: '#E53935',
    coming: '#43A047',
    bannerGradientStart: '#431BB8',
    bannerGradientEnd: '#8B5CF6',
    separator: '#E5E5EA',
};

interface KnocLog {
    id: string;
    qr_id: string;
    action: string;
    response: string | null;
    responded_at: string | null;
    created_at: string;
}

interface ActiveKnock {
    logId: string;
    qrId: string;
    action: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const [activeKnock, setActiveKnock] = useState<ActiveKnock | null>(null);
    const [recentLogs, setRecentLogs] = useState<KnocLog[]>([]);
    const [stats, setStats] = useState({ entry: 0, exit: 0, total: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [linkedQrId, setLinkedQrId] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>('Home');
    const [userName, setUserName] = useState<string>('');
    const notificationListener = useRef<EventSubscription | undefined>(undefined);
    const responseListener = useRef<EventSubscription | undefined>(undefined);

    // Load name + QR ID from AsyncStorage (set during onboarding) and sync from DB if needed
    const loadLinkedQr = useCallback(async () => {
        try {
            // Fast path: read from AsyncStorage first (set during onboarding)
            const [[, cachedName], [, cachedQrId]] = await AsyncStorage.multiGet([
                'user_name',
                'linked_qr_id',
            ]);

            if (cachedName) setUserName(cachedName);
            if (cachedQrId) {
                setLinkedQrId(cachedQrId);
                return cachedQrId;
            }

            // Fallback: query Firestore by phone number if AsyncStorage has no QR ID
            const guestPhone = await AsyncStorage.getItem('guest_phone');

            let qrId: string | null = null;

            if (!qrId && guestPhone) {
                const snapshot = await firestore()
                    .collection('qr_codes')
                    .where('phone_number', '==', `+91${guestPhone}`)
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    // IMPORTANT: Use the Firestore document ID, not the qr_id data field.
                    // This ensures .doc(qrId).update() calls work correctly.
                    const docId = snapshot.docs[0].id;
                    qrId = docId;
                    setLocationName(data.location || 'Home');
                    if (data.name) { setUserName(data.name); await AsyncStorage.setItem('user_name', data.name); }
                    await AsyncStorage.setItem('linked_qr_id', docId);
                    console.log('[Home] Linked QR resolved from Firestore. Doc ID:', docId);
                }
            }

            setLinkedQrId(qrId);
            return qrId;
        } catch (e) {
            console.error('Error loading linked QR:', e);
            return null;
        }
    }, []);

    // Fetch recent knoc logs from Firestore
    const fetchRecentLogs = useCallback(async (qrId: string) => {
        const id = qrId;
        if (!id) return;

        try {
            console.log('[Home] Fetching logs for qr_id:', id);
            const snapshot = await firestore()
                .collection('knoc_logs')
                .where('qr_id', '==', id)
                .limit(20)
                .get();

            console.log('[Home] Logs fetched, count:', snapshot.docs.length);

            let logs: KnocLog[] = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    qr_id: d.qr_id,
                    action: d.action,
                    response: d.response || null,
                    responded_at: d.responded_at?.toDate?.()?.toISOString() || d.responded_at || null,
                    created_at: d.created_at?.toDate?.()?.toISOString() || d.created_at || '',
                };
            });

            logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            console.log('[Home] Parsed logs:', logs);
            setRecentLogs(logs);

            // Compute stats
            const entryCount = logs.filter(
                (l: KnocLog) => l.action === 'Entry' || l.response === 'coming'
            ).length;
            const exitCount = logs.filter(
                (l: KnocLog) => l.action === 'No Entry' || l.response === 'ignored'
            ).length;

            setStats({
                entry: entryCount,
                exit: exitCount,
                total: logs.length,
            });
        } catch (e: any) {
            console.error('[Home] Error fetching logs:', e);
            Alert.alert('Fetching Error', e.message);
        }
    }, [linkedQrId]);

    // Handle Coming button press
    const handleComing = async () => {
        if (!activeKnock) return;

        try {
            await firestore()
                .collection('knoc_logs')
                .doc(activeKnock.logId)
                .update({
                    response: 'coming',
                    responded_at: firestore.FieldValue.serverTimestamp(),
                });

            setActiveKnock(null);
            // Refresh the logs and stats
            if (linkedQrId) fetchRecentLogs(linkedQrId);
        } catch (e) {
            console.error('Error handling coming:', e);
            Alert.alert('Error', 'Failed to update response.');
        }
    };

    // Handle Ignore button press
    const handleIgnore = async () => {
        if (!activeKnock) return;

        try {
            await firestore()
                .collection('knoc_logs')
                .doc(activeKnock.logId)
                .update({
                    response: 'ignored',
                    responded_at: firestore.FieldValue.serverTimestamp(),
                });

            setActiveKnock(null);
            if (linkedQrId) fetchRecentLogs(linkedQrId);
        } catch (e) {
            console.error('Error handling ignore:', e);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (linkedQrId) {
            await fetchRecentLogs(linkedQrId);
        } else {
            const qrId = await loadLinkedQr();
            if (qrId) await fetchRecentLogs(qrId);
        }
        setRefreshing(false);
    }, [linkedQrId]);

    // Initialize: load QR, fetch logs, set up notification listeners
    useEffect(() => {
        const init = async () => {
            const qrId = await loadLinkedQr();
            if (qrId) {
                fetchRecentLogs(qrId);

                // Re-register FCM token on app load to ensure DB has the latest token
                try {
                    console.log('[Home] Requesting FCM token for doc:', qrId);
                    const pushToken = await registerForPushNotificationsAsync();
                    if (pushToken) {
                        await firestore()
                            .collection('qr_codes')
                            .doc(qrId)
                            .update({ fcm_token: pushToken });
                        console.log('[Home] FCM token renewed successfully for doc:', qrId);
                    } else {
                        console.warn('[Home] No FCM token returned. Notifications may not work.');
                    }
                } catch (e) {
                    console.error('[Home] Failed to renew FCM token:', e);
                }
            }
        };
        init();

        // Listen for notifications received while the app is in the foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                const data = notification.request.content.data;
                if (data?.logId && data?.qrId) {
                    setActiveKnock({
                        logId: data.logId as string,
                        qrId: data.qrId as string,
                        action: (data.action as string) || 'Alarm',
                    });
                    // Refresh logs when a new notification comes in
                    if (linkedQrId) fetchRecentLogs(linkedQrId);
                }
            }
        );

        // Listen for when user taps a notification (app was in background/killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                if (data?.logId && data?.qrId) {
                    setActiveKnock({
                        logId: data.logId as string,
                        qrId: data.qrId as string,
                        action: (data.action as string) || 'Alarm',
                    });
                    if (linkedQrId) fetchRecentLogs(linkedQrId);
                }
            }
        );

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    // Format time for display
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        if (isToday) return 'Today';

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    // Get action icon
    const getActionIcon = (action: string, response: string | null) => {
        if (response === 'coming') return '✅';
        if (response === 'ignored') return '❌';
        if (action === 'Entry') return '🚪';
        if (action === 'No Entry') return '🚫';
        return '🔔';
    };

    // Pad number like "01", "12"
    const padNumber = (n: number) => n.toString().padStart(2, '0');

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo/Group 1171275857.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="person-circle-outline" size={30} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Welcome */}
                <Text style={styles.welcomeText}>Welcome, {userName || locationName}</Text>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    {([
                        { label: 'Entry', value: stats.entry },
                        { label: 'Denied', value: stats.exit },
                        { label: 'Total', value: stats.total },
                    ] as const).map((item) => (
                        <View key={item.label} style={styles.statItem}>
                            <Text style={styles.statLabel}>{item.label}</Text>
                            <View style={styles.statValueBox}>
                                <View style={styles.statValueHighlight} />
                                <Text style={styles.statValue}>{padNumber(item.value)}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Knock Notification Banner */}
                {activeKnock && (
                    <View style={styles.banner}>

                        <Image
                            source={require('../../assets/logo/Adobe Express - file1 2.png')}
                            style={styles.bannerPerson}
                            resizeMode="contain"
                        />

                        {/* Right — text + actions */}
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>Someone is at your door</Text>
                            <Text style={styles.bannerSubtitle}>
                                Action: {activeKnock.action}
                            </Text>
                            <View style={styles.bannerActions}>
                                <TouchableOpacity
                                    style={styles.ignoreBtn}
                                    activeOpacity={0.8}
                                    onPress={handleIgnore}
                                >
                                    <Text style={styles.ignoreBtnText}>Ignore</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.comingBtn}
                                    activeOpacity={0.8}
                                    onPress={handleComing}
                                >
                                    <Text style={styles.comingBtnText}>Coming</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Recently KNOC */}
                <Text style={styles.sectionTitle}>Recently KNOC</Text>
                <View style={styles.visitList}>
                    {recentLogs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={32} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No knoc activity yet</Text>
                        </View>
                    ) : (
                        recentLogs.map((log) => (
                            <TouchableOpacity
                                key={log.id}
                                style={styles.visitRow}
                                activeOpacity={0.75}
                            >
                                <View style={styles.visitRowHighlight} />
                                <View style={styles.visitLeft}>
                                    <Text style={styles.visitIcon}>
                                        {getActionIcon(log.action, log.response)}
                                    </Text>
                                    <View>
                                        <Text style={styles.visitLabel}>
                                            {log.action}
                                            {log.response ? ` → ${log.response}` : ''}
                                        </Text>
                                        <Text style={styles.visitDate}>
                                            {formatDate(log.created_at)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.visitTime}>
                                    {formatTime(log.created_at)}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.background,
    },
    logo: {
        width: 110,
        height: 32,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
    },

    // Welcome
    welcomeText: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        marginBottom: 16,
    },

    // Stats Card
    statsCard: {
        backgroundColor: colors.statsBg,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
        marginBottom: 20,
        gap: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 10,
    },
    statLabel: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textPrimary,
    },
    statValueBox: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.statsCard,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderTopColor: '#EDE8FF',
        borderLeftColor: '#E4DEFF',
        borderBottomColor: '#9B87D8',
        borderRightColor: '#B0A0E0',
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },
    statValueHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    statValue: {
        fontSize: 36,
        fontFamily: 'Gilroy-Bold',
        color: colors.primary,
    },

    // Banner
    banner: {
        backgroundColor: colors.bannerGradientStart,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 28,
        gap: 14,
        overflow: 'hidden',
    },
    bannerPerson: {
        width: 85,
        height: 125,
        left: 5,
        top: 3,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
    },
    bannerContent: {
        flex: 1,
        gap: 8,
        marginLeft: 75,
    },
    bannerTitle: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 12,
        fontFamily: 'Gilroy-Regular',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    bannerActions: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
    },
    ignoreBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    ignoreBtnText: {
        fontSize: 14,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.ignore,
    },
    comingBtn: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.coming,
        paddingVertical: 8,
        alignItems: 'center',
    },
    comingBtnText: {
        fontSize: 14,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.coming,
    },

    // Recently KNOC
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        marginBottom: 12,
    },
    visitList: {
        gap: 10,
    },
    visitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderTopWidth: 1.5,
        borderLeftWidth: 1.5,
        borderBottomWidth: 2.5,
        borderRightWidth: 2.5,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#F0EEFF',
        borderBottomColor: '#C8C0E8',
        borderRightColor: '#D4CCF0',
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 4,
    },
    visitRowHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    visitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    visitIcon: {
        fontSize: 20,
    },
    visitLabel: {
        fontSize: 15,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
    },
    visitDate: {
        fontSize: 12,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
        marginTop: 2,
    },
    visitTime: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
});
