import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import * as admin from 'firebase-admin';

// PATCH /api/knoc-log/[log_id]  — update response (coming / ignored)
export async function PATCH(request: Request, { params }: { params: Promise<{ log_id: string }> }) {
    const resolvedParams = await params;
    const logId = resolvedParams.log_id;

    try {
        const body = await request.json();
        const response = body.response; // 'coming' or 'ignored'

        if (!response || !['coming', 'ignored'].includes(response)) {
            return NextResponse.json(
                { error: 'Invalid response. Must be "coming" or "ignored".' },
                { status: 400 }
            );
        }

        const logRef = db.collection('knoc_logs').doc(logId);
        await logRef.update({
            response,
            responded_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await logRef.get();

        return NextResponse.json({ success: true, log: { id: updatedDoc.id, ...updatedDoc.data() } });
    } catch (err: any) {
        console.error('Knoc-log PATCH error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET /api/knoc-log/[log_id]  — get a single log
export async function GET(request: Request, { params }: { params: Promise<{ log_id: string }> }) {
    const resolvedParams = await params;
    const logId = resolvedParams.log_id;

    try {
        const doc = await db.collection('knoc_logs').doc(logId).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }

        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
