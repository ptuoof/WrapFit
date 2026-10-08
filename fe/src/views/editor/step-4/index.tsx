'use client';

import React from 'react';
import Link from 'next/link';
import { GoiMascot } from '@/components/common/GoiMascot';

export default function Step4FitCheckPage() {
  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/editor/step-3" className="w-10 h-10 rounded-full bg-white/80 border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-white shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-bold text-[#122e20]">Báo Cáo Kiểm Định FitCheck™ &amp; Xuất Bản In</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">PRODUCTION CERTIFICATE STUDIO • ISO 12647-2 COMPLIANCE</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#e8ded0] shadow-xs text-xs font-semibold">
          <Link href="/editor/step-1" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">1. Cấu Trúc</Link>
          <Link href="/editor/step-2" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">2. Kích Thước</Link>
          <Link href="/editor/step-3" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">3. Đồ Họa</Link>
          <span className="px-4 py-1.5 rounded-full bg-[#122e20] text-white">4. Xuất File</span>
        </div>
      </header>

      {/* Main FitCheck Certificate Card */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Certificate Seal & 3 Gauges */}
        <div className="lg:col-span-6 space-y-6 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#e8ded0]/60">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-['JetBrains_Mono'] text-xs font-bold">
                FITCHECK™ CERTIFIED 100/100 PASS
              </span>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20] mt-2">Chứng Chỉ Sẵn Sàng Sản Xuất</h3>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-200 text-[#122e20] flex items-center justify-center font-bold shadow-md">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
          </div>

          {/* 3 Visual Gauges */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#122e20]">Khớp Mộng &amp; Mép Dán Keo (Glue Tab)</p>
                <p className="text-xs text-[#717971]">Độ rộng tiêu chuẩn máy dán tự động</p>
              </div>
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-emerald-700">15.0 mm &bull; PASS</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#122e20]">Vùng An Toàn &amp; Tràn Lề (Safe / Bleed)</p>
                <p className="text-xs text-[#717971]">Không cắt lẹm vào nội dung và logo</p>
              </div>
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-emerald-700">3.2mm / 2.0mm &bull; PASS</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-[#122e20]">Độ Chịu Tải Đáy Khóa</p>
                <p className="text-xs text-[#717971]">Tải trọng an toàn vượt chuẩn +40%</p>
              </div>
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-emerald-700">2.8 kg &bull; PASS</span>
            </div>
          </div>
        </div>

        {/* Download Actions & Mascot Approval */}
        <div className="lg:col-span-6 space-y-6 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] flex flex-col justify-between">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <GoiMascot pose="celebration" size={64} />
            <div>
              <p className="text-sm font-bold text-emerald-900">Tuyệt vời! Bản vẽ đạt chuẩn sản xuất 100%.</p>
              <p className="text-xs text-emerald-700">Sẵn sàng xuất file chế bản CNC và chuyển giao sang xưởng in đối tác.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#122e20]">Tải Bản Vẽ Kỹ Thuật Trực Tiếp:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/editor/export" className="p-3.5 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0]/60 border border-[#e8ded0] text-center font-['JetBrains_Mono'] text-xs font-semibold text-[#122e20] transition-colors flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-base">download</span>
                <span>Tải File .DXF / CAD</span>
              </Link>
              <Link href="/editor/export" className="p-3.5 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0]/60 border border-[#e8ded0] text-center font-['JetBrains_Mono'] text-xs font-semibold text-[#122e20] transition-colors flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                <span>Tải PDF Chế Bản Offset</span>
              </Link>
            </div>
          </div>

          <Link
            href="/admin/print-shops"
            className="w-full py-4 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-center text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Chuyển Sang Xưởng In &amp; Mẫu Thật</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-[#717971] font-['JetBrains_Mono']">
        ISO 12647-2 Certified • FOGRA39 Offset Color Calibration
      </footer>
    </div>
  );
}
