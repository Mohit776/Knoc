import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';

// GET /api/knoc-logs/[qr_id]  — get recent knoc logs + stats for a QR code
export async function GET(request: Request, { params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    const qrId = resolvedParams.qr_id;

    try {
        // Fetch recent knoc logs (last 20)
        const snapshot = await db.collection('knoc_logs')
            .where('qr_id', '==', qrId)
            .orderBy('created_at', 'desc')
            .limit(20)
            .get();

        const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
                responded_at: data.responded_at?.toDate?.()?.toISOString() || data.responded_at
            };
        });

        // Compute stats
        const allLogs = logs || [];
        const entryCount = allLogs.filter((l: any) => l.action === 'Entry' || l.response === 'coming').length;
        const exitCount = allLogs.filter((l: any) => l.action === 'No Entry' || l.response === 'ignored').length;
        const totalCount = allLogs.length;

        return NextResponse.json({
            logs: allLogs,
            stats: {
                entry: entryCount,
                exit: exitCount,
                total: totalCount,
            },
        });
    } catch (err: any) {
        console.error('get knoc-logs err:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
