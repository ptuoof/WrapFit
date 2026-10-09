'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardProfilePage() {
  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      <header className="flex items-center justify-between pb-6 mb-8 border-b border-[#e8ded0]/60">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-[#f7f2ef] shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">Hồ Sơ Chuyên Gia &amp; Thiết Lập Cadence</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">SPLIT BENTO FOCUS &bull; PACKAGING CAD PROFILE</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">
          SOLO PRO VERIFIED
        </span>
      </header>

      {/* Split Bento Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] space-y-6">
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-[#122e20] text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-md">
              EV
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">Elena Vance</h3>
              <p className="text-xs text-[#717971] font-['JetBrains_Mono']">Lead CAD Packaging Architect</p>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ID: #WF-PRO-4208
            </span>
          </div>

          <div className="pt-4 border-t border-[#e8ded0]/60 space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-[#717971]">Email:</span><span className="font-semibold">elena.vance@wrapfit.io</span></div>
            <div className="flex justify-between"><span className="text-[#717971]">Xưởng Thân Thiết:</span><span className="font-semibold">Tân Giang OEM</span></div>
            <div className="flex justify-between"><span className="text-[#717971]">Gói Bản Quyền:</span><span className="font-semibold text-emerald-700">Artisan Pro (Active)</span></div>
          </div>
        </div>

        {/* Right Column: 4 Bento Cards with Corner Folds */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-xs space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-amber-800">THẺ 1</span>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-amber-950">Cấu Hình Đo Đạc &amp; Caliper</h4>
            <p className="text-xs text-amber-800/80">Đơn vị đo mặc định: mm • Chuẩn tự động: FEFCO 0215 • Thanh trượt bù gập Caliper creep: 1.50t</p>
          </div>

          <div className="p-6 rounded-3xl bg-lime-50 border border-lime-200/80 shadow-xs space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-lime-800">THẺ 2</span>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-lime-950">Không Gian Màu &amp; 3D Engine</h4>
            <p className="text-xs text-lime-800/80">Không gian màu CMYK Fogra39 / ISO Coated • 300 DPI • Khử răng cưa WebGL MSAA 4X Bật</p>
          </div>

          <div className="p-6 rounded-3xl bg-sky-50 border border-sky-200/80 shadow-xs space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-sky-800">THẺ 3</span>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-sky-950">Hóa Đơn VAT Doanh Nghiệp</h4>
            <p className="text-xs text-sky-800/80">Maison de Luxe Ltd • MST: 0317892341 • Tự động gửi email nhận HĐĐT sau khi xuất xưởng</p>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-xs space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-emerald-800">THẺ 4</span>
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-emerald-950">Cloud Key &amp; Tích Hợp AI</h4>
            <p className="text-xs text-emerald-800/80">Illustrator Plugin Sync Bật • Khóa FIDO2 Touch ID kích hoạt • CAD Engine Token: wf_live_***</p>
          </div>
        </div>
      </main>
    </div>
  );
}
