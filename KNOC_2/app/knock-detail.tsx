import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { useTheme } from '../lib/themeContext';

export default function KnockDetailScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const params = useLocalSearchParams<{
        logId: string;
        qrId: string;
        action: string;
        visitorType: string;
        visitorName: string;
        visitorPurpose: string;
        deliveryApp: string;
        sentAt: string;
    }>();

    const visitorType = params.visitorType as 'visitor' | 'delivery' | null;
    const isDelivery = visitorType === 'delivery';

    // Live "X min ago" label
    const getElapsed = () => {
        if (!params.sentAt) return 'just now';
        const diffMs = Date.now() - new Date(params.sentAt).getTime();
        const diffMin = Math.floor(diffMs / 60_000);
        if (diffMin < 1) return 'just now';
        if (diffMin === 1) return '1 min ago';
        return `${diffMin} min ago`;
    };

    const [elapsed, setElapsed] = useState(getElapsed);

    useEffect(() => {
        // tick every 60 s so label stays accurate
        const interval = setInterval(() => setElapsed(getElapsed()), 60_000);
        return () => clearInterval(interval);
    }, [params.sentAt]);

    const handleComing = async () => {
        try {
            await updateDoc(doc(db, 'knoc_logs', params.logId), {
                response: 'coming',
                responded_at: serverTimestamp(),
            });
            router.back();
        } catch (e) {
            console.error('Error handling coming:', e);
            Alert.alert('Error', 'Failed to update response.');
        }
    };

    const handleIgnore = async () => {
        try {
            await updateDoc(doc(db, 'knoc_logs', params.logId), {
                response: 'ignored',
                responded_at: serverTimestamp(),
            });
            router.back();
        } catch (e) {
            console.error('Error handling ignore:', e);
        }
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
                <Text style={styles.headerTitle}>Knock Detail</Text>
            </View>

            {/* Card */}
            <View style={styles.content}>
                <View style={styles.knockCard}>

                    {/* Card header — KNOC brand strip */}
                    <View style={styles.knockCardHeader}>
                        <Image
                            source={require('../assets/logo/Group 1171275857.png')}
                            style={styles.knockCardLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.knockCardNow}>{elapsed}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.knockCardTitle}>
                        {isDelivery ? 'Request Delivery' : 'Request Entry Visiting'}
                    </Text>

                    {/* Circular avatar */}
                    <View style={styles.knockAvatarWrap}>
                        <Image
                            source={
                                isDelivery
                                    ? require('../assets/logo/Ellipse 1174 (1).png')
                                    : require('../assets/logo/Ellipse 1174.png')
                            }
                            style={styles.knockAvatar}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Divider */}
                    <View style={styles.knockDivider} />

                    {/* Info rows */}
                    <View style={styles.knockInfoRows}>
                        {isDelivery ? (
                            <>
                                <View style={styles.knockInfoRow}>
                                    <Text style={styles.knockInfoLabel}>Order:</Text>
                                    <Text style={styles.knockInfoValue}>
                                        {params.deliveryApp || 'Delivery'}
                                    </Text>
                                </View>
                                <View style={styles.knockInfoRow}>
                                    <Text style={styles.knockInfoLabel}>Access:</Text>
                                    <Text style={styles.knockInfoAccess}>Scan Approved</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.knockInfoRow}>
                                    <Text style={styles.knockInfoLabel}>Name:</Text>
                                    <Text style={styles.knockInfoValue}>
                                        {params.visitorName || 'Visitor'}
                                    </Text>
                                </View>
                                <View style={styles.knockInfoRow}>
                                    <Text style={styles.knockInfoLabel}>Purpose:</Text>
                                    <Text style={styles.knockInfoValue}>
                                        {params.visitorPurpose || 'Visit'}
                                    </Text>
                                </View>
                                <View style={styles.knockInfoRow}>
                                    <Text style={styles.knockInfoLabel}>Access:</Text>
                                    <Text style={styles.knockInfoAccess}>Scan Approved</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.knockDivider} />

                    {/* Action buttons */}
                    <View style={styles.knockBtnGroup}>
                        <TouchableOpacity
                            style={styles.knockPrimaryBtn}
                            activeOpacity={0.85}
                            onPress={handleComing}
                        >
                            <Text style={styles.knockPrimaryBtnText}>
                                {isDelivery ? 'Leave Door' : 'Open Door'}
                            </Text>
                        </TouchableOpacity>
                        {!isDelivery && (
                            <TouchableOpacity
                                style={styles.knockDeclineBtn}
                                activeOpacity={0.85}
                                onPress={handleIgnore}
                            >
                                <Text style={styles.knockDeclineBtnText}>Decline</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    knockCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 6,
    },
    knockCardHeader: {
        backgroundColor: isDark ? '#2B2640' : '#EDE9FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 48,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    knockCardLogo: {
        width: 90,
        height: 26,
    },
    knockCardNow: {
        fontSize: 12,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
    knockCardTitle: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        textAlign: 'center',
        marginTop: -28,
        marginBottom: 0,
        paddingHorizontal: 16,
        zIndex: 2,
    },
    knockAvatarWrap: {
        alignSelf: 'center',
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: isDark ? '#433B6B' : '#D8D0F8',
        overflow: 'hidden',
        marginTop: 12,
        marginBottom: 24,
        borderWidth: 3,
        borderColor: colors.cardBg,
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },
    knockAvatar: {
        width: '100%',
        height: '100%',
    },
    knockDivider: {
        height: 1,
        backgroundColor: colors.separator,
        marginHorizontal: 16,
    },
    knockInfoRows: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 12,
    },
    knockInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    knockInfoLabel: {
        fontSize: 15,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
        width: 65,
    },
    knockInfoValue: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },
    knockInfoAccess: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: '#34C759',
    },
    knockBtnGroup: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        gap: 12,
    },
    knockPrimaryBtn: {
        backgroundColor: '#431BB8',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    knockPrimaryBtnText: {
        fontSize: 17,
        fontFamily: 'Gilroy-Bold',
        color: '#FFFFFF',
    },
    knockDeclineBtn: {
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.separator,
    },
    knockDeclineBtnText: {
        fontSize: 17,
        fontFamily: 'Gilroy-SemiBold',
        color: '#E53935',
    },
});
