'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GoiMascot } from '@/components/common/GoiMascot';

export default function Step1BoxStructurePage() {
  const [selectedBox, setSelectedBox] = useState('rte');

  const boxes = [
    {
      id: 'rte',
      name: 'Nắp Gài Đáy Khóa',
      sub: 'RTE Box',
      code: 'FEFCO 0215',
      badge: '1:1 Scale',
      img: 'https://lh3.googleusercontent.com/aida/AEtjO1UCszzzMUMXqRg4GnUya76V6lhDrchZDLXCBVfxTbv69hA0cQucvLTGTCvBNNTBvHkvk5UYGqXg06sh1zMY2ZcG5GZgO727uisAKd8XuDnNgiwrYMa7sOWwecrPqvtoM-kvefSPJjkU1HMF0LWX-Lu4ZyiRyAkggy6xCrpqUxSyQLQs_MI9Ji7VfS8aA0whI0ZCQrZdnrANdh-XnaAvpjEvsMg5MgCpKSpob-h8xf5lR8MOAgDFFlt2MEGT'
    },
    {
      id: 'drawer',
      name: 'Bao Diêm Ngăn Kéo',
      sub: 'Sleeve Drawer Box',
      code: 'FEFCO 0501',
      badge: '1:1 Scale',
      img: 'https://lh3.googleusercontent.com/aida/AEtjO1UCszzzMUMXqRg4GnUya76V6lhDrchZDLXCBVfxTbv69hA0cQucvLTGTCvBNNTBvHkvk5UYGqXg06sh1zMY2ZcG5GZgO727uisAKd8XuDnNgiwrYMa7sOWwecrPqvtoM-kvefSPJjkU1HMF0LWX-Lu4ZyiRyAkggy6xCrpqUxSyQLQs_MI9Ji7VfS8aA0whI0ZCQrZdnrANdh-XnaAvpjEvsMg5MgCpKSpob-h8xf5lR8MOAgDFFlt2MEGT'
    },
    {
      id: 'rigid',
      name: 'Âm Dương Nắp Chụp',
      sub: 'Rigid Luxury Box',
      code: 'FEFCO 0300',
      badge: '1:1 Scale',
      img: 'https://lh3.googleusercontent.com/aida/AEtjO1UCszzzMUMXqRg4GnUya76V6lhDrchZDLXCBVfxTbv69hA0cQucvLTGTCvBNNTBvHkvk5UYGqXg06sh1zMY2ZcG5GZgO727uisAKd8XuDnNgiwrYMa7sOWwecrPqvtoM-kvefSPJjkU1HMF0LWX-Lu4ZyiRyAkggy6xCrpqUxSyQLQs_MI9Ji7VfS8aA0whI0ZCQrZdnrANdh-XnaAvpjEvsMg5MgCpKSpob-h8xf5lR8MOAgDFFlt2MEGT'
    },
    {
      id: 'mailer',
      name: 'Hộp Mailer Cánh Khóa',
      sub: 'Mailer Box',
      code: 'FEFCO 0427',
      badge: '1:1 Scale',
      img: 'https://lh3.googleusercontent.com/aida/AEtjO1UCszzzMUMXqRg4GnUya76V6lhDrchZDLXCBVfxTbv69hA0cQucvLTGTCvBNNTBvHkvk5UYGqXg06sh1zMY2ZcG5GZgO727uisAKd8XuDnNgiwrYMa7sOWwecrPqvtoM-kvefSPJjkU1HMF0LWX-Lu4ZyiRyAkggy6xCrpqUxSyQLQs_MI9Ji7VfS8aA0whI0ZCQrZdnrANdh-XnaAvpjEvsMg5MgCpKSpob-h8xf5lR8MOAgDFFlt2MEGT'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between p-6 lg:p-10 font-['Plus_Jakarta_Sans'] select-none">
      {/* Top Floating Header & Stepper */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/editor" className="w-10 h-10 rounded-full bg-white/80 border border-[#e8ded0] flex items-center justify-center text-[#122e20] hover:bg-white shadow-xs transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-bold text-[#122e20]">Chọn Cấu Trúc Bao Bì</h1>
            <p className="text-xs text-[#717971] font-['JetBrains_Mono']">VISUAL-FIRST STUDIO • ZERO-FRICTION</p>
          </div>
        </div>

        {/* Stepper indicator pill */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-full border border-[#e8ded0] shadow-xs text-xs font-semibold">
          <span className="px-4 py-1.5 rounded-full bg-[#122e20] text-white">1. Cấu Trúc</span>
          <Link href="/editor/step-2" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">2. Kích Thước</Link>
          <Link href="/editor/step-3" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">3. Đồ Họa</Link>
          <Link href="/editor/step-4" className="px-3 py-1.5 rounded-full text-[#717971] hover:text-[#122e20] transition-colors">4. Xuất File</Link>
        </div>
      </header>

      {/* Visual-First 4 Card Grid (No chunky borders, Hover lift, Optical glow) */}
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-auto py-8">
        {boxes.map((b) => {
          const isSelected = selectedBox === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBox(b.id)}
              className={"group relative rounded-3xl p-6 cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden " +
                (isSelected
                  ? "bg-white shadow-[0_12px_36px_rgba(37,99,235,0.12)] ring-2 ring-[#2563eb] scale-[1.03]"
                  : "bg-white/60 hover:bg-white shadow-[0_4px_16px_rgba(28,25,23,0.03)] hover:shadow-[0_12px_28px_rgba(28,25,23,0.08)] hover:-translate-y-1.5")}
            >
              {/* Podium & 3D Mockup */}
              <div>
                <div className="w-full h-52 rounded-2xl bg-gradient-to-b from-[#f7f2ef] to-[#efe7dd] flex items-center justify-center overflow-hidden mb-6 relative">
                  <img
                    src={b.img}
                    alt={b.name}
                    className="w-4/5 h-4/5 object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                  />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold font-['JetBrains_Mono'] text-[#122e20] shadow-xs">
                    {b.badge}
                  </span>
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20] group-hover:text-[#2563eb] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[#717971] font-['JetBrains_Mono']">{b.code}</p>
                </div>
              </div>

              {/* Minimalist Selection Status */}
              <div className="mt-6 pt-4 border-t border-[#e8ded0]/50 flex items-center justify-between text-xs">
                <span className={"font-semibold transition-colors " + (isSelected ? "text-[#2563eb]" : "text-[#717971] group-hover:text-[#122e20]")}>
                  {isSelected ? 'Đã Chọn' : 'Chạm để chọn'}
                </span>
                <span className={"material-symbols-outlined text-lg transition-transform group-hover:translate-x-1 " + (isSelected ? "text-[#2563eb]" : "text-[#717971]")}>
                  {isSelected ? 'check_circle' : 'arrow_forward'}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Glass Dock with Bé Gói */}
      <footer className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 rounded-3xl bg-white/90 backdrop-blur-lg border border-[#e8ded0] shadow-[0_8px_30px_rgba(0,0,0,0.06)] gap-4">
        <div className="flex items-center gap-4">
          <GoiMascot pose="waving" size={56} />
          <div>
            <p className="text-sm font-bold text-[#122e20]">Bé Gói AI Copilot</p>
            <p className="text-xs text-[#717971]">Hệ thống tự cân chỉnh dao bế &amp; bù nếp gập theo định lượng giấy.</p>
          </div>
        </div>

        <Link
          href="/editor/step-2"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          <span>Tiếp Tục: Nhập Kích Thước CAD</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </footer>
    </div>
  );
}
