import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const recentVisits = [
    { id: '1', label: 'Visit 1', time: 'Time 2:25 PM' },
    { id: '2', label: 'Visit 1', time: 'Time 2:25 PM' },
    { id: '3', label: 'Visit 1', time: 'Time 2:25 PM' },
];

export default function HomeScreen() {
    const router = useRouter();
    const [knockResolved, setKnockResolved] = useState(false);

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
            >
                {/* Welcome */}
                <Text style={styles.welcomeText}>Welcome, Home Name</Text>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    {(['Entry', 'Exit', 'Total'] as const).map((label) => (
                        <View key={label} style={styles.statItem}>
                            <Text style={styles.statLabel}>{label}</Text>
                            <View style={styles.statValueBox}>
                                {/* Top highlight for 3D light source */}
                                <View style={styles.statValueHighlight} />
                                <Text style={styles.statValue}>01</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Knock Notification Banner */}
                {!knockResolved && (
                    <View style={styles.banner}>

                        <Image
                            source={require('../../assets/logo/Adobe Express - file1 2.png')}
                            style={styles.bannerPerson}
                            resizeMode="contain"
                        />

                        {/* Right — text + actions */}
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>Someone is at your door</Text>
                            <View style={styles.bannerActions}>
                                <TouchableOpacity
                                    style={styles.ignoreBtn}
                                    activeOpacity={0.8}
                                    onPress={() => setKnockResolved(true)}
                                >
                                    <Text style={styles.ignoreBtnText}>Ignore</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.comingBtn}
                                    activeOpacity={0.8}
                                    onPress={() => setKnockResolved(true)}
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
                    {recentVisits.map((visit) => (
                        <TouchableOpacity
                            key={visit.id}
                            style={styles.visitRow}
                            activeOpacity={0.75}
                        >
                            {/* Inner top-highlight for 3D light source illusion */}
                            <View style={styles.visitRowHighlight} />
                            <Text style={styles.visitLabel}>{visit.label}</Text>
                            <Text style={styles.visitTime}>{visit.time}</Text>
                        </TouchableOpacity>
                    ))}
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
        // 3D raised border effect — light top/left, dark bottom/right
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderTopColor: '#EDE8FF',
        borderLeftColor: '#E4DEFF',
        borderBottomColor: '#9B87D8',
        borderRightColor: '#B0A0E0',
        // Platform shadows
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
    personIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    packageIconCircle: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerContent: {
        flex: 1,
        gap: 12,
        marginLeft: 75,
    },
    bannerTitle: {
        fontSize: 15,
        fontFamily: 'Gilroy-SemiBold',
        color: '#FFFFFF',
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
        // 3D raised border effect — light top/left, dark bottom/right
        borderTopWidth: 1.5,
        borderLeftWidth: 1.5,
        borderBottomWidth: 2.5,
        borderRightWidth: 2.5,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#F0EEFF',
        borderBottomColor: '#C8C0E8',
        borderRightColor: '#D4CCF0',
        // Platform shadows
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
});
