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
    useRef,
    useCallback,
} from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from '@react-native-firebase/firestore';

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
/** Prevents concurrent runs of the setup / sync pipeline. */
let syncInProgress = false;

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

    // 1. Android channel
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

    // 3. Permissions (ask only when not yet granted)
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
        console.log('[Notifications] Requesting permission…');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission denied.');
        return null;
    }

    // 4. FCM device token
    try {
        const response = await Notifications.getDevicePushTokenAsync();
        const token = response.data as string;
        console.log(
            '[Notifications] FCM token obtained:',
            token?.substring(0, 20) + '…',
        );
        inMemoryToken = token;
        return token;
    } catch (e) {
        console.error('[Notifications] Error getting device token:', e);
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
        // No QR linked yet — just cache the token locally.
        await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
        console.log('[Notifications] No linked QR — token cached locally.');
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
 * Safe to call many times — concurrent / duplicate calls are no-ops.
 */
async function setupAndSync(): Promise<void> {
    if (syncInProgress) {
        console.log('[Notifications] Sync already in progress — skipping.');
        return;
    }
    syncInProgress = true;

    try {
        const token = await ensureTokenReady();
        if (token) {
            await syncTokenToFirestore(token);
        }
    } catch (e) {
        console.error('[Notifications] setupAndSync error:', e);
    } finally {
        syncInProgress = false;
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
    triggerSync: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

// ── Provider Component ─────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const tokenListenerRef = useRef<Notifications.Subscription | null>(null);

    const triggerSync = useCallback(async () => {
        await setupAndSync();
    }, []);

    useEffect(() => {
        // Run the full pipeline once on app startup
        setupAndSync();

        // Listen for token refreshes (equivalent of messaging().onTokenRefresh())
        tokenListenerRef.current = Notifications.addPushTokenListener(
            ({ data }) => {
                const newToken = data as string;
                console.log(
                    '[Notifications] Token refreshed:',
                    newToken?.substring(0, 20) + '…',
                );
                // Update in-memory cache and sync
                inMemoryToken = newToken;
                syncTokenToFirestore(newToken).catch((e) =>
                    console.error('[Notifications] Token-refresh sync error:', e),
                );
            },
        );

        return () => {
            tokenListenerRef.current?.remove();
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
