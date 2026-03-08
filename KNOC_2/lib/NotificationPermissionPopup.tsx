/**
 * Notification Permission Popup
 *
 * A pre-permission modal that appears BEFORE the system notification
 * permission dialog. This "soft ask" pattern dramatically improves
 * opt-in rates because the user understands WHY they should allow
 * notifications before seeing the system prompt.
 *
 * Usage: Rendered inside NotificationProvider. Shows once per install.
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

// Design-system colors matching the app's palette
const colors = {
    primary: '#431BB8',
    secondary: '#926FF3',
    background: '#8875F4',
    white: '#FFFFFF',
    subtleWhite: 'rgba(255,255,255,0.75)',
    overlay: 'rgba(0, 0, 0, 0.55)',
    cardBg: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    enableBtn: '#431BB8',
    skipBtn: 'transparent',
    bellBg: '#EDE9FE',
    bellAccent: '#431BB8',
};

interface NotificationPermissionPopupProps {
    visible: boolean;
    onEnable: () => void;
    onSkip: () => void;
}

export default function NotificationPermissionPopup({
    visible,
    onEnable,
    onSkip,
}: NotificationPermissionPopupProps) {
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const bellBounce = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset values
            scaleAnim.setValue(0.85);
            opacityAnim.setValue(0);
            bellBounce.setValue(0);

            // Entrance animation
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Bell bounce loop
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(bellBounce, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(bellBounce, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.delay(2000),
                    ]),
                ).start();
            });

            // Shimmer loop on the button
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ).start();
        }
    }, [visible]);

    const bellRotation = bellBounce.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '15deg', '0deg', '-15deg', '0deg'],
    });

    const bellTranslateY = bellBounce.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, -4, 0],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onSkip}
        >
            <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    {/* Purple accent bar at top */}
                    <View style={styles.accentBar} />

                    {/* Bell icon */}
                    <Animated.View
                        style={[
                            styles.bellContainer,
                            {
                                transform: [
                                    { rotate: bellRotation },
                                    { translateY: bellTranslateY },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.bellEmoji}>🔔</Text>
                    </Animated.View>

                    {/* Title */}
                    <Text style={styles.title}>Stay in the Loop!</Text>

                    {/* Description */}
                    <Text style={styles.description}>
                        Enable notifications to get instant alerts when someone
                        knocks at your door. Never miss a visitor again!
                    </Text>

                    {/* Feature highlights */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureRow}>
                            <Text style={styles.featureIcon}>⚡</Text>
                            <Text style={styles.featureText}>
                                Instant knock alerts
                            </Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Text style={styles.featureIcon}>🔒</Text>
                            <Text style={styles.featureText}>
                                Know who's at your door
                            </Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Text style={styles.featureIcon}>🔕</Text>
                            <Text style={styles.featureText}>
                                You can turn them off anytime
                            </Text>
                        </View>
                    </View>

                    {/* Enable button */}
                    <TouchableOpacity
                        style={styles.enableButton}
                        onPress={onEnable}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.enableButtonText}>
                            Enable Notifications
                        </Text>
                    </TouchableOpacity>

                    {/* Skip button */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={onSkip}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipButtonText}>Not Now</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.cardBg,
        borderRadius: 24,
        paddingHorizontal: 28,
        paddingBottom: 28,
        paddingTop: 0,
        alignItems: 'center',
        overflow: 'hidden',
        // Shadow
        shadowColor: '#431BB8',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
        elevation: 20,
    },
    accentBar: {
        width: '100%',
        height: 6,
        backgroundColor: colors.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginBottom: 24,
    },
    bellContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.bellBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    bellEmoji: {
        fontSize: 38,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 24,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F7FF',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    featureIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    featureText: {
        fontSize: 13.5,
        fontFamily: 'Gilroy-Medium',
        color: colors.textPrimary,
    },
    enableButton: {
        width: '100%',
        backgroundColor: colors.enableBtn,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        // Subtle glow
        shadowColor: colors.enableBtn,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    enableButtonText: {
        fontSize: 16,
        fontFamily: 'Gilroy-Bold',
        color: colors.white,
        letterSpacing: 0.5,
    },
    skipButton: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: colors.textSecondary,
    },
});
