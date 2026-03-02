'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function formatTimestamp(date: Date): string {
    return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

const MAX_ALARMS = 3;
const COOLDOWN_MS = 30_000;

type Status = 'idle' | 'waiting' | 'coming' | 'ignored';

interface Props {
    qrId: string;
    visitorType: 'visitor' | 'delivery' | null;
    // Alarm-only mode (shown on the type-selection screen)
    alarmOnly?: boolean;
    // Delivery mode props
    deliveryMode?: boolean;
    deliveryApp?: string | null;
    // Visitor mode props
    visitorMode?: boolean;
    visitorName?: string;
    visitorPurpose?: string;
}

export default function ActionButtons({
    qrId,
    visitorType,
    alarmOnly = false,
    deliveryMode = false,
    deliveryApp = null,
    visitorMode = false,
    visitorName = '',
    visitorPurpose = '',
}: Props) {
    const [status, setStatus] = useState<Status>('idle');
    const [logId, setLogId] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const [alarmCount, setAlarmCount] = useState(0);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const alarmDisabled =
        status === 'ignored' || alarmCount >= MAX_ALARMS || cooldown > 0 || status === 'waiting';
    const alarmsRemaining = MAX_ALARMS - alarmCount;

    const startCooldown = useCallback(() => {
        setCooldown(COOLDOWN_MS / 1000);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    useEffect(() => {
        if (!logId || status !== 'waiting') return;
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/knoc-log/${logId}`);
                if (!res.ok) return;
                const log = await res.json();
                if (log.response === 'coming') {
                    setStatus('coming'); clearInterval(pollRef.current!);
                } else if (log.response === 'ignored') {
                    setStatus('ignored'); clearInterval(pollRef.current!);
                }
            } catch (e) { console.error('Polling error:', e); }
        }, 3000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [logId, status]);

    const handleAction = async (action: string) => {
        if (status === 'waiting') return;
        if (action === 'Alarm') {
            if (alarmCount >= MAX_ALARMS || cooldown > 0) return;
        }

        setSelectedAction(action);
        setStatus('waiting');

        try {
            const res = await fetch(`/api/notify/${qrId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    visitorType: visitorType ?? 'visitor',
                    ...(deliveryMode && { deliveryApp }),
                    ...(visitorMode && { visitorName, visitorPurpose }),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send notification');
            if (data.logId) setLogId(data.logId);
            if (action === 'Alarm') { setAlarmCount(prev => prev + 1); startCooldown(); }
        } catch (error: any) {
            console.error(error);
            alert(`❌ Could not send notification: ${error.message}`);
            setStatus('idle');
        }
    };

    /* ────── COMING (Approved) ────── */
    if (status === 'coming') {
        const ts = formatTimestamp(new Date());

        /* ── Delivery: "Leave Order at Door" ── */
        if (deliveryMode) {
            return (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8 animate-fade-in">
                    {/* KNOC Logo */}
                    <img
                        src="/Group 1171275857.png"
                        alt="KNOC"
                        className="h-9 object-contain mb-14"
                    />

                    {/* Animated purple circle */}
                    <div className="relative flex items-center justify-center mb-10">
                        <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-[#431BB8] shadow-lg">
                            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Text */}
                    <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2 text-center leading-tight">
                        Leave Order<br />at Door
                    </h1>
                    <p className="text-[15px] text-[#8E8E93] text-center mb-1">Place parcel near entrance</p>
                    <p className="text-[14px] text-[#AEAEB2] text-center font-medium">{ts}</p>
                </div>
            );
        }

        /* ── Visitor: "Entry Approved" ── */
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8 animate-fade-in">
                {/* Animated green circle */}
                <div className="relative flex items-center justify-center mb-10">

                    <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-[#3A8C55] shadow-lg">
                        <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2 text-center">Entry Approved</h1>
                <p className="text-[15px] text-[#8E8E93] text-center mb-1">You may proceed...</p>
                <p className="text-[14px] text-[#AEAEB2] text-center font-medium">{ts}</p>

                {/* Go back */}
                <button
                    onClick={() => { setStatus('idle'); setLogId(null); setSelectedAction(null); }}
                    className="mt-12 text-sm text-[#AEAEB2] underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    /* ────── IGNORED (Denied) ────── */
    if (status === 'ignored') {
        const ts = formatTimestamp(new Date());
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8 animate-fade-in">
                {/* Animated red circle */}
                <div className="relative flex items-center justify-center mb-10">
                  
                    <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-[#E53935] shadow-lg">
                        <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2 text-center">Entry Not Approved</h1>
                <p className="text-[15px] text-[#8E8E93] text-center mb-1">You may not proceed...</p>
                <p className="text-[14px] text-[#AEAEB2] text-center font-medium">{ts}</p>
            </div>
        );
    }


    /* ────── ALARM ONLY (selection screen) ────── */
    if (alarmOnly) {
        const isWaiting = status === 'waiting';
        return (
            <div className="relative">
                <button
                    onClick={() => handleAction('Alarm')}
                    disabled={alarmDisabled}
                    className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${alarmDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                        }`}
                >
                    {isWaiting ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Sending...
                        </>
                    ) : cooldown > 0
                        ? `Alarm (wait ${cooldown}s)`
                        : alarmCount >= MAX_ALARMS
                            ? 'Alarm limit reached'
                            : 'Alarm & Live Footage'}
                </button>
                {alarmCount > 0 && alarmCount < MAX_ALARMS && (
                    <span className="absolute -top-2 -right-2 bg-[#926FF3] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        {alarmsRemaining} left
                    </span>
                )}
            </div>
        );
    }

    /* ────── DELIVERY MODE — "Notify Homeowner" ────── */
    if (deliveryMode) {
        const isWaiting = status === 'waiting';
        const disabled = !deliveryApp || isWaiting;
        return (
            <button
                onClick={() => handleAction('Notify Homeowner')}
                disabled={disabled}
                className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] transition-all shadow-lg flex items-center justify-center gap-2 ${disabled
                    ? 'bg-[#431BB8]/40 text-white/70 cursor-not-allowed'
                    : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                    }`}
            >
                {isWaiting ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                    </>
                ) : !deliveryApp ? 'Select a delivery app first' : 'Notify Homeowner'}
            </button>
        );
    }

    /* ────── VISITOR MODE — "Request Entry" ────── */
    if (visitorMode) {
        const isWaiting = status === 'waiting';
        const disabled = !visitorName.trim() || !visitorPurpose.trim() || isWaiting;
        return (
            <button
                onClick={() => handleAction('Request Entry')}
                disabled={disabled}
                className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] transition-all shadow-lg flex items-center justify-center gap-2 ${disabled
                    ? 'bg-[#431BB8]/40 text-white/70 cursor-not-allowed'
                    : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                    }`}
            >
                {isWaiting ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                    </>
                ) : 'Request Entry'}
            </button>
        );
    }

    /* ────── FALLBACK IDLE ────── */
    const isWaiting = status === 'waiting';
    return (
        <div className="flex flex-col gap-3 pb-4">
            <button
                onClick={() => handleAction('Request Entry')}
                disabled={isWaiting}
                className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] shadow-lg transition-all flex items-center justify-center gap-2 ${isWaiting
                        ? 'bg-[#431BB8]/60 text-white/80 cursor-not-allowed'
                        : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                    }`}
            >
                {isWaiting ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                    </>
                ) : 'Request Entry →'}
            </button>
        </div>
    );
}
