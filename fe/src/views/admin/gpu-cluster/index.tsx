'use client';

import React from 'react';
import { AdminSidebarNav } from '@/components/layout';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="bg-[#fff8f5] font-['Plus_Jakarta_Sans'] text-[#1b1c18] antialiased min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#f7f2ef] z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e8ded0]/50">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-xl bg-[#122e20] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-2xl">deployed_code</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Playfair_Display'] text-xl text-[#122e20] tracking-tight font-bold">WrapFit</span>
                <span className="px-1.5 py-0.5 rounded bg-[#486458]/15 text-[#122e20] font-['JetBrains_Mono'] text-[10px] uppercase font-semibold">PRO CAD</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#717971] uppercase tracking-wider block">Admin Engine v4.2</span>
            </div>
          </div>
          <div className="px-3">
            <div className="p-2.5 rounded-xl bg-white flex items-center justify-between shadow-[0_1px_3px_rgba(28,25,23,0.04)] border border-[#e8ded0]/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#122e20] animate-pulse"></span>
                <span className="text-xs font-semibold text-[#1b1c18]">12/12 Cụm In Online</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs text-[#486458] font-semibold">100%</span>
            </div>
          </div>
          <AdminSidebarNav />
        </div>

        <div className="pt-4 border-t border-[#e8ded0]/60 flex items-center gap-3 px-3">
          <div className="w-9 h-9 rounded-full bg-[#122e20] text-white flex items-center justify-center font-bold text-sm">EV</div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-[#1b1c18] truncate">Elena Vance</p>
            <p className="text-xs text-[#717971] truncate">Lead CAD Architect</p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="ml-72 min-h-screen p-8 lg:p-10 max-w-[1920px]">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[#e8ded0]/60 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#486458]/15 text-[#122e20] font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider">SECURITY CORE</span>
              <span className="text-xs text-[#717971] font-['JetBrains_Mono']">BUILD 2026.10</span>
            </div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">Nhật Ký Bảo Mật Zero-Trust & Cụm GPU</h1>
            <p className="text-sm text-[#525a54] mt-0.5">Giám sát cụm server render 3D WebGL, tải VRAM và sổ cái bất biến SHA-256</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-white text-[#1b1c18] border border-[#e8ded0] text-xs font-semibold shadow-xs hover:bg-[#f7f2ef] transition-colors">
              Về User Dashboard
            </Link>
            <button className="px-4 py-2 rounded-xl bg-[#122e20] text-white text-xs font-semibold shadow-sm hover:bg-[#1a382b] transition-all flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Đồng Bộ Dữ Liệu</span>
            </button>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        
<div className="space-y-8">
  {/* Eyebrow & 4 KPI Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Trạng Thái An Ninh WAF</span>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-emerald-700">100% Clean</p>
      <p className="text-xs text-[#717971] mt-1 font-['JetBrains_Mono']">Zero-Trust Cloudflare Edge</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Tải Cụm GPU 2 Nodes</span>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#2563eb]">14.2 ms</p>
      <p className="text-xs text-[#717971] mt-1 font-['JetBrains_Mono']">Jitter &lt; 0.8ms • H100 Mesh</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Xác Thực FIDO2 / Passkey</span>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">420/420</p>
      <p className="text-xs text-emerald-700 mt-1 font-['JetBrains_Mono']">100% Phiên Đăng Nhập Khóa</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Sự Cố An Ninh 30 Ngày</span>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">0 Incident</p>
      <p className="text-xs text-[#486458] mt-1 font-['JetBrains_Mono']">SLA Uptime 99.99%</p>
    </div>
  </div>

  {/* Horizontal Smart Deck Card */}
  <div className="p-8 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_14px_rgba(28,25,23,0.04)] relative">
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e8ded0]/60">
      <div>
        <span className="text-xs font-['JetBrains_Mono'] text-[#486458] uppercase tracking-widest font-bold">SLIDE 1 OF 3 • CLUSTER METRICS</span>
        <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20] mt-1">Bklit Live GPU &amp; Mesh Cluster Nodes</h3>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-[#f7f2ef] hover:bg-[#e8ded0] flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-[#f7f2ef] hover:bg-[#e8ded0] flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>

    {/* 2 Cluster Nodes Visualization */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="p-6 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-base text-[#122e20]">Node AWS Hà Nội (ap-southeast-1)</h4>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">2x NVIDIA H100 80GB SXM5</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">HEALTHY</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-['JetBrains_Mono']">
            <span>VRAM Allocation (48.2 GB / 160 GB)</span>
            <span className="font-bold">30.1%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div className="h-full bg-[#2563eb] rounded-full" style={{ width: '30.1%' }}></div>
          </div>
        </div>
        <p className="text-xs text-[#525a54]">Chịu tải Ray-tracing 3D WebGL Shader và nén file vector PDF CMYK thời gian thực.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-base text-[#122e20]">Node Viettel IDC Tân Bình (VN-SGN)</h4>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">4x NVIDIA L40S 48GB Ada</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">HEALTHY</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-['JetBrains_Mono']">
            <span>VRAM Allocation (38.8 GB / 192 GB)</span>
            <span className="font-bold">20.2%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '20.2%' }}></div>
          </div>
        </div>
        <p className="text-xs text-[#525a54]">Xử lý xuất vector DXF/CF2 cho dao cắt CNC xưởng in nội địa tốc độ cực nhanh.</p>
      </div>
    </div>

    {/* Bottom Deck Pagination Note */}
    <div className="pt-4 border-t border-[#e8ded0]/60 flex items-center justify-between text-xs text-[#717971]">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#122e20]"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
        <span className="ml-2 font-['JetBrains_Mono']">Kéo chuột trái / phải hoặc dùng phím mũi tên để lướt</span>
      </div>
      <span className="font-['JetBrains_Mono']">Mã hóa SHA-256 Ledger Guarded</span>
    </div>
  </div>
</div>

      </main>
    </div>
  );
}
