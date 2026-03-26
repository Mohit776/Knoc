import { NextRequest, NextResponse } from 'next/server';
import { db, messaging } from '../../../../lib/firebase';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

/**
 * POST /api/delete-user/send-otp
 * Body: { phone_number: string }
 *
 * Generates a 6-digit OTP, stores it in Firestore, and sends it
 * to the user's device via FCM push notification.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let phone_number: string = body.phone_number;

        if (!phone_number) {
            return NextResponse.json(
                { error: 'phone_number is required' },
                { status: 400 }
            );
        }

        // Format phone number
        if (!phone_number.startsWith('+')) {
            phone_number = `+91${phone_number.replace(/^91/, '')}`;
        }

        // Find the user's QR codes to get an FCM token
        const qrSnapshot = await db
            .collection('qr_codes')
            .where('phone_number', '==', phone_number)
            .limit(1)
            .get();

        if (qrSnapshot.empty) {
            return NextResponse.json(
                { error: 'No user found with this phone number' },
                { status: 404 }
            );
        }

        const qrData = qrSnapshot.docs[0].data();
        const fcmToken = qrData?.fcm_token;

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'No push token registered for this user. The user must have the app installed.' },
                { status: 400 }
            );
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash the OTP before storing
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        // Delete any previous OTP docs for this phone number
        const existingOtps = await db
            .collection('otp_verifications')
            .where('phone_number', '==', phone_number)
            .get();

        const batch = db.batch();
        for (const doc of existingOtps.docs) {
            batch.delete(doc.ref);
        }

        // Store new OTP in Firestore with 5-minute expiry
        const otpRef = db.collection('otp_verifications').doc();
        batch.set(otpRef, {
            phone_number,
            otp_hash: otpHash,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            verified: false,
            used: false,
        });

        await batch.commit();

        // Send OTP via FCM push notification
        const message = {
            token: fcmToken,
            notification: {
                title: '🔐 Account Deletion OTP',
                body: `Your OTP is: ${otp}. It expires in 5 minutes. Do NOT share this with anyone.`,
            },
            data: {
                type: 'delete_otp',
                otp: otp,
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
                            title: '🔐 Account Deletion OTP',
                            body: `Your OTP is: ${otp}. It expires in 5 minutes.`,
                        },
                        sound: 'default',
                        'content-available': 1,
                    },
                },
            },
        };

        await messaging.send(message);
        console.log(`OTP sent to ${phone_number} via FCM`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent to the registered device',
        });
    } catch (err: any) {
        console.error('Send OTP error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to send OTP' },
            { status: 500 }
        );
    }
}
