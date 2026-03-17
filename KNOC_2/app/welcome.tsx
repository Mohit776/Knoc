import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, IconSize, FontFamily } from '../lib/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const { width, height } = Dimensions.get('window');

// Color palette from design system
const colors = {
    primary: '#431BB8',
    secondary: '#926FF3',
    background: '#8875F4',
    cardBg: '#431BB8',
    white: '#FFFFFF',
    subtleWhite: 'rgba(255,255,255,0.75)',
    wavePurple: '#6541ED',
};




export default function KnocWelcomeScreen() {
    const router = useRouter();
    const [scannerVisible, setScannerVisible] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const handleOpenScanner = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please allow camera access to scan QR codes.',
                );
                return;
            }
        }
        setScanned(false);
        setScannerVisible(true);
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        setScannerVisible(false);

        // Extract QR ID from URL like https://knoc.vercel.app/qr/KNOD37C892AE8
        let qrId = data;
        try {
            const url = new URL(data);
            const pathParts = url.pathname.split('/').filter(Boolean);
            // Expect path like /qr/KNOD37C892AE8
            if (pathParts.length >= 2 && pathParts[0] === 'qr') {
                qrId = pathParts[1];
            } else if (pathParts.length >= 1) {
                // Fallback: use last path segment
                qrId = pathParts[pathParts.length - 1];
            }
        } catch {
            // If data is not a valid URL, use it directly as the ID
            qrId = data;
        }

        router.replace({ pathname: '/onboard-qr', params: { qr_id: qrId } });
    };
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(120, [
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(waveAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const cardTranslate = cardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <View style={styles.container}>

                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <Image
                        source={require('../assets/new_knoc/wordlogo.svg')}
                        style={{ width: width * 0.45, height: vs(45) }}
                        contentFit="contain"
                    />
                </Animated.View>

                {/* QR Card */}
                <AnimatedTouchable
                    activeOpacity={0.85}
                    onPress={handleOpenScanner}
                    style={[
                        styles.card,
                        {
                            opacity: cardAnim,
                            transform: [{ translateY: cardTranslate }],
                        },
                    ]}
                >
                    <Image
                        source={require('../assets/logo/Group 90.png')}
                        style={{ width: width * 0.25, height: vs(55) }}
                        contentFit="contain"
                    />
                    <Text style={styles.cardTitle}>Onboard Your QR Code</Text>
                    <Text style={styles.cardSubtitle}>Tap here to scan your QR Code to onboard</Text>
                </AnimatedTouchable>

                {/* Wave bottom shape */}

                <Image
                    source={require('../assets/logo/Rectangle.png')}
                    style={{ width: width, height: vs(400), marginTop: vs(50) }}
                    contentFit="contain"
                />

                {/* Footer */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <Text style={styles.footerText}>Simple | Secure | Pass</Text>
                </Animated.View>
            </View>

            {/* QR Scanner Modal */}
            <Modal
                visible={scannerVisible}
                animationType="slide"
                statusBarTranslucent
                onRequestClose={() => setScannerVisible(false)}
            >
                <SafeAreaView style={styles.scannerSafeArea}>
                    <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                    {/* Header */}
                    <View style={styles.scannerHeader}>
                        <TouchableOpacity
                            onPress={() => setScannerVisible(false)}
                            style={styles.scannerBackButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.scannerBackArrow}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.scannerHeaderTitle}>Onboard Your QR Code</Text>
                        <View style={{ width: s(40) }} />
                    </View>

                    {/* Camera + Viewfinder */}
                    <View style={styles.scannerBody}>
                        <View style={styles.viewfinderWrapper}>
                            {/* Live camera feed clipped to the viewfinder square */}
                            <CameraView
                                style={StyleSheet.absoluteFillObject}
                                facing="back"
                                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            />
                            {/* Purple corner brackets */}
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                    </View>

                    {/* Bottom branding */}
                    <View style={styles.scannerFooter}>
                        <Image
                            source={require('../assets/new_knoc/logo_gull.svg')}
                            style={{ width: s(110), height: vs(32) }}
                            contentFit="contain"
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: Spacing.xl,
    },

    // Logo
    logoContainer: {
        marginTop: height * 0.08,
        marginBottom: height * 0.06,
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(8),
    },
    logoIcon: {
        fontSize: ms(28),
        color: colors.white,
        fontFamily: FontFamily.bold,
    },
    logoText: {
        fontSize: ms(30),
        color: colors.white,
        fontFamily: FontFamily.extraBold,
        letterSpacing: 4,
    },

    // Card
    card: {
        width: '100%',
        backgroundColor: colors.cardBg,
        borderRadius: Radius.xxl,
        paddingVertical: VSpacing.xxl,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        shadowColor: '#1a0050',
        shadowOffset: { width: 0, height: vs(12) },
        shadowOpacity: 0.4,
        shadowRadius: ms(24),
        elevation: 12,
    },
    cardTitle: {
        ...Typography.cardTitle,
        color: colors.white,
        marginTop: VSpacing.lg,
        letterSpacing: 0.3,
    },
    cardSubtitle: {
        ...Typography.cardSubtitle,
        color: colors.subtleWhite,
        marginTop: vs(6),
        textAlign: 'center',
    },

    // QR Code
    qrContainer: {
        width: s(90),
        height: s(90),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    qrFrame: {
        width: s(80),
        height: s(80),
        borderWidth: 2,
        borderColor: colors.white,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: s(8),
    },
    qrCornerTL: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: s(18),
        height: s(18),
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerTR: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: s(18),
        height: s(18),
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerBL: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: s(18),
        height: s(18),
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerBR: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: s(18),
        height: s(18),
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrDotGrid: {
        gap: s(3),
    },
    qrRow: {
        flexDirection: 'row',
        gap: s(3),
    },
    qrDot: {
        width: s(6),
        height: s(6),
        borderRadius: 1,
    },
    qrDotFilled: {
        backgroundColor: colors.white,
    },
    qrDotEmpty: {
        backgroundColor: 'transparent',
    },
    scanLine: {
        position: 'absolute',
        left: s(8),
        right: s(8),
        top: '50%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 1,
    },

    // Wave
    waveWrapper: {
        position: 'absolute',
        bottom: vs(60),
        left: s(-60),
        right: s(-60),
        alignItems: 'center',
    },
    waveEllipse: {
        width: width + s(120),
        height: vs(340),
        backgroundColor: colors.wavePurple,
        borderRadius: (width + s(120)) / 2,
        opacity: 0.55,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: vs(36),
        alignItems: 'center',
    },
    footerText: {
        ...Typography.captionMedium,
        fontSize: ms(13),
        color: colors.subtleWhite,
        letterSpacing: 1.5,
    },

    // Scanner Modal
    scannerSafeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        minHeight: vs(56),
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        backgroundColor: '#fff',
    },
    scannerBackButton: {
        width: s(40),
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    scannerBackArrow: {
        fontSize: ms(24),
        color: '#1A1A1A',
        lineHeight: ms(28),
    },
    scannerHeaderTitle: {
        ...Typography.headerTitle,
        fontSize: ms(17),
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },
    scannerBody: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: vs(60),
    },
    viewfinderWrapper: {
        width: width * 0.78,
        height: width * 0.78,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        backgroundColor: '#F0EFF8',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: s(36),
        height: s(36),
        zIndex: 10,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.primary,
        borderTopLeftRadius: Radius.lg,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.primary,
        borderTopRightRadius: Radius.lg,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.primary,
        borderBottomLeftRadius: Radius.lg,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.primary,
        borderBottomRightRadius: Radius.lg,
    },
    scannerFooter: {
        position: 'absolute',
        bottom: vs(48),
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scannerBrand: {
        ...Typography.cardTitle,
        color: colors.primary,
        fontStyle: 'italic',
        letterSpacing: 0.5,
    },
});