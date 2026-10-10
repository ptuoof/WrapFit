'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardHeaderNav } from '@/components/layout';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

export default function DashboardOrdersPage() {
  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] font-['Plus_Jakarta_Sans'] select-none flex flex-col justify-between">
      <MainHeader />
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1">
      <div className="w-full max-w-[1720px] mx-auto">
        <header className="flex flex-col gap-5 pb-6 mb-8 border-b border-[#e8ded0]/60">
        <DashboardHeaderNav />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-[#f7f2ef] shadow-xs transition-all">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">Lịch Sử Đơn Hàng &amp; Hóa Đơn Điện Tử VAT</h1>
              <p className="text-xs text-[#717971] font-['JetBrains_Mono']">INTERACTIVE BENTO FOCUS &bull; CQT COMPLIANT</p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">
            TỔNG CHI TIÊU: 48.250.000 VNĐ
          </span>
        </div>
      </header>

      {/* Split Bento Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 4 Bento Blocks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-xs cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-amber-800">KHỐI 1</span>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-amber-950 mt-1">3+ Đơn Hàng Hoàn Tất</h3>
            <p className="text-xs text-amber-800/80 mt-1">Đơn hộp quà nắp gập Maison de Luxe &bull; Đã giao thành công</p>
          </div>

          <div className="p-6 rounded-3xl bg-lime-50 border border-lime-200/80 shadow-xs cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-lime-800">KHỐI 2</span>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-lime-950 mt-1">14 Hóa Đơn VAT CQT</h3>
            <p className="text-xs text-lime-800/80 mt-1">100% đồng bộ mã xác thực Tổng cục Thuế hợp lệ</p>
          </div>

          <div className="p-6 rounded-3xl bg-sky-50 border border-sky-200/80 shadow-xs cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-sky-800">KHỐI 3</span>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-sky-950 mt-1">1 Đang Cắt Bế CNC</h3>
            <p className="text-xs text-sky-800/80 mt-1">Xưởng In Tân Giang tiến độ 68% &bull; Dự kiến giao 12/10</p>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-xs cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest font-bold text-emerald-800">KHỐI 4</span>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-emerald-950 mt-1">Bản Quyền CAD Vault</h3>
            <p className="text-xs text-emerald-800/80 mt-1">Gói Solo Pro 1 năm &bull; Không giới hạn tải vector DXF</p>
          </div>
        </div>

        {/* Right Column: Order Detail Slide-Over Card */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-[#e8ded0]/60">
            <div>
              <span className="text-xs font-['JetBrains_Mono'] text-[#717971]">HÓA ĐƠN ĐIỆN TỬ CHI TIẾT</span>
              <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20] mt-1">#HD-2026-10-901</h3>
              <p className="text-xs text-[#525a54] mt-0.5">Mã tra cứu CQT: <strong>CQT-2605-VAT-901</strong> &bull; Thuế suất GTGT 8%</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-['JetBrains_Mono']">HỢP LỆ</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#f7f2ef] flex justify-between items-center text-sm">
              <span className="font-semibold text-[#122e20]">500x Hộp Quà Nam Châm Ép Kim (Custom CAD)</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#122e20]">12.850.000 VNĐ</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f7f2ef] flex justify-between items-center text-sm">
              <span className="text-[#525a54]">Thuế Giá Trị Gia Tăng (VAT 8%)</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#122e20]">1.028.000 VNĐ</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#e8ded0] flex justify-between items-center text-base font-bold">
              <span className="text-[#122e20]">Tổng Cộng Đã Thanh Toán</span>
              <span className="font-['JetBrains_Mono'] text-[#2563eb]">13.878.000 VNĐ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <button className="py-3 px-4 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0] text-xs font-semibold text-[#122e20] flex items-center justify-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Tải PDF Hóa Đơn</span>
            </button>
            <button className="py-3 px-4 rounded-2xl bg-[#f7f2ef] hover:bg-[#e8ded0] text-xs font-semibold text-[#122e20] flex items-center justify-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">download</span>
              <span>Tải Hồ Sơ CAD</span>
            </button>
            <button className="py-3 px-4 rounded-2xl bg-[#122e20] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#1a382b] transition-colors">
              <span className="material-symbols-outlined text-base">qr_code</span>
              <span>Đối Soát QR CQT</span>
            </button>
          </div>
        </div>
      </main>
      </div></div>
      <MainFooter />
    </div>
  );
}
