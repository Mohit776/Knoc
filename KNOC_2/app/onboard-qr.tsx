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
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import { useNotification } from '../lib/NotificationProvider';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
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
    const { triggerSync } = useNotification();
    const [qrCodeId, setQrCodeId] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleActivateAndDownload = async () => {
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
            const id = qrCodeId.trim();

            // 1. Check if the QR code exists in the database
            const qrDoc = await getDoc(doc(db, 'qr_codes', id));

            if (!qrDoc.exists()) {
                Alert.alert(
                    'QR Code Not Found',
                    'This QR Code ID does not exist in our system. Please check the ID and try again.'
                );
                setLoading(false);
                return;
            }

            const existingQr = qrDoc.data();

            // 2. Check if it's already linked to someone
            if (existingQr?.phone_number) {
                Alert.alert(
                    'Already Linked',
                    'This QR Code is already linked to another user. Please use a different QR code.'
                );
                setLoading(false);
                return;
            }

            // Fetch phone from AsyncStorage (set during login/OTP flow)
            const guestPhone = await AsyncStorage.getItem('guest_phone');
            const phoneToSave = guestPhone ? `+91${guestPhone}` : null;

            // 3. Update the QR code record with user info and name
            console.log('[Onboard] Updating Firestore doc:', id);
            await updateDoc(doc(db, 'qr_codes', id), {
                phone_number: phoneToSave,
                location: location.trim(),
                name: name.trim(),
            });

            console.log('[Onboard] QR code updated successfully. Doc ID:', id);

            // Mark onboarding as complete and save name + qr_id to session
            await AsyncStorage.multiSet([
                ['has_onboarded', 'true'],
                ['user_name', name.trim()],
                ['linked_qr_id', id],
            ]);

            // Sync FCM token to Firestore (centralized — NotificationProvider)
            await triggerSync();

            // 4. Generate QR Code PDF
            const qrUrl = `https://knoc.vercel.app/qr/${id}`;
            const encodedQrUrl = encodeURIComponent(qrUrl);
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodedQrUrl}&format=png&margin=0`;

            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: Helvetica, Arial, sans-serif;
            background: #fff;
        }
        .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .qr-img {
            width: 280px;
            height: 280px;
        }
        .qr-id {
            font-size: 18px;
            font-weight: bold;
            color: #431BB8;
            letter-spacing: 1px;
        }
        .qr-subtitle {
            font-size: 13px;
            color: #8E8E93;
        }
    </style>
</head>
<body>
    <div class="qr-container">
        <img class="qr-img" src="${qrImageUrl}" alt="QR Code" />
        <div class="qr-id">${id}</div>
        <div class="qr-subtitle">Scan to KNOC</div>
    </div>
</body>
</html>`;

            const { uri } = await Print.printToFileAsync({ html });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `QR Code - ${id}`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('PDF Saved', `QR Code PDF saved at:\n${uri}`);
            }

            // 5. Success! Navigate to the home screen
            Alert.alert(
                'QR Code Activated',
                `Your QR code "${id}" has been successfully linked and is now active.`,
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
                    style={[styles.input, focusedInput === 'qrCodeId' && styles.inputActive]}
                    placeholder="KNO8A2C3F1B2D"
                    placeholderTextColor={colors.textMuted}
                    value={qrCodeId}
                    onChangeText={setQrCodeId}
                    autoCapitalize="characters"
                    onFocus={() => setFocusedInput('qrCodeId')}
                    onBlur={() => setFocusedInput(null)}
                />

                {/* Name */}
                <Text style={styles.label}>Name*</Text>
                <TextInput
                    style={[styles.input, focusedInput === 'name' && styles.inputActive]}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                />

                {/* Location Name */}
                <Text style={styles.label}>Location Name*</Text>
                <TextInput
                    style={[styles.input, styles.inputTaller, focusedInput === 'location' && styles.inputActive]}
                    placeholder="Eg. Home, Office, Builder Floors & Apartments"
                    placeholderTextColor={colors.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    multiline
                    onFocus={() => setFocusedInput('location')}
                    onBlur={() => setFocusedInput(null)}
                />

                {/* Activate & Download Button */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleActivateAndDownload}
                    disabled={loading}
                    style={{ marginTop: 28 }}
                >
                    <LinearGradient
                        colors={['#431BB8', '#6B45D5', '#926FF3']}
                        locations={[0.16, 0.51, 0.94]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.activateButton, { marginTop: 0 }, loading && styles.activateButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.activateButtonText}>Active QR Code & Download</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Background decorative image */}
                <Image
                    source={require('../assets/new_knoc/qr_code_backgeound.jpeg')}
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
        borderColor: 'transparent',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMain,
        backgroundColor: '#926FF31A',
    },
    inputActive: {
        borderColor: '#431BB880',
    },
    inputTaller: {
        minHeight: 60,
        textAlignVertical: 'top',
    },

    // Activate & Download Button
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
