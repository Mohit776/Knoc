import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import admin from 'firebase-admin';

// Initialize firebase-admin once (singleton pattern for Next.js hot reloads)
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

    if (!serviceAccount) {
        console.error('FIREBASE_SERVICE_ACCOUNT env var is missing!');
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    const qrId = resolvedParams.qr_id;

    try {
        const body = await request.json();
        const action = body.action || 'Alarm';

        // 1. Fetch the QR code record to get the FCM token
        const { data: qrData, error } = await supabase
            .from('qr_codes')
            .select('fcm_token, location')
            .eq('qr_id', qrId)
            .single();

        if (error || !qrData) {
            return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
        }

        const fcmToken = qrData.fcm_token;

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'No push token registered for this QR code' },
                { status: 400 }
            );
        }

        // 2. Insert a knoc_logs entry
        const { data: logData, error: logError } = await supabase
            .from('knoc_logs')
            .insert({ qr_id: qrId, action })
            .select('id')
            .single();

        if (logError) {
            console.error('Failed to insert knoc_log:', logError);
        }

        const logId = logData?.id || null;

        // 3. Build & send the FCM message via Firebase Admin
        const message = {
            token: fcmToken,
            notification: {
                title: `Visitor at ${qrData.location || 'your door'}!`,
                body: `Someone pressed: ${action}`,
            },
            data: {
                qrId,
                action,
                logId: logId || '',
            },
            android: {
                priority: 'high' as const,
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
        };

        const messageId = await admin.messaging().send(message);
        console.log('FCM notification sent, messageId:', messageId);

        return NextResponse.json({ success: true, messageId, logId });
    } catch (err: any) {
        console.error('Notify API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
