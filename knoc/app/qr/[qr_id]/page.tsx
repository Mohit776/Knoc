import { db } from '../../../lib/firebase';
import { notFound } from 'next/navigation';
import ActionButtons from './ActionButtons';

interface QRData {
    qr_id: string;
    phone_number: string | null;
    location: string | null;
    fcm_token: string | null;
    created_at: any;
}

async function getQRData(qrId: string): Promise<QRData | null> {
    try {
        const doc = await db.collection('qr_codes').doc(qrId).get();
        if (!doc.exists) return null;
        return doc.data() as QRData;
    } catch (e) {
        console.error('Error fetching QR data:', e);
        return null;
    }
}

export default async function QRPage({ params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    // Use the URL param as the canonical document ID for all downstream operations
    const docId = resolvedParams.qr_id;
    const qrData = await getQRData(docId);

    if (!qrData) {
        notFound();
    }

    const isLinked = !!qrData.location;

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
                        <p className="text-xs text-[#926FF3] mt-1">QR ID: {docId}</p>
                    </div>
                ) : (
                    <div className="mb-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-700 font-medium">⚠️ This QR code has not been linked yet.</p>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons — use document ID (URL param), NOT the qr_id data field */}
                <ActionButtons qrId={docId} />

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
