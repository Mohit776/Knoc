import messaging from '@react-native-firebase/messaging';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { NotificationProvider } from '../lib/NotificationProvider';
import { ThemeProvider } from '../lib/themeContext';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppSplash from './AppSplash';

const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <SafeAreaView style={styles.offlineBannerContainer}>
      <View style={styles.offlineBanner}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
    </SafeAreaView>
  );
};

// This handles data-only messages when the app is in the background/killed.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[FCM] Background message received:', remoteMessage.messageId);
});

/**
 * Extract knock data from a Firebase RemoteMessage, if present.
 */
function extractKnockDataFromMessage(message: any) {
  if (!message) return null;
  const data = message.data;
  if (!data?.logId || !data?.qrId) return null;
  return {
    logId: data.logId as string,
    qrId: data.qrId as string,
    action: (data.action as string) || 'Alarm',
    visitorType: (data.visitorType as string) || '',
    visitorName: (data.visitorName as string) || '',
    visitorPurpose: (data.visitorPurpose as string) || '',
    deliveryApp: (data.deliveryApp as string) || '',
    sentAt: new Date().toISOString(),
  };
}

/**
 * Extract knock data from an expo-notifications response (background tap fallback).
 */
function extractKnockData(response: Notifications.NotificationResponse | null | undefined) {
  if (!response) return null;
  const data = response.notification?.request?.content?.data;
  if (!data?.logId || !data?.qrId) return null;
  return {
    logId: data.logId as string,
    qrId: data.qrId as string,
    action: (data.action as string) || 'Alarm',
    visitorType: (data.visitorType as string) || '',
    visitorName: (data.visitorName as string) || '',
    visitorPurpose: (data.visitorPurpose as string) || '',
    deliveryApp: (data.deliveryApp as string) || '',
    sentAt: new Date().toISOString(),
  };
}

export default function RootLayout() {
  const [customSplashDone, setCustomSplashDone] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'Gilroy-Regular': require('../assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Medium': require('../assets/fonts/Gilroy-Medium.ttf'),
    'Gilroy-SemiBold': require('../assets/fonts/Gilroy-SemiBold.ttf'),
    'Gilroy-Bold': require('../assets/fonts/Gilroy-Bold.ttf'),
    'Gilroy-ExtraBold': require('../assets/fonts/Gilroy-ExtraBold.ttf'),
    'Gilroy-Heavy': require('../assets/fonts/Gilroy-Heavy.ttf'),
  });

  const router = useRouter();
  const segments = useSegments();

  // Track whether we've already handled the cold-start notification
  const coldStartHandled = useRef(false);
  // Store cold-start knock data until the app is ready to navigate
  const pendingKnockData = useRef<ReturnType<typeof extractKnockData>>(null);

  // ─── Cold-start: check for the FCM notification that launched the app ───
  useEffect(() => {
    if (coldStartHandled.current) return;

    const checkInitialNotification = async () => {
      try {
        // Primary: use Firebase Messaging getInitialNotification (works for FCM cold-start)
        const remoteMessage = await messaging().getInitialNotification();
        const knockData = extractKnockDataFromMessage(remoteMessage);
        if (knockData) {
          console.log('[RootLayout] Cold-start FCM notification detected:', knockData.logId);
          pendingKnockData.current = knockData;
          return;
        }

        // Fallback: expo-notifications response (covers edge cases)
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        const expoKnockData = extractKnockData(lastResponse);
        if (expoKnockData) {
          console.log('[RootLayout] Cold-start expo notification detected:', expoKnockData.logId);
          pendingKnockData.current = expoKnockData;
        }
      } catch (e) {
        console.error('[RootLayout] Error checking initial notification:', e);
      }
    };

    checkInitialNotification();
  }, []);

  // ─── Navigate to knock-detail once the app has settled on a real screen ───
  // We wait until segments indicate the user is past auth (e.g. on home tab).
  // This prevents trying to push before the navigator stack is ready.
  useEffect(() => {
    if (coldStartHandled.current) return;
    if (!pendingKnockData.current) return;

    // segments example: ["(Tabs)", "home"]  — means the tab navigator is mounted
    const isOnHomeScreen =
      segments.length >= 1 &&
      (segments[0] === '(Tabs)' || segments.join('/').includes('home'));

    if (isOnHomeScreen) {
      const knockData = pendingKnockData.current;
      pendingKnockData.current = null;
      coldStartHandled.current = true;

      console.log('[RootLayout] Navigating to knock-detail from cold-start');
      // Use setTimeout to ensure navigation happens after the current render cycle
      setTimeout(() => {
        router.push({
          pathname: '/knock-detail' as any,
          params: knockData,
        });
      }, 100);
    }
  }, [segments, router]);

  const showCustomSplash = !customSplashDone || (!fontsLoaded && !fontError);
  if (showCustomSplash) {
    return (
      <AppSplash
        onFinish={customSplashDone ? undefined : () => setCustomSplashDone(true)}
      />
    );
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(Tabs)" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="onboard-qr" />  
          <Stack.Screen name="knock-detail" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </NotificationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  offlineBannerContainer: {
    backgroundColor: '#b52424', // deep red matching alert
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 9999,
    elevation: 10,
  },
  offlineBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Gilroy-Medium',
  },
});
