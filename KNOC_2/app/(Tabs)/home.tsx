import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/themeContext';
import firestore from '@react-native-firebase/firestore';
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, IconSize } from '../../lib/typography';

const LOGS_PER_PAGE = 10;

interface KnocLog {
    id: string;
    qr_id: string;
    action: string;
    response: string | null;
    responded_at: string | null;
    created_at: string;
    visitorType: 'visitor' | 'delivery' | null;
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
                const snapshot = await firestore()
                    .collection('qr_codes')
                    .where('phone_number', '==', `+91${guestPhone}`)
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
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
        if (fetchInProgressRef.current) {
            console.log('[Home] Fetch already in progress, skipping duplicate for qr_id:', id);
            return;
        }
        fetchInProgressRef.current = true;

        try {
            console.log('[Home] Fetching logs for qr_id:', id);
            const snapshot = await firestore()
                .collection('knoc_logs')
                .where('qr_id', '==', id)
                .limit(20)
                .get();

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
                    visitorType: d.visitor_type || null,
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
            await firestore().collection('knoc_logs').doc(activeKnock.logId).update({
                response: 'coming',
                responded_at: firestore.FieldValue.serverTimestamp(),
            });

            setActiveKnock(null);
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
            await firestore().collection('knoc_logs').doc(activeKnock.logId).update({
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



    // Pad number like "01", "12"
    const padNumber = (n: number) => n.toString().padStart(2, '0');

    // Filter logs to only show today and yesterday's entries
    const displayLogs = React.useMemo(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();

        return recentLogs.filter(log => {
            if (!log.created_at) return false;
            const logDateStr = new Date(log.created_at).toDateString();
            return logDateStr === todayStr || logDateStr === yesterdayStr;
        });
    }, [recentLogs]);

    // Derive stats from display logs (today & yesterday)
    const displayStats = React.useMemo(() => {
        const entry = displayLogs.filter(
            (l) => l.action === 'Entry' || l.response === 'coming'
        ).length;
        const exit = displayLogs.filter(
            (l) => l.action === 'No Entry' || l.response === 'ignored'
        ).length;
        return { entry, exit, total: displayLogs.length };
    }, [displayLogs]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/new_knoc/logo_gull.svg')}
                    style={styles.logo}
                    contentFit="contain"
                />
                <TouchableOpacity onPress={() => router.push('/(Tabs)/settings')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Image
                        source={require('../../assets/new_knoc/ICON.svg')}
                        style={styles.profile}
                        contentFit="contain"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.divider} />
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
                <Text style={styles.welcomeText} numberOfLines={1} ellipsizeMode="tail">
                    Welcome, {userName || locationName}
                </Text>

                {/* Stats Card */}
                <LinearGradient
                    colors={isDark ? ['#4A3F7A', '#3B3666', '#2C2A40'] : ['#C0AAFF', '#CDBCFF', '#F3EFFF']}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.statsCard}
                >
                    {([
                        { label: 'Entry', value: displayStats.entry },
                        { label: 'Denied', value: displayStats.exit },
                        { label: 'Total', value: displayStats.total },
                    ] as const).map((item) => (
                        <View key={item.label} style={styles.statItem}>
                            <Text style={styles.statLabel}>{item.label}</Text>
                            <LinearGradient colors={isDark ? ['#3B3666', '#5A3F9E', '#7B5CF0'] : ['#F9F8FF', '#C3B5FD', '#8060F1']}
                                locations={[0, 0.5, 1]}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.statValueBox}>
                                <View style={styles.statValueHighlight} >
                                    <Text style={styles.statValue}>{padNumber(item.value)}</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    ))}
                </LinearGradient>



                {/* Recently KNOC */}
                <Text style={styles.sectionTitle}>Recently KNOC</Text>
                <View style={styles.visitList}>
                    {displayLogs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={IconSize.xl} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No recent knoc activity</Text>
                        </View>
                    ) : (
                        <>
                            {displayLogs.slice(0, visibleLogCount).map((log, index) => {
                                const isDenied = log.action === 'No Entry' || log.response === 'ignored' || log.response === 'declined';
                                return (
                                    <View
                                        key={log.id}
                                        style={[styles.visitRow, isDenied && styles.visitRowDenied]}
                                    >
                                        <Text style={styles.visitLabel} numberOfLines={1} ellipsizeMode="tail">
                                            {isDenied 
                                                ? 'Not Approved' 
                                                : (log.visitorType === 'delivery' ? 'Delivery Parcel' : 'Visitor')}
                                        </Text>
                                        <Text style={styles.visitTime} numberOfLines={1}>
                                            {formatDate(log.created_at)}, {formatTime(log.created_at)}
                                        </Text>
                                    </View>
                                );
                            })}
                            {visibleLogCount < displayLogs.length && (
                                <TouchableOpacity
                                    style={styles.showMoreBtn}
                                    activeOpacity={0.7}
                                    onPress={() => setVisibleLogCount(prev => prev + LOGS_PER_PAGE)}
                                >
                                    <Text style={styles.showMoreText}>Show More</Text>
                                    <Ionicons name="chevron-down" size={IconSize.sm} color={colors.primary} />
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
        backgroundColor: isDark ? '#000000' : '#ffffff',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: VSpacing.md,
        backgroundColor: colors.cardBg,
    },
    logo: {
        width: s(110),
        height: vs(32),
    },
    profile: {
        width: s(30),
        height: s(30),
    },
    divider: {
        height: 1,
        backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0',
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: VSpacing.xxs,
        paddingBottom: VSpacing.xxl,
    },

    // Welcome
    welcomeText: {
        ...Typography.heading,
        color: colors.textMain,
        marginBottom: VSpacing.md,
        marginTop: VSpacing.xs,
    },

    // Stats Card
    statsCard: {
        borderRadius: Radius.xl,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: vs(14),
        paddingHorizontal: s(20),
        marginBottom: VSpacing.lg,
        gap: s(10),
        paddingBottom: vs(20),
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: vs(6),
    },
    statLabel: {
        ...Typography.title,
        fontSize: ms(14),
        fontFamily: 'Gilroy-ExtraBold',
        color: colors.textPrimary,
    },
    statValueBox: {
        width: '90%',
        aspectRatio: 1,
        borderRadius: Radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#3B3666' : '#D9CFFF',
    },
    statValueHighlight: {
        width: '96%',
        height: '96%',
        borderRadius: Radius.lg,
        position: 'absolute',
        top: 1,
        left: 1,
        backgroundColor: isDark ? '#2C2A40' : '#D9CFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    statValue: {
        ...Typography.stat,
        fontSize: ms(34),
        color: colors.primary,
    },

    // Recently KNOC
    sectionTitle: {
        ...Typography.subheading,
        color: colors.textMain,
        marginBottom: VSpacing.xs,
        marginLeft: Spacing.xs,
    },
    visitList: {
        gap: 0,
    },
    visitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: VSpacing.md,
        backgroundColor: colors.cardBg,
        borderRadius: Radius.lg,
        marginHorizontal: s(4),
        marginVertical: vs(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    visitRowDenied: {
        backgroundColor: isDark ? '#5C2D2D' : '#F5C1C1',
    },
    visitLabel: {
        ...Typography.bodyMedium,
        fontSize: ms(15),
        color: colors.textMain,
        flex: 1,
        marginRight: Spacing.xs,
    },
    visitTime: {
        ...Typography.body,
        color: colors.textMain,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: VSpacing.xxxl,
        gap: vs(10),
    },
    emptyText: {
        ...Typography.body,
        color: colors.textMuted,
    },

    // Show More
    showMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: VSpacing.md,
        gap: s(6),
    },
    showMoreText: {
        ...Typography.buttonSmall,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.primary,
    },
});
