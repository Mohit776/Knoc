import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe storage wrapper — prevents crashes during Metro web SSR
// where `window` is not defined yet.
const SafeStorage = {
    getItem: async (key: string) => {
        try {
            return await AsyncStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch { }
    },
    removeItem: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch { }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: SafeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Only attach AppState listener on native platforms
if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            supabase.auth.startAutoRefresh();
        } else {
            supabase.auth.stopAutoRefresh();
        }
    });
}
