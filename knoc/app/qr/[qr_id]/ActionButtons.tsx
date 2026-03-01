'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

    /* ────── COMING ────── */
    if (status === 'coming') {
        return (
            <div className="flex flex-col items-center gap-4 pb-4 animate-fade-in">
                <div className="w-full rounded-2xl bg-[#E6F9EE] border-2 border-[#34C759] px-6 py-7 flex flex-col items-center gap-3 shadow-md">
                    <div className="text-5xl">✅</div>
                    <p className="text-[#1A7A3A] font-bold text-xl text-center">Owner is Coming!</p>
                    <p className="text-[#2D9F54] text-sm text-center font-medium">
                        Please wait at the door. They will be there shortly.
                    </p>
                </div>
                <button
                    onClick={() => { setStatus('idle'); setLogId(null); setSelectedAction(null); }}
                    className="text-sm text-[#8E8E93] underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    /* ────── IGNORED ────── */
    if (status === 'ignored') {
        return (
            <div className="flex flex-col items-center gap-4 pb-4 animate-fade-in">
                <div className="w-full rounded-2xl bg-[#FFF0F0] border-2 border-[#E53935] px-6 py-7 flex flex-col items-center gap-3 shadow-md">
                    <div className="text-5xl">🚫</div>
                    <p className="text-[#C62828] font-bold text-lg text-center">Owner is not available</p>
                    <p className="text-[#E57373] text-sm text-center">
                        The owner has declined your request. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    /* ────── WAITING ────── */
    if (status === 'waiting') {
        return (
            <div className="w-full rounded-2xl bg-[#f4f3ff] border border-[#431BB8]/30 px-6 py-7 flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-14 w-14 rounded-full bg-[#431BB8] opacity-20 animate-ping" />
                    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#431BB8]">
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </span>
                </div>
                <p className="text-[#431BB8] font-semibold text-base text-center">Notified the owner!</p>
                <p className="text-[#8E8E93] text-sm text-center">
                    Waiting for their response<span className="animate-pulse">...</span>
                </p>
                <p className="text-xs text-[#C7C7CC] text-center">
                    Action: <span className="font-medium text-[#926FF3]">{selectedAction}</span>
                </p>
            </div>
        );
    }

    /* ────── ALARM ONLY (selection screen) ────── */
    if (alarmOnly) {
        return (
            <div className="relative">
                <button
                    onClick={() => handleAction('Alarm')}
                    disabled={alarmDisabled}
                    className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] tracking-wide transition-all shadow-lg ${alarmDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                        }`}
                >
                    {cooldown > 0
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
        const disabled = !deliveryApp;
        return (
            <button
                onClick={() => handleAction('Notify Homeowner')}
                disabled={disabled}
                className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] transition-all shadow-lg ${disabled
                        ? 'bg-[#431BB8]/40 text-white/70 cursor-not-allowed'
                        : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                    }`}
            >
                {disabled ? 'Select a delivery app first' : 'Notify Homeowner'}
            </button>
        );
    }

    /* ────── VISITOR MODE — "Request Entry" ────── */
    if (visitorMode) {
        const disabled = !visitorName.trim() || !visitorPurpose.trim();
        return (
            <button
                onClick={() => handleAction('Request Entry')}
                disabled={disabled}
                className={`w-full h-[56px] rounded-[14px] font-bold text-[16px] transition-all shadow-lg ${disabled
                        ? 'bg-[#431BB8]/40 text-white/70 cursor-not-allowed'
                        : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                    }`}
            >
                Request Entry
            </button>
        );
    }

    /* ────── FALLBACK IDLE ────── */
    return (
        <div className="flex flex-col gap-3 pb-4">
            <button
                onClick={() => handleAction('Request Entry')}
                className="w-full h-[56px] rounded-[14px] font-bold text-[16px] bg-[#431BB8] text-white shadow-lg hover:bg-[#32138A] active:scale-[0.98] transition-all"
            >
                Request Entry →
            </button>
        </div>
    );
}
