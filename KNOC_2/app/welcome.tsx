import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
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
                        source={require('../assets/logo/Group 1171275857 (1).png')}
                        style={{ width: width * 0.45, height: 45, marginTop: 0 }}
                        contentFit="contain"
                    />
                </Animated.View>

                {/* QR Card */}
                <AnimatedTouchable
                    activeOpacity={0.85}
                    onPress={() => router.replace('/onboard-qr')}
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
                    <Text style={styles.cardSubtitle}>Tap here to create your QR Code for others to scan</Text>
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
});