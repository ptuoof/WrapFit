'use client';

import React from 'react';
import Link from 'next/link';
import { GoiMascot } from '@/components/mascot/GoiMascot';

export default function Step3ArtworkPage() {
  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/editor/step-2" className="w-10 h-10 rounded-full bg-white/80 border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-white shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-bold text-[#122e20]">Trình Trải Phẳng &amp; Áp Đồ Họa Artwork</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">UV DECAL MAPPER • 6-FACE DIELINE CANVAS</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#e8ded0] shadow-xs text-xs font-semibold">
          <Link href="/editor/step-1" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">1. Cấu Trúc</Link>
          <Link href="/editor/step-2" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">2. Kích Thước</Link>
          <span className="px-4 py-1.5 rounded-full bg-[#122e20] text-white">3. Đồ Họa</span>
          <Link href="/editor/step-4" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">4. Xuất File</Link>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Tool Dock Column */}
        <div className="lg:col-span-4 space-y-4 bg-white p-6 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_20px_rgba(28,25,23,0.03)]">
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20]">Công Cụ Áp Artwork</h3>

          <div className="space-y-3">
            <button className="w-full py-3.5 px-4 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0]/60 text-left flex items-center justify-between text-xs font-semibold transition-all">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#2563eb]">palette</span>
                <span>Bảng Màu Thương Hiệu (Pantone C)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#122e20]"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#d4af37]"></span>
              </div>
            </button>

            <button className="w-full py-3.5 px-4 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0]/60 text-left flex items-center justify-between text-xs font-semibold transition-all">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-600">auto_awesome</span>
                <span>Sinh Hoa Văn AI Generative</span>
              </span>
              <span className="material-symbols-outlined text-base text-[#717971]">chevron_right</span>
            </button>

            <button className="w-full py-3.5 px-4 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0]/60 text-left flex items-center justify-between text-xs font-semibold transition-all">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-700">upload_file</span>
                <span>Tải Logo Vector &amp; Barcode SVG</span>
              </span>
              <span className="material-symbols-outlined text-base text-[#717971]">chevron_right</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-2 text-xs">
            <p className="font-bold text-[#122e20]">Tiêu Chuẩn Lớp Dieline Chuẩn In:</p>
            <div className="space-y-1 font-['JetBrains_Mono'] text-[11px] text-[#525a54]">
              <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E53E3E]"></span> Đường Cắt Dao Knife (Cut)</p>
              <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3182CE]"></span> Đường Cấn Gân Gập (Crease)</p>
              <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38A169]"></span> Vùng Tràn Lề Bleed &ge; 2mm</p>
            </div>
          </div>
        </div>

        {/* 2D Flat Decal Stage */}
        <div className="lg:col-span-8 h-[440px] rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#f7f2ef] text-xs font-semibold text-[#122e20]">2D Decal Artboard</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-['JetBrains_Mono'] font-bold">300 DPI CMYK READY</span>
          </div>

          <div className="text-center space-y-3 z-10">
            <div className="w-24 h-24 rounded-3xl bg-[#f7f2ef] border border-[#e8ded0] text-[#122e20] flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-5xl">architecture</span>
            </div>
            <h4 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">Bản Vẽ Dieline 6 Mặt Trải Phẳng</h4>
            <p className="text-xs text-[#717971] max-w-sm font-['JetBrains_Mono']">
              Nắp Top • Mặt Front • Đáy Bottom • Hông Left/Right • Tự động ánh xạ UV Texture sang không gian 3D
            </p>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-between p-4 px-6 rounded-3xl bg-white/90 backdrop-blur-lg border border-[#e8ded0] shadow-sm">
        <div className="flex items-center gap-3">
          <GoiMascot pose="folding" size={48} />
          <span className="text-xs font-semibold text-[#122e20]">Gập nếp phẳng! Đồ họa artwork căn đúng tâm các mặt hộp.</span>
        </div>

        <Link
          href="/editor/step-4"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          <span>Tiếp Tục: Kiểm Định FitCheck™</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </footer>
    </div>
  );
}
