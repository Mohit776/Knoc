import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

type ThemeOption = 'automatic' | 'light' | 'dark';

const colors = {
    primary: '#431BB8',
    background: '#F2F2F7',
    cardBg: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    headerBg: '#F2F2F7',
    headerBorder: '#E5E5EA',
    separator: '#E5E5EA',
    avatarBg: '#EDE7FF',
    avatarIcon: '#7B5CF0',
    logoutText: '#431BB8',
    noteText: '#6B6B6B',
};

export default function SettingsScreen() {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeOption>('automatic');

    const themeOptions: { key: ThemeOption; label: string }[] = [
        { key: 'automatic', label: 'Automatic' },
        { key: 'light', label: 'Light' },
        { key: 'dark', label: 'Dark' },
    ];

    const handleLogout = async () => {
        try {
            // Sign out of Supabase
            await supabase.auth.signOut();

            // Clear AsyncStorage guest states and the onboarding flag
            await AsyncStorage.multiRemove(['is_guest', 'guest_phone', 'has_onboarded']);

            // Send back to origin wrapper
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* User Profile Row */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={26} color={colors.avatarIcon} />
                    </View>
                    <Text style={styles.profileName}>Your Name</Text>
                </View>

                {/* Theme Section */}
                <Text style={styles.sectionLabel}>Theme</Text>
                <View style={styles.optionCard}>
                    {themeOptions.map((option, index) => {
                        const isSelected = theme === option.key;
                        const isLast = index === themeOptions.length - 1;

                        return (
                            <React.Fragment key={option.key}>
                                <TouchableOpacity
                                    style={styles.optionRow}
                                    activeOpacity={0.65}
                                    onPress={() => setTheme(option.key)}
                                >
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                                {!isLast && <View style={styles.separator} />}
                            </React.Fragment>
                        );
                    })}
                </View>

                {/* Hint note */}
                <Text style={styles.hintText}>
                    Automatic is only supported on operating systems that allow you to control the system-wide color scheme
                </Text>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionLabel}>App version</Text>
                    <Text style={styles.versionNumber}>54.26.0</Text>
                </View>
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
        paddingHorizontal: 16,
        height: 56,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.headerBorder,
        gap: 10,
    },
    backButton: {
        padding: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Gilroy-Bold',
        color: colors.textMain,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 48,
    },

    // Profile
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 28,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.avatarBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.textMain,
    },

    // Section label
    sectionLabel: {
        fontSize: 13,
        fontFamily: 'Gilroy-Medium',
        color: colors.textMuted,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Theme option card
    optionCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMain,
    },

    // Radio button
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.separator,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: colors.primary,
    },

    // Separator
    separator: {
        height: 1,
        backgroundColor: colors.separator,
        marginLeft: 16,
    },

    // Hint note
    hintText: {
        fontSize: 13,
        fontFamily: 'Gilroy-Regular',
        color: colors.noteText,
        marginTop: 12,
        marginHorizontal: 4,
        lineHeight: 19,
    },

    // Logout
    logoutButton: {
        marginTop: 40,
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Gilroy-SemiBold',
        color: colors.logoutText,
    },

    // Version
    versionContainer: {
        marginTop: 20,
        alignItems: 'center',
        gap: 4,
    },
    versionLabel: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
    versionNumber: {
        fontSize: 14,
        fontFamily: 'Gilroy-Regular',
        color: colors.textMuted,
    },
});
