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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

const colors = {
    primary: '#431BB8',
    background: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    inputBg: '#F4F3FF',
    inputActiveBorder: '#C7C7CC',
    headerBorder: '#F2F2F7',
};


export default function OnboardQRScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.textMain}
                     onPress={() => router.replace('/welcome')} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Onboard Your QR Code</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* QR Unique ID */}
                <Text style={styles.label}>QR Unique ID Number</Text>
                <View style={styles.readonlyInput}>
                    <Text style={styles.readonlyText}>KNO021545221IN54</Text>
                </View>

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
                    style={styles.activateButton}
                    activeOpacity={0.85}
                    onPress={() => router.replace('/(Tabs)/home')}
                >
                    <Text style={styles.activateButtonText}>Active QR Code</Text>
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
    readonlyInput: {
        backgroundColor: colors.inputBg,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    readonlyText: {
        fontSize: 15,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMuted,
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
