"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 mt-4 px-3 sm:px-4 lg:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-5 lg:gap-10">
            <Link href="/">
              <img src="/new/logo_gull.svg" alt="Logo" className="h-6 w-auto cursor-pointer" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-5 lg:gap-8">
              {["Products", "Why KNOC?", "Support"].map((item) => (
                <button key={item} className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-purple-700">
                  {item}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <button className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700">
              Shop Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-gray-600 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
            {["Products", "Why KNOC?", "Support"].map((item) => (
              <button key={item} className="block w-full py-2 text-left text-sm font-medium text-gray-700 hover:text-purple-700">
                {item}
              </button>
            ))}
            <button className="mt-2 w-full rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white">Shop Now</button>
          </div>
        )}
      </div>
    </nav>
  );
}
