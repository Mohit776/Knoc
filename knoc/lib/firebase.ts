import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

    if (!serviceAccount) {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT env var is missing! Database will fail.');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin Initialized successfully.');
    }
}

export const db = admin.firestore();
export const messaging = admin.messaging();
