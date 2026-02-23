import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkState = async () => {
      const [sessionRes, guestRes, onboardRes] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem('is_guest'),
        AsyncStorage.getItem('has_onboarded')
      ]);

      setSession(sessionRes.data.session);
      setIsGuest(guestRes === 'true');
      setHasOnboarded(onboardRes === 'true');
      setLoading(false);
    };

    checkState();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#431BB8" />
      </View>
    );
  }

  // If no session and not a guest, send to login
  if (!session && !isGuest) {
    return <Redirect href="/login" />;
  }

  // User is authenticated or guest. Check if they have onboarded:
  if (!hasOnboarded) {
    return <Redirect href="/welcome" />;
  }

  // Already onboarded -> jump to home
  return <Redirect href="/(Tabs)/home" />;
}

