'use client';

export default function ActionButtons({ qrId }: { qrId: string }) {
    const handleAction = async (action: string) => {
        try {
            const res = await fetch(`/api/notify/${qrId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send notification');
            alert(`✅ Notification sent: ${action}`);
        } catch (error: any) {
            console.error(error);
            alert(`❌ Could not send notification: ${error.message}`);
        }
    };

    return (
        <div className="flex flex-col gap-[14px] pb-6">
            <button
                onClick={() => handleAction('Alarm')}
                className="w-full h-[56px] bg-[#431BB8] text-white rounded-[12px] font-semibold text-[16px] hover:bg-[#32138A] active:scale-[0.98] transition-all shadow-sm"
            >
                Alarm
            </button>

            <button
                onClick={() => handleAction('Entry')}
                className="w-full h-[56px] bg-white border border-[#926FF3] text-[#1A1A1A] rounded-[12px] font-semibold text-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
                Entry
            </button>

            <button
                onClick={() => handleAction('No Entry')}
                className="w-full h-[56px] bg-white border border-[#926FF3] text-[#1A1A1A] rounded-[12px] font-semibold text-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
                No Entry
            </button>
        </div>
    );
}
