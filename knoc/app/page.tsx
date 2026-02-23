import React from 'react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-white font-sans text-black">
      {/* Mobile-like Wrapper for Desktop previews / The main content container */}
      <div className="flex flex-col flex-1 w-full max-w-md mx-auto p-6 pt-12 h-screen max-h-screen overflow-hidden">

        {/* Main Image Container */}
        {/* It has a thick purple border, heavy border-radius, and contains a photo of the delivery individual. */}
        <div className="w-full bg-[#f4f3ff] rounded-[2rem] overflow-hidden border-[3px] border-[#431BB8] relative flex-shrink-[1] min-h-0 mb-8" style={{ flexBasis: '65%' }}>
          <img
            /* Using a high-quality free Unsplash placeholder similar to the mockup delivery person */
            src="/main.png"
            alt="Delivery Person"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Space pushed the buttons to the bottom */}
        <div className="flex-1" />

        {/* Action Buttons Section */}
        <div className="flex flex-col gap-[14px] pb-6">
          <button className="w-full h-[56px] bg-[#431BB8] text-white rounded-[12px] font-semibold text-[16px] hover:bg-[#32138A] active:scale-[0.98] transition-all shadow-sm">
            Alarm & Live Footage
          </button>

          <button className="w-full h-[56px] bg-white border border-[#926FF3] text-[#1A1A1A] rounded-[12px] font-semibold text-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all">
            No Entry
          </button>

          <button className="w-full h-[56px] bg-white border border-[#926FF3] text-[#1A1A1A] rounded-[12px] font-semibold text-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all">
            Entry
          </button>
        </div>

      </div>
    </div>
  );
}
