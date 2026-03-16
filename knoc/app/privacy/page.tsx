import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-purple-100 flex flex-col">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
                <h1 className="text-3xl font-bold text-center mb-16 tracking-tight text-black">Privacy Policy</h1>

                <div className="space-y-10 text-[14.5px] leading-relaxed text-[#2c2c2c]">

                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-4">Welcome to Trueknoc</h2>
                        <p className="mb-4">
                            TrueKnoc is a smart doorbell solution that uses QR code technology to provide secure, electricity-free visitor management for homes, apartments, offices, and gated communities across India.
                        </p>
                        <p className="mb-6">
                            We understand that when you use our services, you trust us with your information. This Privacy Policy explains what data we collect, why we collect it, how we use it, and the choices you have to control your information.
                        </p>

                        <p className="mb-4">Our Commitment:</p>
                        <ul className="list-none space-y-1 mb-8">
                            <li>We protect your data with bank-level security</li>
                            <li>You control what information you share</li>
                            <li>We never sell your personal data</li>
                            <li>We comply with Indian data protection laws</li>
                        </ul>

                        <p className="mb-4">Company Details:</p>
                        <div className="mb-8">
                            Entity: Rewata Marketplace Private Limited<br />
                            Address: A1616, 16th Floor, Tower A, Spectrum Mall, Sector 75, Noida, Uttar Pradesh<br />
                            CIN: U74110KA2015PTC120151<br />
                            Contact: privacy@trueknoc.in
                        </div>

                        <p>
                            By using TrueKnoc's website (https://trueknoc.com) or mobile application (collectively, the "Platform"), you agree to this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[17px] font-bold text-black mb-6 uppercase">2. INFORMATION WE COLLECT</h2>
                        <p className="mb-6">
                            The information we collect depends on how you use TrueKnoc. We collect only what's necessary to provide you with excellent service.
                        </p>

                        <h3 className="font-bold text-black mb-3">2.1 Information You Provide Directly</h3>

                        <p className="mb-3">For Homeowners/Residents:</p>
                        <ul className="list-none space-y-0.5 mb-8">
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Mobile number (for notifications)</li>
                            <li>Property address/flat number</li>
                            <li>Profile photo (optional)</li>
                            <li>Payment information (when purchasing TrueKnoc system)</li>
                        </ul>

                        <p className="mb-3">For Visitors (Scanned via QR Code):</p>
                        <ul className="list-none space-y-0.5 mb-8">
                            <li>Name (optional, entered by visitor)</li>
                            <li>Phone number (optional)</li>
                            <li>Timestamp of scan</li>
                            <li>Photo (if visitor grants camera permission)</li>
                            <li>Purpose of visit (optional)</li>
                        </ul>

                        <p className="mb-3">For Society/Building Administrators:</p>
                        <ul className="list-none space-y-0.5 mb-10">
                            <li>Organization name</li>
                            <li>Authorized administrator name</li>
                            <li>Contact details</li>
                            <li>Building/society address</li>
                            <li>Number of units</li>
                        </ul>

                        <h3 className="font-bold text-black mb-3">2.2 Information Collected Automatically</h3>
                        <p className="mb-2">When you use our Platform, we automatically collect:</p>
                        <p className="mb-3 mt-4">Device information:</p>
                        <ul className="list-none space-y-0.5 mb-8">
                            <li>Device type (smartphone model)</li>
                            <li>Operating system (iOS/Android version)</li>
                            <li>Unique device identifiers (Device ID, IDFA for iOS, Advertising ID for Android)</li>
                            <li>Mobile network information</li>
                            <li>IP address</li>
                        </ul>

                        <p className="mb-4">Company Details:</p>
                        <div className="mb-8">
                            Entity: Rewata Marketplace Private Limited<br />
                            Address: A1616, 16th Floor, Tower A, Spectrum Mall, Sector 75, Noida, Uttar Pradesh<br />
                            CIN: U74110KA2015PTC120151<br />
                            Contact: privacy@trueknoc.in
                        </div>

                        <p>
                            By using TrueKnoc's website (https://trueknoc.com) or mobile application (collectively, the "Platform"), you agree to this Privacy Policy.
                        </p>
                    </section>

                </div>
            </main>
            <Footer />
        </div>
    );
}
