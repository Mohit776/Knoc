import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import admin from 'firebase-admin';

/**
 * POST /api/generate-qr
 * Body: { count: number }   (1–50)
 *
 * Generates `count` blank QR code entries in Firestore
 * (mirrors Python generate_qr.py logic exactly).
 *
 * Returns JSON: { results: [{ qr_id, qr_url, success, error? }] }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const count = Math.min(Math.max(Number(body.count) || 1, 1), 50);

        // Use the deployed domain or fallback
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : 'https://knoc.vercel.app');

        const results: {
            qr_id: string;
            qr_url: string;
            success: boolean;
            error?: string;
        }[] = [];

        for (let i = 0; i < count; i++) {
            // Same ID format as Python: "KNO" + first 10 hex chars of uuid, uppercased
            const qr_id = 'KNO' + uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase();
            const qr_url = `${baseUrl}/qr/${qr_id}`;

            try {
                await db.collection('qr_codes').doc(qr_id).set({
                    qr_id,
                    name: null,
                    location: null,
                    phone_number: null,
                    fcm_token: null,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                });

                results.push({ qr_id, qr_url, success: true });
            } catch (err: any) {
                results.push({
                    qr_id,
                    qr_url,
                    success: false,
                    error: err.message || 'Firestore write failed',
                });
            }
        }

        return NextResponse.json({ results });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Unexpected error' },
            { status: 500 },
        );
    }
}
