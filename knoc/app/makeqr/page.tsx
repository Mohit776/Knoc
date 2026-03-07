'use client';

import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

/* ─────────────────────────── types ─────────────────────────── */
interface QRResult {
    qr_id: string;
    qr_url: string;
    success: boolean;
    error?: string;
}

/* ─────────────────────────── component ─────────────────────── */
export default function MakeQRPage() {
    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<QRResult[]>([]);
    const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
    const [errorMsg, setErrorMsg] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── Generate QR codes via API ──────────────────────────────── */
    const handleGenerate = async () => {
        setLoading(true);
        setErrorMsg('');
        setResults([]);
        setQrDataUrls({});

        try {
            const res = await fetch('/api/generate-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `Server error ${res.status}`);
            }

            const data = await res.json();
            const items: QRResult[] = data.results;
            setResults(items);

            // Generate QR code data URLs client-side for preview
            const urls: Record<string, string> = {};
            for (const item of items) {
                try {
                    urls[item.qr_id] = await QRCode.toDataURL(item.qr_url, {
                        width: 300,
                        margin: 2,
                        errorCorrectionLevel: 'H',
                        color: { dark: '#000000', light: '#ffffff' },
                    });
                } catch {
                    // fallback — will just show "no preview"
                }
            }
            setQrDataUrls(urls);
        } catch (err: any) {
            setErrorMsg(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    /* ── Build multi-page PDF (mirrors Python build_pdf exactly) ── */
    const handleDownloadPDF = async () => {
        if (results.length === 0) return;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = 210;
        const pageH = 297;
        const qrSize = 100; // ~10cm

        for (let i = 0; i < results.length; i++) {
            if (i > 0) pdf.addPage();

            const item = results[i];

            // Generate hi-res PNG for PDF
            let qrImgData: string;
            try {
                qrImgData = await QRCode.toDataURL(item.qr_url, {
                    width: 800,
                    margin: 4,
                    errorCorrectionLevel: 'H',
                });
            } catch {
                continue;
            }

            // Centre QR slightly above middle
            const qrX = (pageW - qrSize) / 2;
            const qrY = (pageH - qrSize) / 2 - 10;
            pdf.addImage(qrImgData, 'PNG', qrX, qrY, qrSize, qrSize);

            // QR ID text (KNOC purple)
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(67, 27, 184); // #431BB8
            pdf.text(item.qr_id, pageW / 2, qrY + qrSize + 8, { align: 'center' });

            // Subtitle
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(143, 143, 148);
            pdf.text('Scan to KNOC', pageW / 2, qrY + qrSize + 14, { align: 'center' });

            // Page number
            pdf.setFontSize(8);
            pdf.setTextColor(191, 191, 191);
            pdf.text(`${i + 1} / ${results.length}`, pageW / 2, pageH - 10, { align: 'center' });
        }

        const label =
            results.length > 1
                ? `KNOC_${results.length}_QR_codes`
                : results[0].qr_id;
        pdf.save(`${label}.pdf`);
    };

    /* ── Derived state ──────────────────────────────────────────── */
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#0d0b14] text-white relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#431BB8] opacity-10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#6B45D5] opacity-10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-10" ref={containerRef}>
                {/* Header */}
                <header className="flex items-center gap-4 mb-10">
                    <img
                        src="/knoclogocolor.png"
                        alt="KNOC"
                        className="h-8 object-contain"
                    />
                    <div className="h-6 w-px bg-white/20" />
                    <h1 className="text-lg font-semibold tracking-tight text-white/90">
                        QR Code Generator
                    </h1>
                </header>

                {/* Input Card */}
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6 shadow-[0_0_40px_rgba(67,27,184,0.08)]">
                    <label
                        htmlFor="qr-count"
                        className="block text-sm font-medium text-white/60 mb-2"
                    >
                        Number of QR codes to generate
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            id="qr-count"
                            type="number"
                            min={1}
                            max={50}
                            value={count}
                            onChange={(e) =>
                                setCount(
                                    Math.max(1, Math.min(50, parseInt(e.target.value) || 1)),
                                )
                            }
                            className="w-28 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#431BB8]/50 focus:border-[#431BB8]/50 transition-all"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="flex-1 relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            style={{
                                background: loading
                                    ? '#2a2040'
                                    : 'linear-gradient(135deg, #431BB8 0%, #6B45D5 50%, #926FF3 100%)',
                            }}
                        >
                            {/* Hover shimmer */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className="opacity-25"
                                            />
                                            <path
                                                d="M4 12a8 8 0 018-8"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                className="opacity-75"
                                            />
                                        </svg>
                                        Generating…
                                    </span>
                                ) : (
                                    `Generate ${count} QR Code${count > 1 ? 's' : ''}`
                                )}
                            </span>
                        </button>
                    </div>
                    <p className="text-xs text-white/30 mt-3">
                        Each QR code will get its own page in the downloaded PDF. Max 50.
                    </p>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-3 mb-6 text-red-400 text-sm flex items-center gap-2">
                        <span className="text-lg">❌</span> {errorMsg}
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <>
                        {/* Status banner */}
                        {errorCount > 0 ? (
                            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-3 mb-6 text-amber-400 text-sm">
                                ⚠️ {errorCount} QR code(s) had Firestore issues.{' '}
                                {successCount > 0 &&
                                    `${successCount} registered successfully.`}
                            </div>
                        ) : (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 mb-6 text-emerald-400 text-sm flex items-center gap-2">
                                <span className="text-lg">✅</span>{' '}
                                {successCount} QR code{successCount > 1 ? 's' : ''} registered
                                in Firestore!
                            </div>
                        )}

                        {/* Preview heading */}
                        <h2 className="text-base font-semibold text-white/70 mb-4 tracking-wide">
                            Preview
                        </h2>

                        {/* QR grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                            {results.map((item) => (
                                <div
                                    key={item.qr_id}
                                    className="bg-white/[0.04] backdrop-blur rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-3 transition-all hover:border-[#431BB8]/30 hover:shadow-[0_0_24px_rgba(67,27,184,0.12)]"
                                >
                                    {qrDataUrls[item.qr_id] ? (
                                        <img
                                            src={qrDataUrls[item.qr_id]}
                                            alt={item.qr_id}
                                            className="w-full rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full aspect-square rounded-lg bg-white/5 flex items-center justify-center text-white/20 text-xs">
                                            No preview
                                        </div>
                                    )}
                                    <span
                                        className={`text-xs font-mono tracking-wider ${item.success ? 'text-[#926FF3]' : 'text-red-400'}`}
                                    >
                                        {item.qr_id}
                                    </span>
                                    {!item.success && (
                                        <span className="text-[10px] text-red-400/70">
                                            {item.error}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Download PDF */}
                        <button
                            onClick={handleDownloadPDF}
                            className="w-full rounded-xl px-6 py-4 font-semibold text-white transition-all group relative overflow-hidden"
                            style={{
                                background:
                                    'linear-gradient(135deg, #431BB8 0%, #6B45D5 50%, #926FF3 100%)',
                            }}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative flex items-center justify-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"
                                    />
                                </svg>
                                Download PDF ({results.length} page
                                {results.length > 1 ? 's' : ''})
                            </span>
                        </button>
                    </>
                )}

                {/* Footer */}
                <p className="text-center text-white/20 text-xs mt-12">
                    KNOC QR Generator &middot; Each code links to{' '}
                    <span className="text-white/30">knoc.vercel.app/qr/&#123;id&#125;</span>
                </p>
            </div>
        </div>
    );
}
