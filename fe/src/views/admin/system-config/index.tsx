'use client';

import React from 'react';
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
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin">
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span>Command Center</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/media">
              <span className="material-symbols-outlined text-xl">perm_media</span>
              <span>Đa Phương Tiện &amp; Hub</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/dieline-vault">
              <span className="material-symbols-outlined text-xl">architecture</span>
              <span>Dieline Vault CAD</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/revenue">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              <span>Doanh Thu MRR &amp; VAT</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/security">
              <span className="material-symbols-outlined text-xl">verified_user</span>
              <span>Bảo Mật Zero-Trust</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/gpu-cluster">
              <span className="material-symbols-outlined text-xl">memory</span>
              <span>Cụm GPU Render</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/print-shops">
              <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
              <span>Quản Lý Xưởng In</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/appraisal">
              <span className="material-symbols-outlined text-xl">fact_check</span>
              <span>Thẩm Định Ký Gửi</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/ledger">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              <span>Sổ Cái Giao Dịch</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "bg-[#122e20] text-white shadow-sm font-semibold"} href="/admin/system-config">
              <span className="material-symbols-outlined text-xl">tune</span>
              <span>Cấu Hình Hệ Thống</span>
            </Link>
          </nav>
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
              <span className="px-2.5 py-0.5 rounded-full bg-[#486458]/15 text-[#122e20] font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider">SYSTEM CONFIG</span>
              <span className="text-xs text-[#717971] font-['JetBrains_Mono']">BUILD 2026.10</span>
            </div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">Cấu Hình Hệ Thống & Tham Số Toàn Cục</h1>
            <p className="text-sm text-[#525a54] mt-0.5">Quản trị dung sai dao cắt CAD, chuẩn màu CMYK FOGRA39 và phân cụm Multi-Tenant</p>
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
  {/* 4 Top Metric Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Phiên Bản Kernel</span>
      <p className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">WrapFit OS v4.2.8</p>
      <p className="text-xs text-[#486458] mt-1 font-['JetBrains_Mono']">Build Cadence Production</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Bù Dung Sai Caliper</span>
      <p className="font-['Playfair_Display'] text-2xl font-bold text-emerald-700">Auto-Offset</p>
      <p className="text-xs text-[#717971] mt-1 font-['JetBrains_Mono']">±0.05mm Dynamic Creep</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Phân Cụm Multi-Tenant</span>
      <p className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">Bật (Isolated)</p>
      <p className="text-xs text-[#717971] mt-1 font-['JetBrains_Mono']">420 Tenants An Toàn</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider block mb-1">Đồng Bộ Cloud State</span>
      <p className="font-['Playfair_Display'] text-2xl font-bold text-[#2563eb]">14 ms</p>
      <p className="text-xs text-[#717971] mt-1 font-['JetBrains_Mono']">P2P CAD Delta Sync</p>
    </div>
  </div>

  {/* Center Horizontal Smart Deck Card */}
  <div className="p-8 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_14px_rgba(28,25,23,0.04)] space-y-6">
    <div className="flex items-center justify-between pb-4 border-b border-[#e8ded0]/60">
      <div>
        <span className="text-xs font-['JetBrains_Mono'] text-[#486458] uppercase tracking-widest font-bold">SLIDE 1 OF 3 • CAD &amp; PRODUCTION CONFIG</span>
        <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20] mt-1">Tham Số Kỹ Thuật Đóng Gói CAD &amp; Chuẩn In FEFCO/ECMA</h3>
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

    {/* 2-Column Configuration Form */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Dung sai khe hở nắp gài (Tuck-in Gap Tolerance)</p>
          <p className="text-xs text-[#717971]">Độ hở lưỡi gài tiêu chuẩn tránh rách góc nắp</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e8ded0]">
          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#122e20]">0.35 mm</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Góc vát cấn nếp tự động (Crease Angle Bleed)</p>
          <p className="text-xs text-[#717971]">Góc vát chuẩn 45° cho mép dán hông</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e8ded0]">
          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#122e20]">45.0°</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Giới hạn kích thước file xuất CNC (DXF/CF2 Max Limit)</p>
          <p className="text-xs text-[#717971]">Dung lượng tối đa cho file bản vẽ bàn bế</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e8ded0]">
          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#122e20]">150 MB</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Tự động chuyển đổi màu CMYK FOGRA39 khi xuất in</p>
          <p className="text-xs text-[#717971]">Chuẩn in công nghiệp Offset 4 màu</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">BẬT</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Định dạng nén lưu trữ Dieline Vector</p>
          <p className="text-xs text-[#717971]">Tối ưu truyền tải mạng &amp; render 3D nhanh</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#122e20] text-white text-xs font-bold font-['JetBrains_Mono']">Brotli v1.1</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-[#122e20]">Tự động lưu bản vẽ định kỳ (Auto-save Interval)</p>
          <p className="text-xs text-[#717971]">Sao lưu State lên LocalStorage &amp; Cloud</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#e8ded0]">
          <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#122e20]">30 Giây</span>
        </div>
      </div>
    </div>

    {/* Metadata */}
    <div className="pt-4 border-t border-[#e8ded0]/60 flex justify-between items-center text-xs text-[#717971] font-['JetBrains_Mono']">
      <span>Cụm cấu hình: System Node 01 • Runtime: Edge Worker V8</span>
      <span className="text-emerald-700 font-semibold">Thay đổi có hiệu lực ngay lập tức (Hot-Reload)</span>
    </div>
  </div>
</div>

      </main>
    </div>
  );
}
