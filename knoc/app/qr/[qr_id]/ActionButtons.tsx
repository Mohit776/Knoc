'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const MAX_ALARMS = 3;
const COOLDOWN_MS = 30_000; // 30 seconds

type Status = 'idle' | 'waiting' | 'coming' | 'ignored';

export default function ActionButtons({ qrId }: { qrId: string }) {
    const [status, setStatus] = useState<Status>('idle');
    const [logId, setLogId] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    // Alarm limits
    const [alarmCount, setAlarmCount] = useState(0);
    const [cooldown, setCooldown] = useState(0); // seconds remaining
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const alarmDisabled = status === 'ignored' || alarmCount >= MAX_ALARMS || cooldown > 0 || status === 'waiting';
    const alarmsRemaining = MAX_ALARMS - alarmCount;

    // Cooldown countdown timer
    const startCooldown = useCallback(() => {
        setCooldown(COOLDOWN_MS / 1000);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // Poll for owner response every 3 seconds
    useEffect(() => {
        if (!logId || (status !== 'waiting')) return;

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/knoc-log/${logId}`);
                if (!res.ok) return;
                const log = await res.json();

                if (log.response === 'coming') {
                    setStatus('coming');
                    clearInterval(pollRef.current!);
                } else if (log.response === 'ignored') {
                    setStatus('ignored');
                    clearInterval(pollRef.current!);
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 3000);

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [logId, status]);

    const handleAction = async (action: string) => {
        if (status === 'waiting') return;

        // Alarm-specific limits
        if (action === 'Alarm') {
            if (alarmCount >= MAX_ALARMS) return;
            if (cooldown > 0) return;
        }

        setSelectedAction(action);
        setStatus('waiting');

        try {
            const res = await fetch(`/api/notify/${qrId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send notification');

            if (data.logId) {
                setLogId(data.logId);
            }

            // Track alarm usage and start cooldown
            if (action === 'Alarm') {
                setAlarmCount(prev => prev + 1);
                startCooldown();
            }
        } catch (error: any) {
            console.error(error);
            alert(`❌ Could not send notification: ${error.message}`);
            setStatus('idle');
        }
    };

    // ────────────────────────────────────────────
    // COMING — green banner
    // ────────────────────────────────────────────
    if (status === 'coming') {
        return (
            <div className="flex flex-col items-center justify-center gap-5 pb-6 animate-fade-in">
                <div className="w-full rounded-2xl bg-[#E6F9EE] border-2 border-[#34C759] px-6 py-7 flex flex-col items-center gap-3 shadow-md">
                    <div className="text-5xl">✅</div>
                    <p className="text-[#1A7A3A] font-bold text-xl text-center leading-tight">
                        Owner is Coming!
                    </p>
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

    // ────────────────────────────────────────────
    // IGNORED — red banner + everything disabled
    // ────────────────────────────────────────────
    if (status === 'ignored') {
        return (
            <div className="flex flex-col items-center justify-center gap-5 pb-6 animate-fade-in">
                <div className="w-full rounded-2xl bg-[#FFF0F0] border-2 border-[#E53935] px-6 py-7 flex flex-col items-center gap-3 shadow-md">
                    <div className="text-5xl">🚫</div>
                    <p className="text-[#C62828] font-bold text-lg text-center">
                        Owner is not available
                    </p>
                    <p className="text-[#E57373] text-sm text-center">
                        The owner has declined your request. Please try again later.
                    </p>
                </div>

                {/* Disabled buttons */}
                <div className="w-full flex flex-col gap-3 opacity-40 pointer-events-none">
                    <button className="w-full h-[52px] bg-gray-300 text-gray-500 rounded-[12px] font-semibold text-[15px] cursor-not-allowed">
                        Alarm (Disabled)
                    </button>
                    <button className="w-full h-[52px] bg-gray-100 border border-gray-300 text-gray-400 rounded-[12px] font-semibold text-[15px] cursor-not-allowed">
                        Entry (Disabled)
                    </button>
                    <button className="w-full h-[52px] bg-gray-100 border border-gray-300 text-gray-400 rounded-[12px] font-semibold text-[15px] cursor-not-allowed">
                        No Entry (Disabled)
                    </button>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────
    // WAITING — spinner + pulsing message
    // ────────────────────────────────────────────
    if (status === 'waiting') {
        return (
            <div className="flex flex-col items-center justify-center gap-5 pb-6">
                <div className="w-full rounded-2xl bg-[#f4f3ff] border border-[#431BB8] border-opacity-30 px-6 py-7 flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex h-14 w-14 rounded-full bg-[#431BB8] opacity-20 animate-ping" />
                        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#431BB8]">
                            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        </span>
                    </div>
                    <p className="text-[#431BB8] font-semibold text-base text-center">
                        Notified the owner!
                    </p>
                    <p className="text-[#8E8E93] text-sm text-center">
                        Waiting for their response<span className="animate-pulse">...</span>
                    </p>
                    <p className="text-xs text-[#C7C7CC] text-center">
                        Action sent: <span className="font-medium text-[#926FF3]">{selectedAction}</span>
                    </p>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────
    // IDLE — normal buttons with alarm limits
    // ────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-[14px] pb-6">
            {/* Alarm button with counter + cooldown */}
            <div className="relative">
                <button
                    onClick={() => handleAction('Alarm')}
                    disabled={alarmDisabled}
                    className={`w-full h-[56px] rounded-[12px] font-semibold text-[16px] transition-all shadow-sm ${alarmDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#431BB8] text-white hover:bg-[#32138A] active:scale-[0.98]'
                        }`}
                >
                    {cooldown > 0
                        ? `Alarm (wait ${cooldown}s)`
                        : alarmCount >= MAX_ALARMS
                            ? 'Alarm limit reached'
                            : 'Alarm'
                    }
                </button>

                {/* Alarm counter badge */}
                {alarmCount > 0 && alarmCount < MAX_ALARMS && (
                    <span className="absolute -top-2 -right-2 bg-[#926FF3] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        {alarmsRemaining} left
                    </span>
                )}
            </div>

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
