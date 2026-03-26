'use client';

import React, { useState, useEffect, useRef } from 'react';

type Step = 'phone' | 'otp';
type StatusType = 'idle' | 'loading' | 'success' | 'error';

export default function DeleteUserPage() {
    const [step, setStep] = useState<Step>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [deleteToken, setDeleteToken] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [status, setStatus] = useState<{ type: StatusType; message: string }>({
        type: 'idle',
        message: '',
    });

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => {
            if (cooldownRef.current) clearTimeout(cooldownRef.current);
        };
    }, [cooldown]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!phoneNumber) {
            setStatus({ type: 'error', message: 'Please enter a phone number.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Sending OTP to your device...' });

        try {
            const res = await fetch('/api/delete-user/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setStep('otp');
            setOtp(['', '', '', '', '', '']);
            setCooldown(60);
            setStatus({ type: 'success', message: 'OTP sent! Check your device for the notification.' });

            // Focus on first OTP input
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Failed to send OTP.' });
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only keep last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            otpRefs.current[5]?.focus();
        }
    };

    const handleVerifyAndDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setStatus({ type: 'error', message: 'Please enter the full 6-digit OTP.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Verifying OTP...' });

        try {
            // Step 1: Verify OTP
            const verifyRes = await fetch('/api/delete-user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, otp: otpString }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'OTP verification failed');
            }

            const token = verifyData.delete_token;
            setDeleteToken(token);

            // Step 2: Confirm deletion
            if (!window.confirm(`OTP verified! Are you sure you want to permanently delete ALL data for ${phoneNumber}? This cannot be undone.`)) {
                setStatus({ type: 'idle', message: '' });
                return;
            }

            setStatus({ type: 'loading', message: 'Deleting user data...' });

            // Step 3: Delete with token
            const deleteRes = await fetch('/api/delete-user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, delete_token: token }),
            });

            const deleteData = await deleteRes.json();

            if (!deleteRes.ok) {
                throw new Error(deleteData.error || 'Failed to delete user');
            }

            setStatus({ type: 'success', message: deleteData.message || `Successfully deleted user: ${phoneNumber}` });
            setPhoneNumber('');
            setOtp(['', '', '', '', '', '']);
            setDeleteToken('');
            setStep('phone');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
        }
    };

    const handleBack = () => {
        setStep('phone');
        setOtp(['', '', '', '', '', '']);
        setStatus({ type: 'idle', message: '' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete User Data</h1>
                    <p className="text-sm text-gray-500">
                        {step === 'phone'
                            ? 'Enter a user\'s phone number to permanently erase their account, unlink their QR codes, and delete their notification logs.'
                            : 'Enter the 6-digit OTP sent to the user\'s device to confirm deletion.'}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center mb-6 gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                        step === 'phone' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
                    }`}>
                        {step === 'otp' ? '✓' : '1'}
                    </div>
                    <div className={`w-12 h-0.5 transition-colors ${step === 'otp' ? 'bg-red-600' : 'bg-gray-300'}`} />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                        step === 'otp' ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                        2
                    </div>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+919876543210"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 text-left">Include the country code (e.g., +91)</p>
                        </div>

                        <button
                            type="submit"
                            disabled={status.type === 'loading'}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
                                status.type === 'loading'
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 active:transform active:scale-95 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {status.type === 'loading' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Sending OTP...</span>
                                </div>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndDelete} className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Sending OTP to:</p>
                            <p className="text-base font-semibold text-gray-900 mb-4">{phoneNumber}</p>

                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Enter OTP
                            </label>
                            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { otpRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500 text-center">Check the Knoc app on the user&apos;s device for the OTP</p>
                        </div>

                        <button
                            type="submit"
                            disabled={status.type === 'loading' || otp.join('').length !== 6}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
                                status.type === 'loading' || otp.join('').length !== 6
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 active:transform active:scale-95 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {status.type === 'loading' ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                'Verify & Delete Data'
                            )}
                        </button>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-sm text-gray-500 hover:text-gray-700 transition"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                disabled={cooldown > 0 || status.type === 'loading'}
                                className={`text-sm font-medium transition ${
                                    cooldown > 0 || status.type === 'loading'
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-red-600 hover:text-red-700'
                                }`}
                            >
                                {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {status.type !== 'idle' && status.type !== 'loading' && (
                    <div
                        className={`mt-6 p-4 rounded-lg text-sm ${
                            status.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
