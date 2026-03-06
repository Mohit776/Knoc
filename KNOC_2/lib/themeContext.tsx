import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'Automatic' | 'Light' | 'Dark';

const lightColors = {
    primary: '#431BB8',
    primaryLight: '#7B5CF0',
    background: '#F2F2F2',
    cardBg: '#FFFFFF',
    textMain: '#1A1A1A',
    textMuted: '#8E8E93',
    headerBorder: '#E5E5EA',
    separator: '#E5E5EA',
    avatarBg: '#EDE7FF',
    avatarIcon: '#7B5CF0',
    danger: '#FF3B30',
    noteText: '#6B6B6B',
    green: '#34C759',
    statsBg: '#EDE9FF',
    statsCard: '#DDDAFF',
    textPrimary: '#431BB8',
    ignore: '#E53935',
    coming: '#43A047',
    bannerGradientStart: '#431BB8',
    bannerGradientEnd: '#8B5CF6',
    borderLight: '#F0F0F0',
    borderMedium: '#EFEFEF',
    avatarProfileCircle: '#C5B4FF',
    logoutBg: '#FFF0F0',
};

const darkColors = {
    primary: '#9D82F8',
    primaryLight: '#B6A0F8',
    background: '#000000',
    cardBg: '#1C1C1E',
    textMain: '#FFFFFF',
    textMuted: '#AEAEB2',
    headerBorder: '#38383A',
    separator: '#38383A',
    avatarBg: '#2C2A40',
    avatarIcon: '#B4A2F8',
    danger: '#FF453A',
    noteText: '#98989E',
    green: '#32D74B',
    statsBg: '#1C1C1E',
    statsCard: '#2C2C2E',
    textPrimary: '#A68EF9',
    ignore: '#FF453A',
    coming: '#32D74B',
    bannerGradientStart: '#431BB8',
    bannerGradientEnd: '#8B5CF6',
    borderLight: '#2C2C2E',
    borderMedium: '#2C2C2E',
    avatarProfileCircle: '#3B3666',
    logoutBg: '#361C1C',
};

export const ThemeContext = createContext<{
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
    colors: typeof lightColors;
}>({
    themeMode: 'Light',
    setThemeMode: () => { },
    isDark: false,
    colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemPref = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('Light');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('theme_preference').then((val) => {
            if (val === 'Light' || val === 'Dark' || val === 'Automatic') {
                setThemeModeState(val as ThemeMode);
            }
            setIsReady(true);
        });
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        AsyncStorage.setItem('theme_preference', mode);
    };

    const isDark = themeMode === 'Automatic' ? systemPref === 'dark' : themeMode === 'Dark';
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
