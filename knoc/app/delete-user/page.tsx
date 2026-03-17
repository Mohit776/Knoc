'use client';

import React, { useState } from 'react';

export default function DeleteUserPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
        type: 'idle',
        message: '',
    });

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber) {
            setStatus({ type: 'error', message: 'Please enter a phone number.' });
            return;
        }

        // Add confirmed popup so they don't accidentally delete someone
        if (!window.confirm(`Are you sure you want to permanently delete ALL data for ${phoneNumber}? This cannot be undone.`)) {
            return;
        }

        setStatus({ type: 'loading', message: 'Deleting user data...' });

        try {
            const res = await fetch('/api/delete-user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            setStatus({ type: 'success', message: data.message || `Successfully deleted user: ${phoneNumber}` });
            setPhoneNumber(''); // Clear the input on success
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-gray-900">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete User Data</h1>
                    <p className="text-sm text-gray-500">
                        Enter a user's phone number to permanently erase their account, unlink their QR codes, and delete their notification logs.
                    </p>
                </div>

                <form onSubmit={handleDelete} className="space-y-6">
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
                                <span>Processing...</span>
                            </div>
                        ) : (
                            'Permanently Delete Data'
                        )}
                    </button>
                </form>

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
