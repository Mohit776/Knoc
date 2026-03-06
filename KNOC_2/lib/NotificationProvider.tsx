/**
 * Centralized Notification Provider
 *
 * Single source of truth for all FCM / push-notification logic:
 *  - Android notification channel setup
 *  - Permission check / request (once)
 *  - FCM device-token retrieval
 *  - Token-refresh listener (equivalent of messaging().onTokenRefresh())
 *  - Firestore sync — writes ONLY when the token is new or changed
 *
 * Screens should NEVER request permissions or tokens themselves.
 * After changing `linked_qr_id` in AsyncStorage (onboard / OTP),
 * call `triggerSync()` from context to flush the cached token to Firestore.
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useCallback,
} from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// ── Constants ──────────────────────────────────────────────────────────
const LAST_TOKEN_KEY = 'fcm_token_cached';

// ── Foreground notification behaviour ──────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// ── Module-level state ─────────────────────────────────────────────────
/** Prevents concurrent runs of the setup / sync pipeline, but queues the next run if requested. */
let isSyncing = false;
let syncQueued = false;

/** Cached in memory so we never request the token twice per session. */
let inMemoryToken: string | null = null;

// ── Internal helpers ───────────────────────────────────────────────────

/**
 * One-time setup: create the Android notification channel, check / request
 * permissions, and fetch the device push token.  The token is stored both
 * in-memory and in AsyncStorage so subsequent calls are cheap no-ops.
 *
 * Returns the token string, or `null` if unavailable.
 */
async function ensureTokenReady(): Promise<string | null> {
    // Fast path — already resolved this session
    if (inMemoryToken) return inMemoryToken;

    // 1. Android channel (still needed for expo-notifications foreground display)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#431BB8',
        });
        console.log('[Notifications] Android channel configured.');
    }

    // 2. Physical device check
    if (!Device.isDevice) {
        console.log('[Notifications] Not a physical device — skipping token.');
        return null;
    }

    // 3. Request permission via Firebase Messaging (handles iOS + Android 13+)
    const authStatus = await messaging().requestPermission();
    const permissionGranted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!permissionGranted) {
        console.log('[Notifications] Permission denied (status:', authStatus, ')');
        return null;
    }

    // 4. Get FCM token via native Firebase SDK — works reliably in production APKs
    try {
        const token = await messaging().getToken();
        console.log(
            '[Notifications] FCM token obtained:',
            token?.substring(0, 20) + '…',
        );
        inMemoryToken = token;
        return token;
    } catch (e) {
        console.error('[Notifications] Error getting FCM token:', e);
        return null;
    }
}

/**
 * Write `currentToken` to the Firestore `qr_codes/{qrId}` document,
 * but ONLY if it differs from both the local cache and the remote value.
 */
async function syncTokenToFirestore(currentToken: string): Promise<void> {
    const qrId = await AsyncStorage.getItem('linked_qr_id');
    if (!qrId) {
        // No QR linked yet — do NOT cache the token locally.
        // When triggerSync() is called later (after onboarding), it needs
        // to detect the token as "new" so it actually writes to Firestore.
        console.log('[Notifications] No linked QR — skipping token sync (will retry after onboarding).');
        return;
    }

    // Fast check: local cache
    const cachedToken = await AsyncStorage.getItem(LAST_TOKEN_KEY);
    if (cachedToken === currentToken) {
        console.log('[Notifications] Token unchanged (local cache). Skipping write.');
        return;
    }

    // Double-check against Firestore
    const qrDoc = await getDoc(doc(db, 'qr_codes', qrId));
    const remoteToken = qrDoc.data()?.fcm_token;
    if (remoteToken === currentToken) {
        await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
        console.log('[Notifications] Token unchanged (Firestore). Local cache updated.');
        return;
    }

    // Token is new or changed — write once
    console.log('[Notifications] Token changed. Writing to Firestore for:', qrId);
    await updateDoc(doc(db, 'qr_codes', qrId), { fcm_token: currentToken });
    await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
    console.log('[Notifications] Token saved to Firestore.');
}

/**
 * Full pipeline: ensure the token is ready, then sync to Firestore.
 * If called while already syncing, it queues exactly one additional sync to run
 * after the current one finishes, ensuring no state changes are missed.
 */
async function setupAndSync(): Promise<void> {
    if (isSyncing) {
        console.log('[Notifications] Sync already in progress — queueing another run.');
        syncQueued = true;
        return;
    }
    isSyncing = true;

    try {
        const token = await ensureTokenReady();
        if (token) {
            await syncTokenToFirestore(token);
        }
    } catch (e) {
        console.error('[Notifications] setupAndSync error:', e);
    } finally {
        isSyncing = false;
        if (syncQueued) {
            syncQueued = false;
            console.log('[Notifications] Running queued sync...');
            // Launch the next sync without awaiting it here
            setupAndSync().catch(console.error);
        }
    }
}

// ── React Context ──────────────────────────────────────────────────────

interface NotificationContextValue {
    /**
     * Trigger a token → Firestore sync.  Call this after setting
     * `linked_qr_id` in AsyncStorage (e.g. after onboarding or login).
     */
    triggerSync: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
    triggerSync: async () => { },
});

export const useNotification = () => useContext(NotificationContext);

// ── Provider Component ─────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const triggerSync = useCallback(async () => {
        await setupAndSync();
    }, []);

    useEffect(() => {
        // Run the full pipeline once on app startup
        setupAndSync();

        // Listen for FCM token refreshes via native Firebase Messaging
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(
            (newToken: string) => {
                console.log(
                    '[Notifications] Token refreshed:',
                    newToken?.substring(0, 20) + '…',
                );
                inMemoryToken = newToken;
                syncTokenToFirestore(newToken).catch((e) =>
                    console.error('[Notifications] Token-refresh sync error:', e),
                );
            },
        );

        return () => {
            unsubscribeTokenRefresh();
        };
    }, []);

    return (
        <NotificationContext.Provider value={{ triggerSync }}>
            {children}
        </NotificationContext.Provider>
    );
}

// ── Standalone export for logout flow ──────────────────────────────────

/**
 * Clear the locally cached token.  Call on sign-out so the next
 * session performs a fresh sync.
 */
export async function clearCachedFcmToken(): Promise<void> {
    inMemoryToken = null;
    await AsyncStorage.removeItem(LAST_TOKEN_KEY);
}
