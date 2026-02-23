import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { registerForPushNotificationsAsync } from '../lib/notifications';

const { width } = Dimensions.get('window');

const colors = {
    primary: '#431BB8',
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBg: '#F4F3FF',
    inputActiveBorder: '#C7C7CC',
    headerBorder: '#F2F2F7',
    success: '#34C759',
    error: '#FF3B30',
};

export default function OnboardQRScreen() {
    const router = useRouter();
    const [qrCodeId, setQrCodeId] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivate = async () => {
        // Validate inputs
        if (!qrCodeId.trim()) {
            Alert.alert('Missing QR ID', 'Please enter the QR Unique ID Number printed on your QR code.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter your name.');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Missing Location', 'Please enter your location name.');
            return;
        }

        setLoading(true);

        try {
            // 1. Check if the QR code exists in the database
            const { data: existingQr, error: fetchError } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('qr_id', qrCodeId.trim())
                .single();

            if (fetchError || !existingQr) {
                Alert.alert(
                    'QR Code Not Found',
                    'This QR Code ID does not exist in our system. Please check the ID and try again.'
                );
                setLoading(false);
                return;
            }

            // 2. Check if it's already linked to someone
            if (existingQr.user_id || existingQr.phone_number) {
                Alert.alert(
                    'Already Linked',
                    'This QR Code is already linked to another user. Please use a different QR code.'
                );
                setLoading(false);
                return;
            }

            // 3. Get the current logged-in user (may be null if skipped login)
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch guest phone if they signed in as guest
            const guestPhone = await AsyncStorage.getItem('guest_phone');
            const phoneToSave = guestPhone ? `+91${guestPhone}` : (user?.phone || null);

            // Fetch push token for this device
            const pushToken = await registerForPushNotificationsAsync();

            // 4. Update the QR code record with user info, name and push token
            const { error: updateError } = await supabase
                .from('qr_codes')
                .update({
                    user_id: user?.id || null,
                    phone_number: phoneToSave,
                    location: location.trim(),
                    name: name.trim(),
                    fcm_token: pushToken || null,
                })
                .eq('qr_id', qrCodeId.trim());

            if (updateError) {
                Alert.alert('Error', `Failed to activate QR code: ${updateError.message}`);
                setLoading(false);
                return;
            }

            // Mark onboarding as complete and save name + qr_id to session
            await AsyncStorage.multiSet([
                ['has_onboarded', 'true'],
                ['user_name', name.trim()],
                ['linked_qr_id', qrCodeId.trim()],
            ]);

            // 5. Success! Navigate to the home screen
            Alert.alert(
                '✅ QR Code Activated!',
                `Your QR code "${qrCodeId}" has been successfully linked and is now active.`,
                [
                    {
                        text: 'Go to Home',
                        onPress: () => router.replace('/(Tabs)/home'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Unexpected Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.replace('/welcome')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Onboard Your QR Code</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* QR Unique ID - Now editable */}
                <Text style={styles.label}>QR Unique ID Number*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter QR Code ID (e.g. KNO8A2C3F1B2D)"
                    placeholderTextColor={colors.textMuted}
                    value={qrCodeId}
                    onChangeText={setQrCodeId}
                    autoCapitalize="characters"
                />

                {/* Name */}
                <Text style={styles.label}>Name*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                />

                {/* Location Name */}
                <Text style={styles.label}>Location Name*</Text>
                <TextInput
                    style={[styles.input, styles.inputTaller]}
                    placeholder="Eg. Home, Office, Villas, Builder Floors & Apartments"
                    placeholderTextColor={colors.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    multiline
                />

                {/* Activate Button */}
                <TouchableOpacity
                    style={[styles.activateButton, loading && styles.activateButtonDisabled]}
                    activeOpacity={0.85}
                    onPress={handleActivate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.activateButtonText}>Active QR Code</Text>
                    )}
                </TouchableOpacity>

                {/* Background decorative image */}
                <Image
                    source={require('../assets/logo/Background.png')}
                    style={styles.backgroundImage}
                    resizeMode="contain"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: colors.headerBorder,
        gap: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },

    // Form
    label: {
        fontSize: 14,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.inputActiveBorder,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMain,
        backgroundColor: colors.background,
    },
    inputTaller: {
        minHeight: 60,
        textAlignVertical: 'top',
    },

    // Activate Button
    activateButton: {
        marginTop: 28,
        backgroundColor: colors.primary,
        borderRadius: 10,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activateButtonDisabled: {
        opacity: 0.7,
    },
    activateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
    },

    // Background decorative image
    backgroundImage: {
        width: '100%',
        height: 160,
        marginTop: 20,
        alignSelf: 'center',
    },
});
