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
                        style={{ width: width * 0.45, height: 45, marginTop: 0 }}
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
                        style={{ width: width * 0.25, height: 55, marginTop: 0 }}
                        contentFit="contain"
                    />
                    <Text style={styles.cardTitle}>Onboard Your QR Code</Text>
                    <Text style={styles.cardSubtitle}>Tap here to scan your QR Code to onboard</Text>
                </AnimatedTouchable>

                {/* Wave bottom shape */}

                <Image
                    source={require('../assets/logo/Rectangle.png')}
                    style={{ width: width * 1, height: 450, marginTop: 50 }}
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
                        <View style={{ width: 40 }} />
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
                            style={{ width: 110, height: 32 }}
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
        paddingHorizontal: 24,
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
        gap: 8,
    },
    logoIcon: {
        fontSize: 28,
        color: colors.white,
        fontFamily: 'Gilroy-Bold',
    },
    logoText: {
        fontSize: 30,
        color: colors.white,
        fontFamily: 'Gilroy-ExtraBold',
        letterSpacing: 4,
    },

    // Card
    card: {
        width: '100%',
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#1a0050',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'Gilroy-Bold',
        color: colors.white,
        marginTop: 20,
        letterSpacing: 0.3,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.subtleWhite,
        marginTop: 6,
        textAlign: 'center',
    },

    // QR Code
    qrContainer: {
        width: 90,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    qrFrame: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderColor: colors.white,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: 8,
    },
    qrCornerTL: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 18,
        height: 18,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerTR: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 18,
        height: 18,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerBL: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 18,
        height: 18,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrCornerBR: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.white,
        borderRadius: 3,
    },
    qrDotGrid: {
        gap: 3,
    },
    qrRow: {
        flexDirection: 'row',
        gap: 3,
    },
    qrDot: {
        width: 6,
        height: 6,
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
        left: 8,
        right: 8,
        top: '50%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 1,
    },

    // Wave
    waveWrapper: {
        position: 'absolute',
        bottom: 60,
        left: -60,
        right: -60,
        alignItems: 'center',
    },
    waveEllipse: {
        width: width + 120,
        height: 340,
        backgroundColor: colors.wavePurple,
        borderRadius: (width + 120) / 2,
        opacity: 0.55,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 36,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        fontFamily: 'Gilroy-Medium',
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
        paddingHorizontal: 20,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        backgroundColor: '#fff',
    },
    scannerBackButton: {
        width: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    scannerBackArrow: {
        fontSize: 24,
        color: '#1A1A1A',
        lineHeight: 28,
    },
    scannerHeaderTitle: {
        fontSize: 17,
        fontFamily: 'Gilroy-Bold',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },
    scannerBody: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    viewfinderWrapper: {
        width: width * 0.78,
        height: width * 0.78,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0EFF8',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 36,
        height: 36,
        zIndex: 10,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.primary,
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.primary,
        borderTopRightRadius: 12,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: colors.primary,
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: colors.primary,
        borderBottomRightRadius: 12,
    },
    scannerFooter: {
        position: 'absolute',
        bottom: 48,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scannerBrand: {
        fontSize: 20,
        fontFamily: 'Gilroy-Bold',
        color: colors.primary,
        fontStyle: 'italic',
        letterSpacing: 0.5,
    },
});