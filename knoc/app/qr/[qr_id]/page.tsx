import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import ActionButtons from './ActionButtons';

interface QRData {
    qr_id: string;
    user_id: string | null;
    phone_number: string | null;
    location: string | null;
    fcm_token: string | null;
    created_at: string;
}

async function getQRData(qrId: string): Promise<QRData | null> {
    const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('qr_id', qrId)
        .single();

    if (error || !data) return null;
    return data as QRData;
}

export default async function QRPage({ params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    const qrData = await getQRData(resolvedParams.qr_id);

    if (!qrData) {
        notFound();
    }

    const isLinked = !!qrData.location || !!qrData.user_id;

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            <div className="flex flex-col flex-1 w-full max-w-md mx-auto p-6 pt-12 h-screen max-h-screen overflow-hidden">

                {/* KNOC Logo Header */}
                <div className="flex justify-center mb-5">
                    <img
                        src="/Group 1171275857.png"
                        alt="KNOC"
                        className="h-9 object-contain"
                    />
                </div>

                {/* Main Image Container */}
                <div
                    className="w-full bg-[#f4f3ff] rounded-[2rem] overflow-hidden border-[3px] border-[#431BB8] relative flex-shrink-[1] min-h-0 mb-6"
                    style={{ flexBasis: '55%' }}
                >
                    <img
                        src="/main.png"
                        alt="Visitor"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Location / Info badge */}
                {isLinked ? (
                    <div className="mb-4 px-4 py-3 bg-[#f4f3ff] rounded-xl border border-[#431BB8] border-opacity-20">
                        <p className="text-sm text-[#8E8E93] font-medium">Location</p>
                        <p className="text-base text-[#1A1A1A] font-semibold">{qrData.location || 'Unknown'}</p>
                        <p className="text-xs text-[#926FF3] mt-1">QR ID: {qrData.qr_id}</p>
                    </div>
                ) : (
                    <div className="mb-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-700 font-medium">⚠️ This QR code has not been linked yet.</p>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons Section */}
                <ActionButtons qrId={qrData.qr_id} />

            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    return {
        title: `KNOC — Visitor at ${resolvedParams.qr_id}`,
        description: 'Someone is at your door. Respond via KNOC.',
    };
}
