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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/themeContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, limit } from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');
const LOGS_PER_PAGE = 10;

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
    visitorType: 'visitor' | 'delivery' | null;
    visitorName?: string;
    visitorPurpose?: string;
    deliveryApp?: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [activeKnock, setActiveKnock] = useState<ActiveKnock | null>(null);
    const [recentLogs, setRecentLogs] = useState<KnocLog[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [visibleLogCount, setVisibleLogCount] = useState(LOGS_PER_PAGE);
    const [linkedQrId, setLinkedQrId] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>('Home');
    const [userName, setUserName] = useState<string>('');
    const notificationListener = useRef<EventSubscription | undefined>(undefined);
    const responseListener = useRef<EventSubscription | undefined>(undefined);

    // Refs to avoid stale closures in notification listeners
    const routerRef = useRef(router);
    const linkedQrIdRef = useRef(linkedQrId);
    // Track the last notification response we handled to avoid double-navigation
    const lastHandledNotificationId = useRef<string | null>(null);
    // Guard against concurrent/duplicate fetches
    const fetchInProgressRef = useRef(false);
    useEffect(() => { routerRef.current = router; }, [router]);
    useEffect(() => { linkedQrIdRef.current = linkedQrId; }, [linkedQrId]);

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
                const q = query(
                    collection(db, 'qr_codes'),
                    where('phone_number', '==', `+91${guestPhone}`),
                    limit(1)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    // IMPORTANT: Use the Firestore document ID, not the qr_id data field.
                    // This ensures updateDoc(doc(db, ...)) calls work correctly.
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
    // NOTE: qrId is passed as a parameter, so no state deps needed
    const fetchRecentLogs = useCallback(async (qrId: string) => {
        const id = qrId;
        if (!id) return;
        // Prevent concurrent duplicate fetches
        if (fetchInProgressRef.current) {
            console.log('[Home] Fetch already in progress, skipping duplicate for qr_id:', id);
            return;
        }
        fetchInProgressRef.current = true;

        try {
            console.log('[Home] Fetching logs for qr_id:', id);
            const q = query(
                collection(db, 'knoc_logs'),
                where('qr_id', '==', id),
                limit(20)
            );
            const snapshot = await getDocs(q);

            console.log('[Home] Logs fetched, count:', snapshot.docs.length);

            let logs: KnocLog[] = snapshot.docs.map((docSnap: any) => {
                const d = docSnap.data();
                return {
                    id: docSnap.id,
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
        } catch (e: any) {
            console.error('[Home] Error fetching logs:', e);
            Alert.alert('Fetching Error', e.message);
        } finally {
            fetchInProgressRef.current = false;
        }
    }, []);

    // Handle Coming button press
    const handleComing = async () => {
        if (!activeKnock) return;

        try {
            await updateDoc(doc(db, 'knoc_logs', activeKnock.logId), {
                response: 'coming',
                responded_at: serverTimestamp(),
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
            await updateDoc(doc(db, 'knoc_logs', activeKnock.logId), {
                response: 'ignored',
                responded_at: serverTimestamp(),
            });

            setActiveKnock(null);
            if (linkedQrId) fetchRecentLogs(linkedQrId);
        } catch (e) {
            console.error('Error handling ignore:', e);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setVisibleLogCount(LOGS_PER_PAGE);
        const currentQrId = linkedQrIdRef.current;
        if (currentQrId) {
            await fetchRecentLogs(currentQrId);
        } else {
            const qrId = await loadLinkedQr();
            if (qrId) await fetchRecentLogs(qrId);
        }
        setRefreshing(false);
    }, [fetchRecentLogs, loadLinkedQr]);

    // Initialize: load QR, fetch logs, set up notification listeners
    useEffect(() => {
        const init = async () => {
            const qrId = await loadLinkedQr();
            if (qrId) {
                fetchRecentLogs(qrId);
            }
        };
        init();

        // Listen for notifications received while the app is in the foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                const data = notification.request.content.data;
                if (data?.logId && data?.qrId) {
                    const knockData = {
                        logId: data.logId as string,
                        qrId: data.qrId as string,
                        action: (data.action as string) || 'Alarm',
                        visitorType: (data.visitorType as string) || '',
                        visitorName: (data.visitorName as string) || '',
                        visitorPurpose: (data.visitorPurpose as string) || '',
                        deliveryApp: (data.deliveryApp as string) || '',
                        sentAt: new Date().toISOString(),
                    };
                    setActiveKnock({
                        logId: knockData.logId,
                        qrId: knockData.qrId,
                        action: knockData.action,
                        visitorType: (knockData.visitorType as 'visitor' | 'delivery') || null,
                        visitorName: knockData.visitorName,
                        visitorPurpose: knockData.visitorPurpose,
                        deliveryApp: knockData.deliveryApp,
                    });
                    // Auto-navigate to full-screen knock detail
                    routerRef.current.push({
                        pathname: '/knock-detail' as any,
                        params: knockData,
                    });
                    if (linkedQrIdRef.current) fetchRecentLogs(linkedQrIdRef.current);
                }
            }
        );

        // Listen for when user taps a notification (app was in background/killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const notificationId = response.notification.request.identifier;
                // Skip if this notification was already handled (e.g. by cold-start handler in _layout.tsx)
                if (lastHandledNotificationId.current === notificationId) {
                    console.log('[Home] Notification already handled, skipping:', notificationId);
                    return;
                }
                lastHandledNotificationId.current = notificationId;

                const data = response.notification.request.content.data;
                if (data?.logId && data?.qrId) {
                    const knockData = {
                        logId: data.logId as string,
                        qrId: data.qrId as string,
                        action: (data.action as string) || 'Alarm',
                        visitorType: (data.visitorType as string) || '',
                        visitorName: (data.visitorName as string) || '',
                        visitorPurpose: (data.visitorPurpose as string) || '',
                        deliveryApp: (data.deliveryApp as string) || '',
                        sentAt: new Date().toISOString(),
                    };
                    setActiveKnock({
                        logId: knockData.logId,
                        qrId: knockData.qrId,
                        action: knockData.action,
                        visitorType: (knockData.visitorType as 'visitor' | 'delivery') || null,
                        visitorName: knockData.visitorName,
                        visitorPurpose: knockData.visitorPurpose,
                        deliveryApp: knockData.deliveryApp,
                    });
                    routerRef.current.push({
                        pathname: '/knock-detail' as any,
                        params: knockData,
                    });
                    if (linkedQrIdRef.current) fetchRecentLogs(linkedQrIdRef.current);
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

    // Filter logs to only show today's entries
    const todayLogs = React.useMemo(() => {
        const today = new Date().toDateString();
        return recentLogs.filter(log => {
            if (!log.created_at) return false;
            return new Date(log.created_at).toDateString() === today;
        });
    }, [recentLogs]);

    // Derive stats from today's logs only
    const todayStats = React.useMemo(() => {
        const entry = todayLogs.filter(
            (l) => l.action === 'Entry' || l.response === 'coming'
        ).length;
        const exit = todayLogs.filter(
            (l) => l.action === 'No Entry' || l.response === 'ignored'
        ).length;
        return { entry, exit, total: todayLogs.length };
    }, [todayLogs]);

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
                <LinearGradient
                    colors={['#C0AAFF', '#CDBCFF', '#F3EFFF']}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.statsCard}
                >
                    {([
                        { label: 'Entry', value: todayStats.entry },
                        { label: 'Denied', value: todayStats.exit },
                        { label: 'Total', value: todayStats.total },
                    ] as const).map((item) => (
                        <View key={item.label} style={styles.statItem}>
                            <Text style={styles.statLabel}>{item.label}</Text>
                            <View style={styles.statValueBox}>
                                <View style={styles.statValueHighlight} />
                                <Text style={styles.statValue}>{padNumber(item.value)}</Text>
                            </View>
                        </View>
                    ))}
                </LinearGradient>



                {/* Today's KNOC */}
                <Text style={styles.sectionTitle}>Today's KNOC</Text>
                <View style={styles.visitList}>
                    {todayLogs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={32} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No knoc activity today</Text>
                        </View>
                    ) : (
                        <>
                            {todayLogs.slice(0, visibleLogCount).map((log) => (
                                <View
                                    key={log.id}
                                    style={styles.visitRow}
                                >
                                    <Text style={styles.visitLabel}>
                                        {log.action}
                                        {log.response ? ` → ${log.response}` : ''}
                                    </Text>
                                    <Text style={styles.visitTime}>
                                        Time {formatTime(log.created_at)}
                                    </Text>
                                </View>
                            ))}
                            {visibleLogCount < todayLogs.length && (
                                <TouchableOpacity
                                    style={styles.showMoreBtn}
                                    activeOpacity={0.7}
                                    onPress={() => setVisibleLogCount(prev => prev + LOGS_PER_PAGE)}
                                >
                                    <Text style={styles.showMoreText}>Show More</Text>
                                    <Ionicons name="chevron-down" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: colors.cardBg,
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
        borderTopColor: isDark ? '#2C2C2E' : '#EDE8FF',
        borderLeftColor: isDark ? '#3C3C3E' : '#E4DEFF',
        borderBottomColor: isDark ? '#5C5C5E' : '#9B87D8',
        borderRightColor: isDark ? '#4C4C4E' : '#B0A0E0',
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


    // Recently KNOC
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        marginBottom: 12,
    },
    visitList: {
        gap: 0,
    },
    visitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    visitLabel: {
        fontSize: 15,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
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

    // Show More
    showMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    showMoreText: {
        fontSize: 14,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.primary,
    },
});
