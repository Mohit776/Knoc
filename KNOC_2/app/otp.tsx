import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const colors = {
    primary: '#431BB8',
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBorder: '#C7C7CC',
    headerBorder: '#F2F2F7',
};

export default function OTPScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance
        if (value && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const token = otp.join('');
        if (token.length < 4) {
            alert('Please enter a valid 4-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Test OTP bypass: "0000" skips Supabase verification
            if (token === '0000') {
                // Extract the raw 10-digit number from the full phone (e.g. +919205394233 -> 9205394233)
                const rawPhone = (phone || '').replace('+91', '');
                await AsyncStorage.setItem('is_guest', 'true');
                await AsyncStorage.setItem('guest_phone', rawPhone);
                router.replace('/welcome');
                return;
            }

            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: phone || '',
                token,
                type: 'sms',
            });

            if (verifyError) {
                alert(verifyError.message);
            } else {
                // Success! Head to the welcome screen for onboarding flow
                router.replace('/welcome');
            }
        } catch (error: any) {
            alert('Unexpected error during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!phone) return;
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone });
            if (error) {
                alert(error.message);
            } else {
                alert('OTP sent again successfully!');
            }
        } catch (err: any) {
            alert('Error resending OTP');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Your OTP is on its way</Text>

                    <View style={styles.subtitleRow}>
                        <Text style={styles.subtitle}>Enter the OTP sent to {phone}</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.editText}> Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* OTP Input Row */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpBox}
                                value={digit}
                                onChangeText={(val) => handleOtpChange(val, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                ref={(input) => {
                                    inputs.current[index] = input;
                                }}
                            />
                        ))}
                    </View>

                    <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.continueButton}
                        activeOpacity={0.8}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        <Text style={styles.continueButtonText}>
                            {loading ? 'Verifying...' : 'Continue'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.headerBorder,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
        paddingTop: 40,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        marginBottom: 8,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
    editText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: colors.primary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        width: '85%',
    },
    otpBox: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        fontSize: 24,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
        textAlign: 'center',
    },
    resendButton: {
        alignSelf: 'flex-start',
        marginBottom: 32,
    },
    resendText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: '#8875F4', // Slightly lighter purple matching the image
    },
    continueButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        color: colors.background,
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
    },
});
