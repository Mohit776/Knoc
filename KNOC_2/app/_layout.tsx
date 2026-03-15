import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { ThemeProvider } from '../lib/themeContext';
import { NotificationProvider } from '../lib/NotificationProvider';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';

const { width, height } = Dimensions.get('window');

// Keep native splash visible while fonts load
SplashScreen.preventAutoHideAsync();

// ── Background FCM handler (must be registered at module scope) ─────
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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

  // Show custom JS splash screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/new_knoc/Splash_Logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
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
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background matching app.json
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: width * 0.55,
    height: height * 0.15,
  },
});
