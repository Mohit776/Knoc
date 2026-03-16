"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/">
            <img src="/new/logo_gull.svg" alt="Logo" className="cursor-pointer" />
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Products", "Why KNOC?", "Support"].map((item) => (
              <button key={item} className="text-sm text-gray-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors">
                {item}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            ))}
          </div>
          <div className="hidden md:block">
            <button className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              Shop Now
            </button>
          </div>
          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {["Products", "Why KNOC?", "Support"].map((item) => (
            <button key={item} className="block w-full text-left py-2 text-sm text-gray-700 hover:text-purple-700 font-medium">{item}</button>
          ))}
          <button className="mt-2 w-full bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">Shop Now</button>
        </div>
      )}
    </nav>
  );
}
