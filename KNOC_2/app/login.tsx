import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth } from '../lib/firebase';
import { signInWithPhoneNumber } from '@react-native-firebase/auth';
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, ButtonHeight, FontFamily } from '../lib/typography';

// Design system colors based on previous Knoc colors and the new image
const colors = {
    primary: '#431BB8', // Purple from button
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBg: '#F2F2F7',
    divider: '#C7C7CC',
};

// Store the Firebase confirmation result globally so the OTP screen can access it
export let firebaseConfirmation: any = null;

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        const fullPhone = `+91${phoneNumber}`;

        try {
            // Firebase sends the OTP SMS automatically
            const confirmation = await signInWithPhoneNumber(auth, fullPhone);
            firebaseConfirmation = confirmation;

            router.push({
                pathname: '/otp',
                params: { phone: fullPhone }
            });
        } catch (error: any) {
            console.error('Firebase OTP error:', error);
            if (error.code === 'auth/invalid-phone-number') {
                alert('Invalid phone number. Please check and try again.');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Too many attempts. Please try again later.');
            } else {
                alert(error.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Skip Button Header */}


                <View style={styles.content}>
                    {/* KNOC App Logo */}
                   
                    <Text style={styles.title}>Log in with phone number</Text>

                    {/* Phone Number Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.countryCode}>+91</Text>
                        <View style={styles.divider} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter mobile number"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            maxLength={10}
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Sending OTP...' : 'Log in'}
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* Footer */}
              
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingTop: VSpacing.lg,
        paddingBottom: VSpacing.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    skipText: {
        ...Typography.button,
        color: colors.primary,
    },
    content: {
        flex: 1,
        marginTop: vs(120),
    },
    logo: {
        width: s(140),
        height: vs(48),
        marginBottom: VSpacing.xl,
        alignSelf: 'flex-start',
    },
    title: {
        ...Typography.heading,
        fontSize: ms(24),
        color: colors.textMain,
        marginBottom: VSpacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        minHeight: ButtonHeight,
        marginBottom: vs(28),
    },
    countryCode: {
        ...Typography.button,
        color: colors.textMain,
    },
    divider: {
        width: 1,
        height: vs(24),
        backgroundColor: colors.divider,
        marginHorizontal: Spacing.sm,
    },
    input: {
        flex: 1,
        ...Typography.button,
        fontFamily: FontFamily.regular,
        color: colors.textMain,
        height: '100%',
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: Radius.md,
        minHeight: ButtonHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        ...Typography.button,
        color: colors.background,
    },

    footer: {
        alignItems: 'center',
        paddingBottom: VSpacing.lg,
    },
    privacyText: {
        ...Typography.bodyMedium,
        color: colors.textMain,
        textDecorationLine: 'underline',
    },
});
