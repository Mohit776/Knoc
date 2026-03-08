'use client';

import { useState } from 'react';
import ActionButtons from './ActionButtons';

interface Props {
    qrId: string;
    location: string | null;
    isLinked: boolean;
}

type Screen = 'select' | 'delivery' | 'visitor';

const DELIVERY_APPS = [
    'Zomato',
    'Swiggy',
    'Blinkit',
    'Zepto',
    'Instamart',
    'Snabbit',
    'Amazon',
    'Flipkart',
    'Meesho',
];

/* ─────────── Shared Logo ─────────── */
function KnocLogo() {
    return (
        <div className="flex justify-center mb-5">
            <img
                src="/knoclogocolor.png"
                alt="KNOC"
                className="h-9 object-contain"
            />
        </div>
    );
}

/* ─────────── Main Component ─────────── */
export default function VisitorSelector({ qrId, location, isLinked }: Props) {
    const [screen, setScreen] = useState<Screen>('select');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [purpose, setPurpose] = useState('');

    const locationLabel = location || 'Main Entrance';

    /* ══════════════════════════════════════════
       NOT LINKED — show friendly message
    ══════════════════════════════════════════ */
    if (!isLinked) {
        return (
            <div
                className="flex flex-col min-h-screen bg-white items-center justify-center px-8"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                <div className="flex flex-col items-center w-full max-w-xs text-center">
                    {/* Logo */}
                    <img
                        src="/knoclogocolor.png"
                        alt="KNOC"
                        className="h-9 object-contain mb-12"
                    />

                    {/* Icon */}
                    <div
                        className="flex items-center justify-center mb-8 rounded-full"
                        style={{
                            width: 96,
                            height: 96,
                            background: 'linear-gradient(135deg, #f0effe 0%, #e4ddff 100%)',
                        }}
                    >
                        <svg
                            width="44"
                            height="44"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#431BB8"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h4M21 14v.01" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1
                        style={{
                            color: '#1A1A1A',
                            fontWeight: 700,
                            fontSize: 24,
                            marginBottom: 10,
                            lineHeight: 1.3,
                        }}
                    >
                        QR Not Linked Yet
                    </h1>

                    {/* Body */}
                    <p
                        style={{
                            color: '#8E8E93',
                            fontSize: 14,
                            lineHeight: 1.6,
                            marginBottom: 6,
                        }}
                    >
                        This QR code hasn&apos;t been linked to any account yet.
                    </p>
                    <p
                        style={{
                            color: '#8E8E93',
                            fontSize: 14,
                            lineHeight: 1.6,
                            marginBottom: 32,
                        }}
                    >
                        The homeowner needs to download the{' '}
                        <strong style={{ color: '#431BB8' }}>KNOC</strong> app
                        and register this QR code before it can be used.
                    </p>

                    {/* QR ID badge */}
                    <div
                        style={{
                            backgroundColor: '#f5f5f7',
                            borderRadius: 12,
                            padding: '10px 20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span style={{ color: '#AEAEB2', fontSize: 12 }}>ID</span>
                        <span style={{ color: '#431BB8', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
                            {qrId}
                        </span>
                    </div>
                </div>
            </div>
        );
    }



    /* ══════════════════════════════════════════
       SCREEN 1 — Select type
    ══════════════════════════════════════════ */
    if (screen === 'select') {
        return (
            <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div className="flex flex-col w-full max-w-md mx-auto px-5 pt-10 pb-8 min-h-screen">

                    <KnocLogo />

                    <p className="text-center text-[#8E8E93] text-[13px] mb-7">
                        Please identify yourself to proceed
                    </p>

                    <div className="flex flex-col gap-6  mt-16">

                        {/* Delivery Boy Card */}
                        <div
                            className="relative w-full rounded-[28px] "
                            style={{ minHeight: 125, backgroundColor: '#f0effe', marginTop: 16 }}
                        >

                            {/* Text */}
                            <div className="absolute inset-0 flex flex-col justify-center pl-[155px] pr-5 z-10">
                                <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 17, lineHeight: 1.3, marginBottom: 14 }}>
                                    Are you delivery boy
                                </p>
                                <button
                                    onClick={() => setScreen('delivery')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#431BB8',
                                        color: '#fff',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        borderRadius: 999,
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(67,27,184,0.3)',
                                    }}
                                >
                                    Request Entry <span style={{ fontSize: 15 }}>→</span>
                                </button>
                            </div>

                            {/* Character image */}
                            <div className="absolute left-0 bottom-0 h-full" style={{ width: 148 }}>
                                <img
                                    src="/dilvery.png"
                                    alt="Delivery Boy"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        height: '125%',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        objectPosition: 'bottom',
                                        zIndex: 1,
                                    }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>

                        </div>

                        {/* Visitor Card */}
                        <div
                            className="relative w-full rounded-[28px]"
                            style={{ minHeight: 125, backgroundColor: '#f0effe', marginTop: 16 }}
                        >
                            {/* Character image (left) */}
                            <div className="absolute right-0 bottom-0 h-full" style={{ width: 148 }}>
                                <img
                                    src="/visitor2.png"
                                    alt="Visitor"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        height: '125%',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        objectPosition: 'bottom',
                                        zIndex: 1,

                                    }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>

                            {/* Text (right) */}
                            <div className="absolute inset-0 flex flex-col justify-center pr-[155px] pl-5 z-10">
                                <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 17, lineHeight: 1.3, marginBottom: 14 }}>
                                    Are you visitor
                                </p>
                                <button
                                    onClick={() => setScreen('visitor')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        alignSelf: 'flex-start',
                                        backgroundColor: '#431BB8',
                                        color: '#fff',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        borderRadius: 999,
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(67,27,184,0.3)',
                                    }}
                                >
                                    Request Entry <span style={{ fontSize: 15 }}>→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════════
       SCREEN 2 — Delivery: pick app
    ══════════════════════════════════════════ */
    if (screen === 'delivery') {
        return (
            <div className="flex flex-col min-h-screen bg-white mt-24" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div className="flex flex-col w-full max-w-md mx-auto px-5 pt-10 pb-8 min-h-screen">

                    <KnocLogo />

                    <h1 style={{ textAlign: 'center', color: '#1A1A1A', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                        Notify Homeowner
                    </h1>
                    <p style={{ textAlign: 'center', color: '#8E8E93', fontSize: 13, marginBottom: 28 }}>
                        Location: {locationLabel}
                    </p>

                    {/* 3×3 App grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 10,
                            marginBottom: 24,
                        }}
                    >
                        {DELIVERY_APPS.map((appName) => {
                            const isSelected = selectedApp === appName;
                            return (
                                <button
                                    key={appName}
                                    onClick={() => setSelectedApp(appName)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 52,
                                        borderRadius: 12,
                                        border: isSelected ? '2px solid #431BB8' : '1.5px solid #E8E8ED',
                                        backgroundColor: isSelected ? '#f0effe' : '#F5F5F7',
                                        color: isSelected ? '#431BB8' : '#1A1A1A',
                                        fontWeight: isSelected ? 600 : 500,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isSelected ? '0 0 0 3px rgba(67,27,184,0.12)' : 'none',
                                    }}
                                >
                                    {appName}
                                </button>
                            );
                        })}
                    </div>



                    {/* Notify Homeowner button */}
                    <ActionButtons
                        qrId={qrId}
                        visitorType="delivery"
                        deliveryApp={selectedApp}
                        deliveryMode
                    />

                    <button
                        onClick={() => { setScreen('select'); setSelectedApp(null); }}
                        style={{
                            marginTop: 16,
                            background: 'none',
                            border: 'none',
                            color: '#8E8E93',
                            fontSize: 13,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            textAlign: 'center',
                            width: '100%',
                        }}
                    >
                        ← Go back
                    </button>

                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════════
       SCREEN 3 — Visitor: name + mobile
    ══════════════════════════════════════════ */
    return (
        <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="flex flex-col w-full max-w-md mx-auto px-5 pt-10 pb-8 min-h-screen">

                <KnocLogo />

                <h1 style={{ textAlign: 'center', color: '#1A1A1A', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
                    Request Entry Visiting
                </h1>
                <p style={{ textAlign: 'center', color: '#8E8E93', fontSize: 13, marginBottom: 32 }}>
                    Location: {locationLabel}
                </p>

                {/* Input fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{
                            width: '100%',
                            height: 56,
                            padding: '0 18px',
                            borderRadius: 14,
                            border: '1.5px solid #E8E8ED',
                            backgroundColor: '#F5F5F7',
                            color: '#1A1A1A',
                            fontSize: 15,
                            fontWeight: 400,
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#431BB8';
                            e.target.style.boxShadow = '0 0 0 3px rgba(67,27,184,0.12)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#E8E8ED';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Message"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        style={{
                            width: '100%',
                            height: 56,
                            padding: '0 18px',
                            borderRadius: 14,
                            border: '1.5px solid #E8E8ED',
                            backgroundColor: '#F5F5F7',
                            color: '#1A1A1A',
                            fontSize: 15,
                            fontWeight: 400,
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#431BB8';
                            e.target.style.boxShadow = '0 0 0 3px rgba(67,27,184,0.12)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#E8E8ED';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ flex: 1 }} />

                {/* Request Entry button */}
                <ActionButtons
                    qrId={qrId}
                    visitorType="visitor"
                    visitorName={fullName}
                    visitorPurpose={purpose}
                    visitorMode
                />

                <button
                    onClick={() => { setScreen('select'); setFullName(''); setMobile(''); }}
                    style={{
                        marginTop: 16,
                        background: 'none',
                        border: 'none',
                        color: '#8E8E93',
                        fontSize: 13,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        textAlign: 'center',
                        width: '100%',
                    }}
                >
                    ← Go back
                </button>

            </div>
        </div>
    );
}
