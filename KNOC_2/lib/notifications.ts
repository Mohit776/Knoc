import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
        console.log('[Notifications] Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#431BB8',
        });
    }

    if (Device.isDevice) {
        console.log('[Notifications] Physical device detected. Checking permissions...');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('[Notifications] Current permission status:', existingStatus);
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            console.log('[Notifications] Requesting permissions from user...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log('[Notifications] Permission result:', status);
        }

        if (finalStatus !== 'granted') {
            console.log('[Notifications] Permission DENIED. Cannot get push token.');
            return;
        }

        // Use raw FCM device token (works with google-services.json, no Expo project ID needed)
        try {
            console.log('[Notifications] Getting FCM device token...');
            const tokenResponse = await Notifications.getDevicePushTokenAsync();
            token = tokenResponse.data as string;
            console.log('[Notifications] FCM Device Token obtained:', token.substring(0, 20) + '...');
        } catch (e) {
            console.error('[Notifications] Error getting FCM device token:', e);
        }
    } else {
        console.log('[Notifications] Not a physical device. Push notifications not available.');
    }

    return token;
}
