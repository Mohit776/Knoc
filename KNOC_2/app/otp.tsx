import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';
import { signInWithPhoneNumber } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { firebaseConfirmation } from './login';
import { useNotification } from '../lib/NotificationProvider';

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
    const { triggerSync } = useNotification();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-advance
        if (value && index < 5) {
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
        if (token.length < 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            if (!firebaseConfirmation) {
                alert('Session expired. Please go back and try again.');
                return;
            }

            // Verify OTP with Firebase
            await firebaseConfirmation.confirm(token);

            // Success! Firebase user is now signed in. Save the phone for onboarding.
            const rawPhone = phone?.replace('+91', '').trim() || '';
            await AsyncStorage.setItem('guest_phone', rawPhone);

            // Check if user is already linked in the database
            const fullPhoneFormatted = `+91${rawPhone}`;
            const snapshot = await firestore()
                .collection('qr_codes')
                .where('phone_number', '==', fullPhoneFormatted)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                // User exists! Restore their session and skip onboarding
                const existingDoc = snapshot.docs[0];
                const existingData = existingDoc.data();
                // IMPORTANT: Always use the Firestore document ID, NOT the qr_id data field.
                // The document ID is what we use for updateDoc(doc(db, ...)) calls later.
                const docId = existingDoc.id;

                // Always store the document ID as linked_qr_id (not the qr_id field)
                await AsyncStorage.multiSet([
                    ['has_onboarded', 'true'],
                    ['user_name', existingData.name || ''],
                    ['linked_qr_id', docId]
                ]);

                // Sync FCM token to Firestore (centralized — NotificationProvider)
                await triggerSync();

                router.replace('/(Tabs)/home');
                return;
            }

            // New user: Head to the welcome screen for onboarding flow
            router.replace('/welcome');
        } catch (error: any) {
            console.error('Firebase OTP verify error:', error);
            if (error.code === 'auth/invalid-verification-code') {
                alert('Invalid OTP. Please check and try again.');
            } else if (error.code === 'auth/session-expired') {
                alert('OTP expired. Please request a new one.');
            } else {
                alert('Unexpected error during verification.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!phone) return;
        try {
            // Re-send OTP via Firebase
            await signInWithPhoneNumber(auth, phone, undefined, true);
            alert('OTP sent again successfully!');
        } catch (err: any) {
            console.error('Resend error:', err);
            if (err.code === 'auth/too-many-requests') {
                alert('Too many attempts. Please try again later.');
            } else {
                alert('Error resending OTP. Please try again.');
            }
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
                    {/* KNOC App Logo */}

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
    logo: {
        width: 140,
        height: 48,
        marginBottom: 24,
        alignSelf: 'flex-start',
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
        fontSize: 12,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
    editText: {
        fontSize: 12,
        fontFamily: 'Gilroy-Medium',
        color: colors.primary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        width: '98%',
    },
    otpBox: {
        width: 46,
        height: 52,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
        fontSize: 22,
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
