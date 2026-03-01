import { db } from '../../../lib/firebase';
import { notFound } from 'next/navigation';
import VisitorSelector from './VisitorSelector';

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
    const docId = resolvedParams.qr_id;
    const qrData = await getQRData(docId);

    if (!qrData) {
        notFound();
    }

    const isLinked = !!qrData.location;

    return (
        <VisitorSelector
            qrId={docId}
            location={qrData.location}
            isLinked={isLinked}
        />
    );
}

export async function generateMetadata({ params }: { params: Promise<{ qr_id: string }> }) {
    const resolvedParams = await params;
    return {
        title: `KNOC — Visitor at ${resolvedParams.qr_id}`,
        description: 'Someone is at your door. Respond via KNOC.',
    };
}
