'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GoiMascot } from '@/components/common/GoiMascot';

export default function CheckoutStep2Page() {
  const [method, setMethod] = useState('card');

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/checkout/step-1" className="w-10 h-10 rounded-full bg-white/80 border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-white shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-bold text-[#122e20]">Phương Thức Thanh Toán</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">VISUAL-FIRST CHECKOUT • ZERO-CLUTTER</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#e8ded0] shadow-xs text-xs font-semibold">
          <Link href="/checkout/step-1" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">1. Chọn Gói</Link>
          <span className="px-4 py-1.5 rounded-full bg-[#122e20] text-white">2. Thanh Toán</span>
          <Link href="/checkout/step-3" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">3. Cấp Phép</Link>
        </div>
      </header>

      {/* Main Payment Stage with 3D Holographic Card */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Holographic 3D Card Display */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-80 h-52 rounded-3xl bg-gradient-to-tr from-[#122e20] via-[#1c422d] to-[#2563eb] p-6 text-white shadow-[0_20px_40px_rgba(18,46,32,0.25)] flex flex-col justify-between relative overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-['Playfair_Display'] text-lg font-bold tracking-wider">WrapFit</span>
                <span className="block text-[10px] font-['JetBrains_Mono'] text-white/70 uppercase">Studio Pass Enterprise</span>
              </div>
              <div className="w-10 h-7 rounded-md bg-amber-400/80 flex items-center justify-center font-bold text-[10px] text-black">
                CHIP
              </div>
            </div>

            <div className="space-y-1 font-['JetBrains_Mono']">
              <p className="text-lg tracking-widest font-bold">4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8894</p>
              <div className="flex justify-between text-[11px] text-white/80">
                <span>ELENA VANCE</span>
                <span>10/28</span>
              </div>
            </div>
          </div>

          {/* Visual Slip Total */}
          <div className="w-80 mt-6 p-4 rounded-2xl bg-white border border-[#e8ded0] shadow-xs text-center space-y-1">
            <p className="text-xs text-[#717971] uppercase font-['JetBrains_Mono']">Tổng Thanh Toán Đã Khấu Trừ VAT</p>
            <p className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">2.990.000 VNĐ ($583.20)</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ĐÃ ÁP DỤNG MÃ GIẢM 20%
            </span>
          </div>
        </div>

        {/* Soft Minimal Form */}
        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-[#e8ded0]/80 shadow-[0_4px_24px_rgba(28,25,23,0.04)] space-y-5">
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20]">Thông Tin Thẻ Bảo Mật</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#525a54] mb-1">Tên Chủ Thẻ</label>
              <input type="text" defaultValue="Elena Vance" className="w-full px-4 py-3 rounded-2xl bg-[#f7f2ef] border-none text-sm font-semibold text-[#122e20] focus:ring-2 focus:ring-[#2563eb]" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#525a54] mb-1">Số Thẻ Tín Dụng</label>
              <input type="text" defaultValue="4242 8821 9012 8894" className="w-full px-4 py-3 rounded-2xl bg-[#f7f2ef] border-none text-sm font-['JetBrains_Mono'] font-semibold text-[#122e20] focus:ring-2 focus:ring-[#2563eb]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#525a54] mb-1">Hạn Thẻ (MM/YY)</label>
                <input type="text" defaultValue="10/28" className="w-full px-4 py-3 rounded-2xl bg-[#f7f2ef] border-none text-sm font-['JetBrains_Mono'] font-semibold text-[#122e20] focus:ring-2 focus:ring-[#2563eb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525a54] mb-1">Mã Bảo Mật CVV</label>
                <input type="password" defaultValue="888" className="w-full px-4 py-3 rounded-2xl bg-[#f7f2ef] border-none text-sm font-['JetBrains_Mono'] font-semibold text-[#122e20] focus:ring-2 focus:ring-[#2563eb]" />
              </div>
            </div>
          </div>

          <Link
            href="/checkout/step-3"
            className="w-full py-4 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white text-center text-sm font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Xác Nhận &amp; Tiếp Tục Bảo Mật</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-between p-4 px-6 rounded-3xl bg-white/90 backdrop-blur-lg border border-[#e8ded0] shadow-sm">
        <div className="flex items-center gap-3">
          <GoiMascot pose="delivery" size={48} />
          <span className="text-xs font-semibold text-[#122e20]">Bảo chứng thanh toán ngân hàng chuẩn PCI-DSS Level 1.</span>
        </div>
        <span className="text-xs text-[#717971] font-['JetBrains_Mono']">Stripe B2B &bull; Napas 24/7 Verified</span>
      </footer>
    </div>
  );
}
