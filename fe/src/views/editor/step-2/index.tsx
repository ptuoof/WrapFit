'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GoiMascot } from '@/components/common/GoiMascot';

export default function Step2DimensionsPage() {
  const [length, setLength] = useState(180);
  const [width, setWidth] = useState(120);
  const [height, setHeight] = useState(60);
  const [paperWeight, setPaperWeight] = useState(300);

  const t = (paperWeight / 750).toFixed(2);
  const dielineW = length * 2 + width * 2 + 15;
  const dielineH = height + width * 2 + 30;

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/editor/step-1" className="w-10 h-10 rounded-full bg-white/80 border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-white shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-bold text-[#122e20]">Kích Thước Tương Tác 3D Real-time</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">PARAMETRIC CAD ENGINE • FEFCO DYNAMIC COMPUTE</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#e8ded0] shadow-xs text-xs font-semibold">
          <Link href="/editor/step-1" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">1. Cấu Trúc</Link>
          <span className="px-4 py-1.5 rounded-full bg-[#122e20] text-white">2. Kích Thước</span>
          <Link href="/editor/step-3" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">3. Đồ Họa</Link>
          <Link href="/editor/step-4" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">4. Xuất File</Link>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Parametric Controls Column */}
        <div className="lg:col-span-5 space-y-6 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_20px_rgba(28,25,23,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8ded0]/60">
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20]">Thông Số Vật Lý Quà Tặng (mm)</h3>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-['JetBrains_Mono'] text-xs font-bold">FEFCO 0215</span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#525a54]">Chiều Dài (Length / X)</span>
                <span className="font-['JetBrains_Mono'] font-bold text-[#122e20]">{length} mm</span>
              </div>
              <input type="range" min="60" max="400" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-[#122e20]" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#525a54]">Chiều Rộng (Width / Y)</span>
                <span className="font-['JetBrains_Mono'] font-bold text-[#122e20]">{width} mm</span>
              </div>
              <input type="range" min="50" max="300" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-[#122e20]" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#525a54]">Chiều Cao (Height / Z)</span>
                <span className="font-['JetBrains_Mono'] font-bold text-[#122e20]">{height} mm</span>
              </div>
              <input type="range" min="30" max="220" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-[#122e20]" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#525a54]">Định Lượng Giấy Mỹ Thuật (GSM)</span>
                <span className="font-['JetBrains_Mono'] font-bold text-[#2563eb]">{paperWeight} GSM (t = {t} mm)</span>
              </div>
              <input type="range" min="200" max="450" step="25" value={paperWeight} onChange={(e) => setPaperWeight(Number(e.target.value))} className="w-full accent-[#2563eb]" />
            </div>
          </div>

          {/* Computed Sheet Specs */}
          <div className="p-4 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-1.5">
            <p className="font-['JetBrains_Mono'] text-xs font-bold text-[#122e20]">Khổ Giấy Trải Phẳng Dieline:</p>
            <p className="font-['JetBrains_Mono'] text-sm font-semibold text-[#2563eb]">{dielineW} mm &times; {dielineH} mm</p>
            <p className="text-xs text-[#717971]">Tự động cộng dung sai bù gập Caliper creep: 1.50 &times; {t}mm = {(1.5 * Number(t)).toFixed(2)}mm.</p>
          </div>
        </div>

        {/* 3D Isometric Viewport */}
        <div className="lg:col-span-7 h-[420px] rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#f7f2ef] text-xs font-semibold text-[#122e20]">Isometric 3D Stage</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-['JetBrains_Mono'] font-bold">PARAMETRIC SYNC</span>
          </div>

          <div className="text-center space-y-3 z-10">
            <div className="w-24 h-24 rounded-3xl bg-[#f7f2ef] border border-[#e8ded0] text-[#122e20] flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-5xl">view_in_ar</span>
            </div>
            <h4 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">
              {length} &times; {width} &times; {height} mm
            </h4>
            <p className="text-xs text-[#717971] max-w-sm font-['JetBrains_Mono']">
              Mô hình 3D cập nhật theo thời gian thực • Nắp gài trên và đáy khóa tự động tính toán góc vát 45°
            </p>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-between p-4 px-6 rounded-3xl bg-white/90 backdrop-blur-lg border border-[#e8ded0] shadow-sm">
        <div className="flex items-center gap-3">
          <GoiMascot pose="measuring" size={48} />
          <span className="text-xs font-semibold text-[#122e20]">Chuẩn từng mm! Khổ trải phẳng tự động căn vừa khuôn in.</span>
        </div>

        <Link
          href="/editor/step-3"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          <span>Tiếp Tục: Thiết Kế Artwork</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </footer>
    </div>
  );
}
