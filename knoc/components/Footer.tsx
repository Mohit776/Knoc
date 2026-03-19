import React from "react";
import Image from "next/image";
import Link from "next/link";

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#431BB8] text-white pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <Link href="/">
                <img src="/new/logo_gull.svg" alt="Trueknoc Logo" width={100} height={30} className="filter brightness-0 invert" />
              </Link>
            </div>
            <p className="text-white text-xs leading-relaxed mb-4">
              Smart doorbell for modern India.<br />
              All rights reserved.
            </p>
            <div className="flex gap-3">
              {[FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, LinkedInIcon].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-white hover:bg-purple-700 flex items-center justify-center text-[#431BB8] transition-all">
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-sm mb-4">Product</h3>
            <ul className="space-y-2">
              {["How it Works", "Features", "Pricing", "For Societies"].map((item) => (
                <li key={item}><Link href="#" className="text-white text-xs hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {["About Us", "Blog", "Press kit", "Contact Us"].map((item) => (
                <li key={item}><Link href="#" className="text-white text-xs hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {[
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms and conditions", href: "/term" },
                { name: "Cookie Policy", href: "#" },
                { name: "Refund Policy", href: "#" },
                { name: "Shipping Policy", href: "#" },
              ].map((item) => (
                <li key={item.name}><Link href={item.href} className="text-white text-xs hover:text-white transition-colors">{item.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-b border-white/10 pt-5 pb-5">
          <p className="text-white text-[11px] text-center mb-1">
            © 2026 Trueknoc · Rewato Marketplace Private Limited. All rights reserved.
          </p>
          <p className="text-white text-[10px] text-center mb-2 opacity-60">
            CIN: U62099DL2025PTC459490
          </p>
          <p className="text-white text-[10px] text-center opacity-60">
            A1816, 18th Floor, Tower A, Spectrum Mall, Sector 75 Noida, Uttar Pradesh 201301, India
          </p>
        </div>

        <div className="flex flex-row items-center justify-center mt-4 gap-3 text-[10px] text-white/50 border-t border-white/5 pt-4">
          <span>Developed by <span className="text-white font-medium">Mohit Aggarwal</span></span>
          <span className="opacity-50">|</span>
          <a href="mailto:mohitaggarwal551@gmail.com" className="hover:text-white transition-colors">mohitaggarwal551@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}
