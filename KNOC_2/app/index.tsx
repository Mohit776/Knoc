import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';

export default function Index() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setFirebaseUser(user);

      const [guestRes, onboardRes] = await Promise.all([
        AsyncStorage.getItem('is_guest'),
        AsyncStorage.getItem('has_onboarded')
      ]);

      setIsGuest(guestRes === 'true');
      setHasOnboarded(onboardRes === 'true');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#431BB8" />
      </View>
    );
  }

  // If no Firebase user and not a guest, send to login
  if (!firebaseUser && !isGuest) {
    return <Redirect href="/login" />;
  }

  // User is authenticated or guest. Check if they have onboarded:
  if (!hasOnboarded) {
    return <Redirect href="/welcome" />;
  }

  // Already onboarded -> jump to home
  return <Redirect href="/(Tabs)/home" />;
}

