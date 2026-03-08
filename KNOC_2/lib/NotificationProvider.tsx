/**
 * Centralized Notification Provider
 *
 * Single source of truth for all FCM / push-notification logic:
 *  - Android notification channel setup
 *  - Custom permission popup (soft-ask) before the system dialog
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
    useState,
    useRef,
} from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import NotificationPermissionPopup from './NotificationPermissionPopup';

// ── Constants ──────────────────────────────────────────────────────────
const LAST_TOKEN_KEY = 'fcm_token_cached';
const POPUP_SHOWN_KEY = 'notification_popup_shown';

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
/** Cached in memory so we never request the token twice per session. */
let inMemoryToken: string | null = null;

// ── Internal helpers ───────────────────────────────────────────────────

/**
 * Set up the Android notification channel (still needed for expo-notifications
 * foreground display).
 */
async function ensureAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#431BB8',
        });
        console.log('[Notifications] Android channel configured.');
    }
}

/**
 * Request notification permission via Firebase Messaging and retrieve
 * the FCM device token.
 *
 * Returns the token string, or `null` if permission was denied or
 * a token could not be obtained.
 */
async function requestPermissionAndGetToken(): Promise<string | null> {
    // Physical device check
    if (!Device.isDevice) {
        console.log('[Notifications] Not a physical device — skipping token.');
        return null;
    }

    // Fast path — already resolved this session
    if (inMemoryToken) {
        console.log('[Notifications] Using cached in-memory token.');
        return inMemoryToken;
    }

    // Check if permission is already granted (without prompting)
    const currentStatus = await messaging().hasPermission();
    const alreadyGranted =
        currentStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        currentStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!alreadyGranted) {
        // Request permission via Firebase Messaging (handles iOS + Android 13+)
        console.log('[Notifications] Requesting permission from system...');
        const authStatus = await messaging().requestPermission();
        const permissionGranted =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!permissionGranted) {
            console.log('[Notifications] Permission denied (status:', authStatus, ')');
            return null;
        }
    }

    console.log('[Notifications] Permission granted. Getting FCM token...');

    // Get FCM token via native Firebase SDK
    try {
        const token = await messaging().getToken();
        if (token) {
            console.log(
                '[Notifications] FCM token obtained:',
                token.substring(0, 20) + '…',
            );
            inMemoryToken = token;
        } else {
            console.warn('[Notifications] FCM getToken returned empty.');
        }
        return token;
    } catch (e) {
        console.error('[Notifications] Error getting FCM token:', e);
        return null;
    }
}

/**
 * Write `currentToken` to the Firestore `qr_codes/{qrId}` document,
 * but ONLY if it differs from both the local cache and the remote value.
 *
 * Uses `set` with merge to be safe even if the field doesn't exist yet.
 */
async function syncTokenToFirestore(currentToken: string): Promise<void> {
    const qrId = await AsyncStorage.getItem('linked_qr_id');
    if (!qrId) {
        console.log('[Notifications] No linked QR — skipping token sync (will retry after onboarding).');
        return;
    }

    // Fast check: local cache
    const cachedToken = await AsyncStorage.getItem(LAST_TOKEN_KEY);
    if (cachedToken === currentToken) {
        console.log('[Notifications] Token unchanged (local cache). Skipping write.');
        return;
    }

    try {
        // Double-check against Firestore
        const qrDoc = await firestore().collection('qr_codes').doc(qrId).get();

        if (!qrDoc.exists) {
            console.warn('[Notifications] QR doc does not exist in Firestore:', qrId);
            return;
        }

        const remoteToken = qrDoc.data()?.fcm_token;
        if (remoteToken === currentToken) {
            await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
            console.log('[Notifications] Token unchanged (Firestore). Local cache updated.');
            return;
        }

        // Token is new or changed — write it
        console.log('[Notifications] Token changed. Writing to Firestore for:', qrId);
        await firestore().collection('qr_codes').doc(qrId).set(
            { fcm_token: currentToken },
            { merge: true }
        );
        await AsyncStorage.setItem(LAST_TOKEN_KEY, currentToken);
        console.log('[Notifications] ✅ Token saved to Firestore successfully.');
    } catch (e) {
        console.error('[Notifications] ❌ Error syncing token to Firestore:', e);
    }
}

/**
 * Full pipeline: ensure permission is granted, get the token, then sync.
 * This is safe to call multiple times — it will not re-prompt for permission
 * if already granted.
 */
async function setupAndSync(): Promise<void> {
    try {
        await ensureAndroidChannel();
        const token = await requestPermissionAndGetToken();
        if (token) {
            await syncTokenToFirestore(token);
        } else {
            console.log('[Notifications] No token obtained. Sync skipped.');
        }
    } catch (e) {
        console.error('[Notifications] setupAndSync error:', e);
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
    const [showPopup, setShowPopup] = useState(false);
    const [permissionReady, setPermissionReady] = useState(false);
    const tokenRefreshUnsub = useRef<(() => void) | null>(null);

    const triggerSync = useCallback(async () => {
        console.log('[Notifications] triggerSync called.');
        // Always attempt the full pipeline when explicitly triggered
        await setupAndSync();
    }, []);

    // ── On mount: decide whether to show the popup ─────────────────────
    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            // 1. Set up the Android channel right away
            await ensureAndroidChannel();

            // 2. Check if permission was already granted
            if (Device.isDevice) {
                const authStatus = await messaging().hasPermission();
                const alreadyGranted =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (alreadyGranted) {
                    // Permission already granted — skip popup, go straight to sync
                    console.log('[Notifications] Permission already granted. Skipping popup.');
                    if (!cancelled) {
                        setPermissionReady(true);
                    }
                    return;
                }
            } else {
                // Not a physical device — skip everything
                console.log('[Notifications] Not a physical device. Skipping popup.');
                if (!cancelled) setPermissionReady(true);
                return;
            }

            // 3. Check if we've already shown the popup (user previously tapped "Not Now")
            const popupShown = await AsyncStorage.getItem(POPUP_SHOWN_KEY);
            if (popupShown === 'true') {
                // They've seen it already — silently proceed.
                // Don't request permission again (they already declined our popup).
                // The system permission will be requested when triggerSync() is
                // called explicitly (e.g. after onboarding).
                console.log('[Notifications] Popup previously shown. Will sync on demand.');
                if (!cancelled) {
                    setPermissionReady(true);
                }
                return;
            }

            // 4. Show the custom popup
            if (!cancelled) {
                console.log('[Notifications] Showing notification permission popup.');
                setShowPopup(true);
            }
        };

        init().catch(console.error);

        return () => {
            cancelled = true;
        };
    }, []);

    // ── When permission is ready, run sync and set up listeners ──────────
    useEffect(() => {
        if (!permissionReady) return;

        // Run the initial sync (will be a no-op if no linked_qr_id yet)
        setupAndSync();

        // ── FOREGROUND MESSAGE LISTENER ────────────────────────────────
        // When the app is in the foreground, Firebase does NOT display
        // the notification automatically. We must intercept it and
        // schedule a local notification via expo-notifications.
        const unsubscribeOnMessage = messaging().onMessage(
            async (remoteMessage) => {
                console.log(
                    '[Notifications] Foreground FCM message received:',
                    JSON.stringify(remoteMessage.notification?.title),
                );

                const title =
                    remoteMessage.notification?.title ?? 'New Notification';
                const body =
                    remoteMessage.notification?.body ?? '';

                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title,
                            body,
                            sound: 'default',
                            data: remoteMessage.data ?? {},
                        },
                        trigger: null, // fire immediately
                    });
                    console.log('[Notifications] Local notification scheduled for foreground message.');
                } catch (e) {
                    console.error('[Notifications] Error scheduling local notification:', e);
                }
            },
        );

        // Listen for FCM token refreshes
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
        tokenRefreshUnsub.current = unsubscribeTokenRefresh;

        return () => {
            unsubscribeOnMessage();
            unsubscribeTokenRefresh();
        };
    }, [permissionReady]);

    // ── Popup callbacks ────────────────────────────────────────────────

    const handleEnableNotifications = useCallback(async () => {
        console.log('[Notifications] User tapped "Enable Notifications".');
        // Hide popup first
        setShowPopup(false);
        // Mark as shown so it won't appear again
        await AsyncStorage.setItem(POPUP_SHOWN_KEY, 'true');

        // Request permission DIRECTLY here (on user gesture) so Android
        // shows the system dialog reliably on Android 13+.
        try {
            // 1. Request via expo-notifications (handles POST_NOTIFICATIONS on Android 13+)
            const { status } = await Notifications.requestPermissionsAsync();
            console.log('[Notifications] Expo permission result:', status);

            // 2. Also request via Firebase Messaging (syncs Firebase's internal state)
            const authStatus = await messaging().requestPermission();
            console.log('[Notifications] Firebase permission result:', authStatus);
        } catch (e) {
            console.error('[Notifications] Error requesting permission:', e);
        }

        // Now mark as ready — the useEffect will start sync + listeners
        setPermissionReady(true);
    }, []);

    const handleSkipNotifications = useCallback(async () => {
        console.log('[Notifications] User tapped "Not Now".');
        // Hide popup
        setShowPopup(false);
        // Mark as shown
        await AsyncStorage.setItem(POPUP_SHOWN_KEY, 'true');
        // Do NOT request permission — the user declined.
        // Set permissionReady so listeners/sync can still start
        // (they will gracefully handle the case where permission is denied).
        setPermissionReady(true);
    }, []);

    return (
        <NotificationContext.Provider value={{ triggerSync }}>
            {children}
            <NotificationPermissionPopup
                visible={showPopup}
                onEnable={handleEnableNotifications}
                onSkip={handleSkipNotifications}
            />
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
    // Also clear the popup flag so it shows again for the next user
    await AsyncStorage.removeItem(POPUP_SHOWN_KEY);
}
