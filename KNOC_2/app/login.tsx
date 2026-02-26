import React, { useState } from 'react';
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
import { auth } from '../lib/firebase';

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
            const confirmation = await auth().signInWithPhoneNumber(fullPhone);
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
