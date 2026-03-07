/**
 * Centralized FCM Token Manager
 *
 * Ensures the device push token is requested ONCE and only written to
 * Firestore when it is missing or has actually changed.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { registerForPushNotificationsAsync } from './notifications';

const LAST_TOKEN_KEY = 'fcm_token_cached';

// In-memory flag to prevent concurrent runs within the same app session
let syncInProgress = false;

/**
 * Sync the FCM device token to Firestore.
 *
 * - Reads the linked QR ID from AsyncStorage.
 * - Requests the current device push token (only once per call).
 * - Compares against the locally cached token AND the Firestore value.
 * - Writes to Firestore ONLY if the token is new or changed.
 *
 * Safe to call multiple times — duplicate calls are no-ops.
 */
export async function syncFcmToken(): Promise<void> {
    // Prevent concurrent runs
    if (syncInProgress) {
        console.log('[FCM] Token sync already in progress, skipping.');
        return;
    }
    syncInProgress = true;

    try {
        // 1. Get linked QR ID
        const qrId = await AsyncStorage.getItem('linked_qr_id');
        if (!qrId) {
            console.log('[FCM] No linked QR ID found. Skipping token sync.');
            return;
        }

        // 2. Request the current device push token
        console.log('[FCM] Requesting device push token...');
        const currentToken = await registerForPushNotificationsAsync();
        if (!currentToken) {
            console.warn('[FCM] No push token obtained. Notifications may not work.');
            return;
        }

        // 3. Fast check: compare against locally cached token
        const cachedToken = await AsyncStorage.getItem(LAST_TOKEN_KEY);
        if (cachedToken === currentToken) {
            console.log('[FCM] Token unchanged (matches local cache). No Firestore write needed.');
            return;
        }

        // 4. Double-check against Firestore (in case another device/session updated it)
        const qrDoc = await firestore().collection('qr_codes').doc(qrId).get();
        const existingToken = qrDoc.data()?.fcm_token;

        if (existingToken === currentToken) {
            // Firestore already has the current token — just update local cache
            console.log('[FCM] Token unchanged (matches Firestore). Updating local cache only.');
            await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
            return;
        }

        // 5. Token is new or changed — write to Firestore
        console.log('[FCM] Token changed. Updating Firestore for doc:', qrId);
        await firestore().collection('qr_codes').doc(qrId).update({ fcm_token: currentToken });
        await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
        console.log('[FCM] Token saved successfully.');
    } catch (e) {
        console.error('[FCM] Error syncing token:', e);
    } finally {
        syncInProgress = false;
    }
}

/**
 * Clear the cached token (call on logout).
 */
export async function clearCachedFcmToken(): Promise<void> {
    await AsyncStorage.removeItem(LAST_TOKEN_KEY);
}
