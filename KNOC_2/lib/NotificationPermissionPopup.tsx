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
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, FontFamily } from './typography';

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
                    <Text style={styles.title}>Enable Notifications</Text>

                    {/* Description */}
                    <Text style={styles.description}>
                        Get instant alerts when someone knocks at your door. You can turn this off anytime.
                    </Text>

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
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: s(340),
        backgroundColor: '#FFFFFF',
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: vs(4) },
        shadowOpacity: 0.1,
        shadowRadius: ms(10),
    },
    bellContainer: {
        width: s(64),
        height: s(64),
        borderRadius: s(32),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: VSpacing.md,
    },
    bellEmoji: {
        fontSize: ms(32),
    },
    title: {
        ...Typography.cardTitle,
        color: '#111827',
        textAlign: 'center',
        marginBottom: VSpacing.xs,
    },
    description: {
        ...Typography.bodyMedium,
        fontSize: ms(15),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: ms(22),
        marginBottom: VSpacing.xl,
        paddingHorizontal: s(10),
    },
    enableButton: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: Radius.lg,
        paddingVertical: VSpacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: VSpacing.xs,
    },
    enableButtonText: {
        ...Typography.button,
        fontFamily: FontFamily.bold,
        color: '#FFFFFF',
    },
    skipButton: {
        width: '100%',
        paddingVertical: VSpacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonText: {
        ...Typography.bodyMedium,
        fontSize: ms(15),
        fontFamily: FontFamily.bold,
        color: '#9CA3AF',
    },
});
