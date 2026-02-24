import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

// Design system colors based on previous Knoc colors and the new image
const colors = {
    primary: '#431BB8', // Purple from button
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBg: '#F2F2F7',
    divider: '#C7C7CC',
};

const GUEST_PHONE = '9205394233';

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
            const { error } = await supabase.auth.signInWithOtp({
                phone: fullPhone,
            });

            if (error) {
                alert(error.message);
            } else {
                router.push({
                    pathname: '/otp',
                    params: { phone: fullPhone }
                });
            }
        } catch (error: any) {
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestSignIn = async () => {
        setLoading(true);
        try {
            // Store guest session in AsyncStorage — persists across app restarts
            await AsyncStorage.setItem('is_guest', 'true');
            await AsyncStorage.setItem('guest_phone', GUEST_PHONE);
            // Skip OTP — navigate directly to the welcome/home screen
            router.replace('/welcome');
        } catch (error: any) {
            alert('Unable to sign in as guest. Please try again.');
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push('/welcome')}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
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

                    {/* Sign in as Guest */}
                    <TouchableOpacity
                        style={styles.guestButton}
                        activeOpacity={0.7}
                        onPress={handleGuestSignIn}
                        disabled={loading}
                    >
                        <Text style={styles.guestButtonText}>
                            Sign in as Guest
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.6}>
                        <Text style={styles.privacyText}>Privacy policy</Text>
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
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20, // Adjust depending on if there's a header
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    skipText: {
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        color: colors.primary,
    },
    content: {
        flex: 1,
        marginTop: 60, // To roughly match the position in the image
    },
    title: {
        fontSize: 24,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 32,
    },
    countryCode: {
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: colors.divider,
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMain,
        height: '100%',
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: colors.background,
        fontSize: 16,
        fontFamily: 'Gilroy-Medium',
    },
    guestButton: {
        borderWidth: 1.5,
        borderColor: '#C4B5FD',
        borderStyle: 'dashed',
        borderRadius: 8,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
        backgroundColor: 'transparent',
    },
    guestButtonText: {
        color: '#7C5CBF',
        fontSize: 15,
        fontFamily: 'Gilroy-Medium',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    privacyText: {
        fontSize: 14,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMain,
        textDecorationLine: 'underline',
    },
});
