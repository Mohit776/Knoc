"use client";
import React, { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


// ─── SVG ASSETS ────────────────────────────────────────────────────────────

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const AppStoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);






const VisitorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);



const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DeliveryReqIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" />
  </svg>
);

const CommunityIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);


// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function TrueKnocLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-center lg:text-left">
            {/* Left */}
            <div className="pr-0 lg:pr-12 lg:translate-y-[-50px]">
              <div className="inline-flex items-center gap-1.5 bg-[#f3edff] rounded-full px-1.5 py-1 mb-6">
                <Image src="/new/Lable.svg" alt="India's #1" width={149} height={23} className="w-full h-auto" />
              </div>
              <h1 className="text-4xl sm:text-4xl lg:text-4xl font-extrabold text-[#1f1e24] leading-tight mb-2 mx-auto lg:mx-0 max-w-lg" style={{ letterSpacing: "-0.03em" }}>
                Smart Entry. Safer Homes.
              </h1>
              <p className="text-gray-600 text-[15px] sm:text-base mb-5 leading-relaxed max-w-sm mx-auto lg:mx-0">
                Tech solutions to bring home convenience &amp; security, and keep you connected to the community.
              </p>
              <button className="inline-flex items-center gap-2.5 bg-[#4221b5] hover:bg-[#341890] text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-md mx-auto lg:mx-0">
                Try Trueknoc for home
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

            {/* Right — hero visuals */}
            <div className="relative flex justify-center lg:items-center w-full mt-10 lg:mt-0">
              {/* Cards container */}
              <div className="flex justify-center w-full mt-4 sm:mt-6 lg:mt-8">
                {/* On mobile: Flex column. On lg: absolute layout to match overlap */}
                <div className="flex flex-col items-center gap-8 w-full lg:block lg:relative lg:w-[620px] lg:h-[520px]">
                  
                  {/* India's #1 badge */}
                  <div className="absolute -top-12 lg:-top-15  right-25 lg:-right-20 z-30 w-[175px] lg:w-[170px]">
                    <Image src="/new/Group 1171275858.svg" alt="India's #1" width={191} height={49} className="w-full h-auto" />
                  </div>

                  {/* Woman with phone (Card 1) */}
                  <div className="w-full max-w-[380px] lg:max-w-none lg:absolute lg:top-24 lg:-left-2 lg:translate-x-[-120px] lg:w-[360px] xl:w-[400px] z-20 transition-all">
                    <Image src="/new/Background+Shadow1.svg" alt="Visitors" width={417} height={486} className="w-full h-auto object-contain" />
                  </div>

                  {/* Delivery man card (Card 2) */}
                  <div className="w-full max-w-[380px] lg:max-w-none lg:absolute lg:top-2 lg:right-0 lg:w-[360px] lg:translate-x-[100px] xl:w-[400px] z-10 transition-all">
                    <Image src="/new/Background+Shadow.svg" alt="Delivery" width={417} height={486} className="w-full h-auto object-contain " />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM APP ──────────────────────────────────────────── */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Explore FREE helpful Our ecosystem app</h2>
            <p className="text-gray-500 text-sm">We're the platform that pulls every moving part of your community into one place.</p>
            <button className="mt-5 inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#431BB8] transition-colors">
            
              Get the app
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left features */}
            <div className="relative w-full overflow-hidden rounded-2xl">
              <div className="flex flex-col items-center mb-7">
                <h3 className="text-[18px] font-bold text-[#1f1e24] text-center leading-[1.25]">
                  Real-time insights<br />access
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-[340px] mx-auto lg:max-w-none">
                {/* Visitor Verification (Active) */}
                <div className="bg-[#faf7ff] border border-[#d6c7ff] rounded-[20px] p-5 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="mb-3 text-[#2a2a2a]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">Visitor<br/>Verification</span>
                </div>

                {/* Delivery Management */}
                <div className="bg-[#f2f2f4] rounded-[20px] p-5 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 text-[#2a2a2a]">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <rect x="9" y="13" width="6" height="4" rx="1"/>
                      <path d="M9 15h6"/>
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">Delivery<br/>Management</span>
                </div>

                {/* Instant Notifications */}
                <div className="bg-[#f2f2f4] rounded-[20px] p-5 flex flex-col items-center justify-center text-center">
                  <div className="mb-3 text-[#2a2a2a] relative">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <div className="absolute top-0 right-0 w-[9px] h-[9px] bg-[#2a2a2a] rounded-full ring-2 ring-[#f2f2f4]"></div>
                  </div>
                  <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">Instant<br/>Notifications</span>
                </div>
              </div>

              {/* Purple glow bottom right */}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#caabff] opacity-100 blur-[50px] rounded-full pointer-events-none z-0"></div>
            </div>

            {/* Center phone mockup */}
            <div className="flex justify-center my-8 lg:my-0">
             <Image src="/new/umesh.svg" alt="India's #1" width={415} height={681} className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[415px] h-auto" />
            </div>

            {/* Right features */}
            <div className="space-y-6">
              <div className="relative w-full pb-4 overflow-hidden rounded-2xl">
                <div className="flex flex-col items-center mb-7 pt-4">
                  <h3 className="text-[18px] font-bold text-[#1f1e24] text-center leading-[1.25]">
                    Control Your Door<br />From Your Phone
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-[340px] mx-auto lg:max-w-none">
                  {/* Entry Logs */}
                  <div className="bg-[#f2f2f4] rounded-[20px] p-5 flex flex-col items-center justify-center text-center">
                    <div className="mb-3 text-[#2a2a2a]">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="M9 16l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">Entry Logs</span>
                  </div>

                  {/* Smart Entry */}
                  <div className="bg-[#f2f2f4] rounded-[20px] p-5 flex flex-col items-center justify-center text-center">
                    <div className="mb-3 text-[#2a2a2a]">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="4" width="6" height="6" rx="1" />
                        <rect x="14" y="4" width="6" height="6" rx="1" />
                        <rect x="14" y="14" width="6" height="6" rx="1" />
                        <rect x="4" y="14" width="6" height="6" rx="1" />
                        <path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">Smart Entry</span>
                  </div>

                  {/* Empty space */}
                  <div className="hidden pointer-events-none"></div>

                  {/* No Hardware Required */}
                  <div className="bg-[#f2f2f4] rounded-[20px] p-5 flex flex-col items-center justify-center text-center col-start-2">
                    <div className="mb-3 text-[#2a2a2a]">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.41 6.75L13 2l-2.43 2.92" />
                        <path d="M18.57 12.91L21 10h-5.34" />
                        <path d="M8 8l-5 6h9l-1 8 5-6" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-[#1f1e24] leading-snug">No Hardware<br/>Required</span>
                  </div>
                </div>

                {/* Purple glow bottom left */}
                <div className="absolute -bottom-24 -left-12 w-56 h-56 bg-[#caabff] opacity-100 blur-[50px] rounded-full pointer-events-none z-0"></div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ────────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">THE PROBLEM<br/> (Why Trueknoc Exists)</h2>
          <p className="text-gray-400 text-sm">Make traditional systems feel outdated.</p>
        </div>
      </section>

      {/* ── SMART ENTRY BAND ───────────────────────────────────────── */}
      <section className="bg-gray-50 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Trueknoc on your home –<br />
                <span className="">Smarter entry, every time</span>
              </h2>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                Delivery partners and visitors scan your Trueknoc QR code and send a entry request.
              </p>
               {/* <Image src="/new/Link.svg" alt="India's #1" width={288} height={58} /> */}
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#4d2ad0] ml-12 lg:ml-0 to-[#3b1bb7] px-3 py-2 text-white  cursor-pointer "
              >
               <Image src="/new/Logo splash.svg" alt="India's #1" width={30} height={30} />
                <span className="text-base font-semibold leading-none">Try Trueknoc for home</span>
              </button>
             
            </div>

            {/* Right – QR card */}
            <div className="flex justify-center lg:justify-end">
             <Image src="/new/image%2048.svg" alt="India's #1" width={618} height={288} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-2">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-widest mb-2">TRUSTED HOME OWNERS</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trust our customers with Trueknoc.</h2>
            <p className="text-gray-500 text-sm max-w-lg">
              Trueknoc is proud to be a leader in caller ID and spam blocking software as well as research around call and SMS harassment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div  className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm font-semibold text-gray-900 mb-2">Promises made. Promises kept.</p>
                <div className="flex gap-0.5 mb-3">
              
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  "I recently switched to ADIO Insurance and I'm thoroughly impressed! The app is incredibly user-friendly, making it easy to purchase and manage policies. The claims process is also seamless and hassle free."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Sahil Roy</p>
                    <p className="text-xs text-gray-400">Trueknoc customer</p>
                  </div>
                </div>
              </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm font-semibold text-gray-900 mb-2">Promises made. Promises kept.</p>
                <div className="flex gap-0.5 mb-3">
               
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                 TrueKnoc has completely changed how we handle visitors at home. Earlier, we had to guess who was at the door, especially when my parents were alone. Now we can verify before opening, which gives us real peace of mind. Simple setup and very useful product
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Ananya Sharma</p>
                    <p className="text-xs text-gray-400">Trueknoc customer</p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* ── STATS / PURPLE BAND ────────────────────────────────────── */}
      <section className="bg-[#431BB8] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Our trueknoc safe home entry in 2025</h2>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-10">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-medium">Loved by our users</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {[
              { icon: <Image src="/new/Group%201171275874.svg" alt="Entry Icon" width={28} height={28} />, val: "1.5 million+", label: "Entry", sub: "Secure visitor entries processed through Trueknoc" },
              { icon: <HomeIcon />, val: "150K+", label: "Active Homes", sub: "Homes using for smart doorstep access." },
              { icon: <Image src="/new/Group%201171275874.svg" alt="Delivery Icon" width={28} height={28} />, val: "450K+", label: "Delivery Requests", sub: "Deliveries managed through QR-based smart entry" },
              { icon: <Image src="/new/Group%201171275873.svg" alt="Visitor Icon" width={28} height={28} />, val: "900K+", label: "Visitor Requests", sub: "Visitors verified before entering homes." },
              { icon: <Image src="/new/Group%201171275873.svg" alt="Visitor Icon" width={28} height={28} />, val: "1,200+", label: "Communities", sub: "Apartments and societies adopting Trueknoc." },
              { icon: <Image src="/new/icon.svg" alt="Notifications Icon" width={28} height={28} />, val: "Real-Time", label: "Notifications", sub: "99% Notification Reliability" },
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-sm rounded-2xl p-5 ">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <p className="text-white font-extrabold text-2xl">{stat.val}</p>
                <p className="text-white font-semibold text-sm">{stat.label}</p>
                <p className="text-white text-xs mt-1 leading-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <button className="mt-10 bg-white text-[#431BB8] font-bold text-sm px-7 py-3 rounded-xl hover:bg-purple-50 transition-colors shadow-lg">
            Download Trueknoc
          </button>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ───────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#431BB8] mb-2">
                Get India's #1<br />
                <span className="text-[#431BB8]">smart entry app</span>
              </h2>
              <p className="text-gray-400 text-sm mt-2">5+ million app downloads</p>
            </div>

            {/* Right */}
           
             <Image src="/new/Background+Shadow2.svg" alt="Download QR" width={800} height={400} />
            </div>
        
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}