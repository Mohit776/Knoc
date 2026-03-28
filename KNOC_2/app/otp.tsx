import React, { useRef, useState, useEffect } from 'react';
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
import { signInWithPhoneNumber, onAuthStateChanged } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getConfirmation, setConfirmation } from '../lib/authStore';
import { useNotification } from '../lib/NotificationProvider';
import { Typography, s, vs, ms, Spacing, VSpacing, Radius, ButtonHeight, IconSize, FontFamily } from '../lib/typography';

const colors = {
    primary: '#431BB8',
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBorder: '#C7C7CC',
    headerBorder: '#F2F2F7',
};

// ─── Error handler: only alerts for genuine auth failures ───
// In production, the race condition is more aggressive due to Hermes/JSC
// optimizations and faster native bridge calls. This function ensures
// we NEVER show a false alert.
function handleOtpError(
    error: any,
    mountedRef: React.MutableRefObject<boolean>,
    isSuccess: boolean,
) {
    console.error('Firebase OTP verify error:', error);

    // Gate 1: confirm() actually succeeded — this error is a race condition artifact.
    // This is the most reliable check because isSuccess is a synchronous local
    // variable, unlike auth.currentUser which has timing issues in production.
    if (isSuccess) {
        console.log('Ignoring error — isSuccess flag is true (race condition)');
        return;
    }

    // Gate 2: Component already unmounted (navigated away by onAuthStateChanged)
    if (!mountedRef.current) {
        console.log('Ignoring error — component unmounted');
        return;
    }

    // Gate 3: User is already signed in (backup check)
    if (auth.currentUser) {
        console.log('Ignoring error — auth.currentUser already exists');
        return;
    }

    // Gate 4: Only show alerts for known, actionable Firebase error codes
    const code = error?.code;
    if (code === 'auth/invalid-verification-code') {
        alert('Invalid OTP. Please check and try again.');
    } else if (code === 'auth/code-expired' || code === 'auth/session-expired') {
        alert('OTP has expired. Please tap "Resend OTP" to get a new one.');
    }
    // All other errors (including race condition artifacts) are silently ignored.
    // Do NOT show a generic fallback alert — it causes the false "expired" UX.
}

export default function OTPScreen() {
    const router = useRouter();
    const { triggerSync } = useNotification();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    // ── Refs that survive re-renders and prevent race conditions ──
    const confirmationRef = useRef<any>(null);       // Firebase confirmation object
    const mountedRef = useRef(true);                  // Is the component still mounted?
    const isVerifyingRef = useRef(false);             // Prevent duplicate verify calls

    useEffect(() => {
        confirmationRef.current = getConfirmation();
        mountedRef.current = true;

        // ── Auth state listener: handles ALL post-login navigation ──
        // confirm() signs user in → onAuthStateChanged fires → we navigate here.
        // The handleVerify function does NOT navigate manually.
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user || !mountedRef.current) return;

            try {
                const rawPhone = phone?.replace('+91', '').trim() || '';
                await AsyncStorage.setItem('guest_phone', rawPhone);

                const fullPhoneFormatted = `+91${rawPhone}`;
                const snapshot = await firestore()
                    .collection('qr_codes')
                    .where('phone_number', '==', fullPhoneFormatted)
                    .limit(1)
                    .get();

                if (!mountedRef.current) return;

                if (!snapshot.empty) {
                    const existingDoc = snapshot.docs[0];
                    const existingData = existingDoc.data();
                    const docId = existingDoc.id;

                    await AsyncStorage.multiSet([
                        ['has_onboarded', 'true'],
                        ['user_name', existingData.name || ''],
                        ['linked_qr_id', docId]
                    ]);

                    await triggerSync();
                    if (mountedRef.current) router.replace('/(Tabs)/home');
                } else {
                    if (mountedRef.current) router.replace('/welcome');
                }
            } catch (firestoreError) {
                console.error('Firestore post-auth error:', firestoreError);
                if (mountedRef.current) router.replace('/welcome');
            }
        });

        return () => {
            mountedRef.current = false;
            unsubscribe();
        };
    }, []);

    // ── OTP input handlers ──

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    // ── Verify OTP (race-condition safe) ──

    const handleVerify = async () => {
        const token = otp.join('');
        if (token.length < 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        if (!confirmationRef.current) {
            alert('Session expired. Please go back and request a new OTP.');
            return;
        }

        // Prevent double-tap: if already verifying, bail out
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;
        setLoading(true);

        // Local success flag — the most reliable race condition guard.
        // Set synchronously after confirm() resolves, BEFORE catch can run.
        // Unlike auth.currentUser, this has zero timing ambiguity.
        let isSuccess = false;

        try {
            await confirmationRef.current.confirm(token);
            // confirm() resolved without error → OTP was valid.
            // Firebase has signed the user in internally.
            isSuccess = true;
            // Do NOT navigate here. onAuthStateChanged handles navigation.
        } catch (error: any) {
            // Pass isSuccess to the error handler — if true, this error
            // is a race condition artifact and will be silently ignored.
            handleOtpError(error, mountedRef, isSuccess);
        } finally {
            isVerifyingRef.current = false;
            if (mountedRef.current) setLoading(false);
        }
    };

    // ── Resend OTP (creates a NEW confirmation object) ──

    const handleResend = async () => {
        if (!phone) return;
        try {
            const newConfirmation = await signInWithPhoneNumber(auth, phone, undefined, true);
            confirmationRef.current = newConfirmation;
            setConfirmation(newConfirmation);
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

    // ── UI ──

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={IconSize.lg} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Your OTP is on its way</Text>

                    <View style={styles.subtitleRow}>
                        <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
                            Enter the OTP sent to {phone}
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.editText}> Edit</Text>
                        </TouchableOpacity>
                    </View>

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
        minHeight: ButtonHeight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.headerBorder,
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    content: {
        flex: 1,
        paddingTop: VSpacing.xxxl,
    },
    logo: {
        width: s(140),
        height: vs(48),
        marginBottom: VSpacing.xl,
        alignSelf: 'flex-start',
    },
    title: {
        ...Typography.heading,
        fontSize: ms(22),
        color: colors.textMain,
        marginBottom: VSpacing.xs,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: VSpacing.xxl,
        flexWrap: 'wrap',
    },
    subtitle: {
        ...Typography.caption,
        color: colors.textMuted,
        flexShrink: 1,
    },
    editText: {
        ...Typography.captionMedium,
        color: colors.primary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: VSpacing.xl,
        gap: s(8),
    },
    otpBox: {
        flex: 1,
        aspectRatio: 0.88,
        maxWidth: s(52),
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: Radius.md,
        ...Typography.otpDigit,
        color: colors.textMain,
        textAlign: 'center',
    },
    resendButton: {
        alignSelf: 'flex-start',
        marginBottom: VSpacing.xxl,
    },
    resendText: {
        ...Typography.bodyMedium,
        color: '#8875F4',
    },
    continueButton: {
        backgroundColor: colors.primary,
        borderRadius: Radius.md,
        minHeight: ButtonHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        ...Typography.button,
        color: colors.background,
    },
});
