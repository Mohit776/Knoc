import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

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

        const { data, error } = await supabase
            .from('knoc_logs')
            .update({
                response,
                responded_at: new Date().toISOString(),
            })
            .eq('id', logId)
            .select()
            .single();

        if (error || !data) {
            return NextResponse.json({ error: error?.message || 'Log not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, log: data });
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
        const { data, error } = await supabase
            .from('knoc_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
