import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../lib/themeContext';
import { Image } from 'expo-image';

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
            await firestore().collection('knoc_logs').doc(params.logId).update({
                response: 'coming',
                responded_at: firestore.FieldValue.serverTimestamp(),
            });
            router.back();
        } catch (e) {
            console.error('Error handling coming:', e);
            Alert.alert('Error', 'Failed to update response.');
        }
    };

    const handleIgnore = async () => {
        try {
            await firestore().collection('knoc_logs').doc(params.logId).update({
                response: 'ignored',
                responded_at: firestore.FieldValue.serverTimestamp(),
            });
            router.back();
        } catch (e) {
            console.error('Error handling ignore:', e);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.content}>
                <View style={styles.knockCard}>
                    {/* Card header — KNOC brand strip */}
                    <View style={styles.knockCardHeader}>
                        <View style={styles.headerTopRow}>
                            <Image
                                source={require('../assets/new_knoc/withimg.svg')}
                                style={styles.knockCardLogo}
                                contentFit="contain"
                            />
                            <Text style={styles.knockCardNow}>{elapsed}</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.knockCardTitle}>
                            {isDelivery ? 'Request Delivery' : 'Request Entry Visiting'}
                        </Text>
                    </View>

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

                    {/* Info rows */}
                    <View style={styles.knockInfoContainer}>
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
                                        {params.visitorName || 'Umesh Kumar'}
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
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 160,
    },
    knockCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'visible',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        paddingBottom: 24,
    },
    knockCardHeader: {
        backgroundColor: isDark ? '#2B2640' : '#EBE4FF', 
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 60,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    knockCardLogo: {
        width: 104,
        height: 24,
    },
    knockCardNow: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: '#6B7280',
    },
    knockCardTitle: {
        fontSize: 22,
        fontFamily: 'Gilroy-SemiBold',
        color: isDark ? '#FFFFFF' : '#111827',
        textAlign: 'center',
    },
    knockAvatarWrap: {
        alignSelf: 'center',
        width: 108,
        height: 108,
        borderRadius: 54,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        marginTop: -54,
        zIndex: 10,
    },
    knockAvatar: {
        width: '100%',
        height: '100%',
    },
    knockInfoContainer: {
        marginTop: 12,
        marginBottom: 24,
        alignSelf: 'center',
        gap: 8,
    },
    knockInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    knockInfoLabel: {
        fontSize: 18,
        fontFamily: 'Gilroy-Medium',
        color: '#9CA3AF',
        width: 70,
    },
    knockInfoValue: {
        fontSize: 18,
        fontFamily: 'Gilroy-Medium',
        color: isDark ? '#FFFFFF' : '#111827',
    },
    knockInfoAccess: {
        fontSize: 18,
        fontFamily: 'Gilroy-Medium',
        color: '#368955', 
    },
    knockDivider: {
        height: 1.5,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
    },
    knockBtnGroup: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    knockPrimaryBtn: {
        backgroundColor: '#35129B',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    knockPrimaryBtnText: {
        fontSize: 17,
        fontFamily: 'Gilroy-Medium',
        color: '#FFFFFF',
    },
    knockDeclineBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    knockDeclineBtnText: {
        fontSize: 17,
        fontFamily: 'Gilroy-Medium',
        color: '#B91C1C',
    },
});
