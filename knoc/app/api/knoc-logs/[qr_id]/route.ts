import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET /api/knoc-logs/[qr_id]  — get recent knoc logs + stats for a QR code
export async function GET(request: Request, { params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    const qrId = resolvedParams.qr_id;

    try {
        // Fetch recent knoc logs (last 20)
        const { data: logs, error } = await supabase
            .from('knoc_logs')
            .select('*')
            .eq('qr_id', qrId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Compute stats
        const allLogs = logs || [];
        const entryCount = allLogs.filter(l => l.action === 'Entry' || l.response === 'coming').length;
        const exitCount = allLogs.filter(l => l.action === 'No Entry' || l.response === 'ignored').length;
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
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
