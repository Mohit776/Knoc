import { NextResponse } from 'next/server';
import { db, messaging } from '../../../../lib/firebase';
import * as admin from 'firebase-admin';

export async function POST(request: Request, { params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    const qrId = resolvedParams.qr_id;

    try {
        const body = await request.json();
        const action = body.action || 'Alarm';
        const visitorType: string = body.visitorType || 'visitor'; // 'visitor' | 'delivery'
        const deliveryApp: string | null = body.deliveryApp || null;
        const visitorName: string | null = body.visitorName || null;
        const visitorMobile: string | null = body.visitorMobile || null;

        // 1. Fetch the QR code record to get the FCM token
        const qrDoc = await db.collection('qr_codes').doc(qrId).get();

        if (!qrDoc.exists) {
            return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
        }

        const qrData = qrDoc.data();
        const fcmToken = qrData?.fcm_token;

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'No push token registered for this QR code' },
                { status: 400 }
            );
        }

        // 2. Insert a knoc_logs entry
        const knocLogsCol = db.collection('knoc_logs');
        const newLogRef = await knocLogsCol.add({
            qr_id: qrId,
            action: action,
            visitor_type: visitorType,
            ...(deliveryApp && { delivery_app: deliveryApp }),
            ...(visitorName && { visitor_name: visitorName }),
            ...(visitorMobile && { visitor_mobile: visitorMobile }),
            response: null,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            responded_at: null,
        });

        const logId = newLogRef.id;

        // 3. Build & send the FCM message via Firebase Admin
        const message = {
            token: fcmToken,
            notification: {
                title: `${visitorType === 'delivery' ? '📦 Delivery Boy' : '👤 Visitor'} at ${qrData?.location || 'your door'}!`,
                body: visitorType === 'delivery'
                    ? `Via ${deliveryApp || 'a delivery service'} — ${action}`
                    : `${visitorName || 'Someone'} (${visitorMobile || 'unknown'}) — ${action}`,
            },
            data: {
                qrId,
                action,
                logId: logId,
                visitorType,
                ...(visitorName && { visitorName }),
                ...(visitorMobile && { visitorMobile }),
                ...(deliveryApp && { deliveryApp }),
            },
            android: {
                priority: 'high' as const,
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                    'apns-push-type': 'alert',
                },
                payload: {
                    aps: {
                        alert: {
                            title: `${visitorType === 'delivery' ? '📦 Delivery Boy' : '👤 Visitor'} at ${qrData?.location || 'your door'}!`,
                            body: visitorType === 'delivery'
                                ? `Via ${deliveryApp || 'a delivery service'} — ${action}`
                                : `${visitorName || 'Someone'} (${visitorMobile || 'unknown'}) — ${action}`,
                        },
                        sound: 'default',
                        'content-available': 1,
                    },
                },
            },
        };

        const messageId = await messaging.send(message);
        console.log('FCM notification sent, messageId:', messageId);

        return NextResponse.json({ success: true, messageId, logId });
    } catch (err: any) {
        console.error('Notify API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
