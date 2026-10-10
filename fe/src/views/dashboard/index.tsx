'use client';

import React from 'react';
import Link from 'next/link';
import { MainHeader, MainFooter, DashboardHeaderNav } from '@/components/layout';
import { StitchRuntime } from '@/features/stitch/runtime/StitchRuntime';

export default function DashboardPage() {
  return (
    <div data-stitch="dashboard" className="min-h-screen bg-[#fff8f5] text-[#1b1c18] flex flex-col justify-between font-['Plus_Jakarta_Sans'] select-none">
      {/* 1. Unified Main Header with Mega Menu */}
      <MainHeader />

      {/* 2. Main Dashboard Content Container */}
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex-1 flex flex-col gap-8">
        {/* Top Header & Sub-Navigation Strip */}
        <header className="flex flex-col gap-5 pb-6 border-b border-[#e8ded0]/60">
          <DashboardHeaderNav />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  CAD ENGINE 1:1 ACTIVE &bull; ISO 12647-2
                </span>
              </div>
              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#122e20]">
                Không Gian Dự Án Bao Bì Của Bạn
              </h1>
              <p className="text-sm text-[#717971] mt-1 max-w-2xl font-normal leading-relaxed">
                Quản lý các khuôn bế CAD, thông số dung sai nếp gấp, kết cấu bao bì FEFCO và thư viện vật liệu thực tế phục vụ sản xuất.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/editor/step-1"
                className="px-5 py-2.5 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-xs font-bold shadow-md shadow-[#122e20]/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Tạo Hộp Mới (4 Bước)</span>
              </Link>
              <Link
                href="/editor/studio"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold shadow-2xs flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-[#2563eb]">view_in_ar</span>
                <span>Mở Master Studio 3D</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 3. Main Bento: Active Packaging Projects (Dự Án Gần Đây) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#122e20]">
                Dự Án Bao Bì Gần Đây
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-200/70 text-stone-700 text-xs font-['JetBrains_Mono'] font-bold">
                4 Đồ Án
              </span>
            </div>
            <Link
              href="/dashboard/projects"
              className="text-xs font-semibold text-[#122e20] hover:underline flex items-center gap-1"
            >
              <span>Xem Tất Cả Dự Án</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Project 1 */}
            <article className="group bg-white rounded-3xl p-4 border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
                  <img
                    src="/stitch/img/727b7e0788de4f2f.jpg"
                    alt="Hộp Cài Đáy Khóa"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-800 font-['JetBrains_Mono'] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FitCheck™ 100%</span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                    220 × 140 × 80 mm
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-stone-500">
                    <span>FEFCO 0215</span>
                    <span>Ivory 350 GSM</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-[#122e20] group-hover:text-blue-700 transition-colors truncate">
                    Hộp Nắp Gài Đáy Khóa Ngược
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    Cán màng mờ Velvet, ép kim nhũ vàng Kurz 22K.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <Link
                  href="/editor/studio"
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#122e20] hover:text-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                  <span>Mở 3D</span>
                </Link>
                <Link
                  href="/editor/step-4"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Kiểm định FitCheck™"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-700">verified</span>
                </Link>
              </div>
            </article>

            {/* Project 2 */}
            <article className="group bg-white rounded-3xl p-4 border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
                  <img
                    src="/stitch/img/9aeea1ca61895060.jpg"
                    alt="Hộp Âm Dương Luxury"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-800 font-['JetBrains_Mono'] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FitCheck™ 100%</span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                    180 × 180 × 60 mm
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-stone-500">
                    <span>Rigid Box</span>
                    <span>Greyboard 2.0mm</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-[#122e20] group-hover:text-blue-700 transition-colors truncate">
                    Hộp Âm Dương Quà Tặng VIP
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    Bồi giấy mỹ thuật kẹp bông, khóa nam châm giấu cạnh.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <Link
                  href="/editor/studio"
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#122e20] hover:text-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                  <span>Mở 3D</span>
                </Link>
                <Link
                  href="/editor/step-4"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Kiểm định FitCheck™"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-700">verified</span>
                </Link>
              </div>
            </article>

            {/* Project 3 */}
            <article className="group bg-white rounded-3xl p-4 border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
                  <img
                    src="/stitch/img/4c7ce7d1a5170261.jpg"
                    alt="Hộp Khay Trượt Bao Diêm"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-800 font-['JetBrains_Mono'] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>FitCheck™ 100%</span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                    150 × 100 × 40 mm
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-stone-500">
                    <span>Sleeve Drawer</span>
                    <span>Kraft 300 GSM</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-[#122e20] group-hover:text-blue-700 transition-colors truncate">
                    Hộp Bao Diêm Khay Trượt
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    Kraft mộc tái sinh, ruy băng lụa kéo khay tinh tế.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <Link
                  href="/editor/studio"
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#122e20] hover:text-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                  <span>Mở 3D</span>
                </Link>
                <Link
                  href="/editor/step-4"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Kiểm định FitCheck™"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-700">verified</span>
                </Link>
              </div>
            </article>

            {/* Project 4 */}
            <article className="group bg-white rounded-3xl p-4 border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3.5">
                  <img
                    src="/stitch/img/0bdf429fa5bb6e20.jpg"
                    alt="Hộp Gối Cong"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-amber-800 font-['JetBrains_Mono'] flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Đang Chỉnh Sửa</span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono">
                    120 × 80 × 30 mm
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-stone-500">
                    <span>Pillow Box</span>
                    <span>Kraft 280 GSM</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-[#122e20] group-hover:text-blue-700 transition-colors truncate">
                    Hộp Gối Uốn Cong Phụ Kiện
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    Cấn gân cung tròn hai đầu, khóa cài tự ngậm không keo.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <Link
                  href="/editor/studio"
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#122e20] hover:text-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">view_in_ar</span>
                  <span>Mở 3D</span>
                </Link>
                <Link
                  href="/editor/step-4"
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Kiểm định FitCheck™"
                >
                  <span className="material-symbols-outlined text-[17px] text-amber-600">verified</span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* 4. Packaging Ecosystem Shortcuts (Brand Kit, Materials, Orders, Specs) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Brand Kit */}
          <Link
            href="/dashboard/brand-kit"
            className="group p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">palette</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#122e20]">
                Brand Kit &amp; Màu Pantone
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Đồng bộ mã màu Spot ink, khuôn ép kim nóng 22K và font chữ khắc laser.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#122e20] group-hover:translate-x-1 transition-transform">
              <span>Mở Brand Kit</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </Link>

          {/* Card 2: Materials */}
          <Link
            href="/dashboard/materials"
            className="group p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">texture</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#122e20]">
                Kho Vật Liệu PBR &amp; Giấy
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Giấy kẹp bông, Kraft organic, màng Velvet và cốt Greyboard sẵn có tại 4 xưởng in.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#122e20] group-hover:translate-x-1 transition-transform">
              <span>Xem Thư Viện Vật Liệu</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </Link>

          {/* Card 3: Orders & VAT */}
          <Link
            href="/dashboard/orders"
            className="group p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#122e20]">
                Đơn Hàng &amp; Hóa Đơn VAT
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Theo dõi tiến độ chế bản, xuất hóa đơn điện tử CQT và quản lý bản quyền CAD.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#122e20] group-hover:translate-x-1 transition-transform">
              <span>Tra Cứu Đơn Hàng</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </Link>

          {/* Card 4: Specs CAD */}
          <Link
            href="/dashboard/specs"
            className="group p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">architecture</span>
              </div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#122e20]">
                Quy Chuẩn CAD &amp; Caliper
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Bảng thông số bù co giãn nếp gấp, độ dày Caliper và tiêu chuẩn dao bế FEFCO.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#122e20] group-hover:translate-x-1 transition-transform">
              <span>Xem Quy Chuẩn Kỹ Thuật</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </Link>
        </section>

        {/* 5. Companion Mascot Copilot Bar */}
        <section className="bg-white rounded-3xl p-5 border border-[#e8ded0]/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 p-1 flex items-center justify-center shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1XxMYClelQATTbgX-vN_jkPVV4PnMq2OIqCnXmvGWJZVLKvlmtyezi-_Xmj82uuy0I0F9K3YDSknOObCwlRFLmimZMNB29nGbj-O-qQZnuPZ9FkcHbB8Cvt6yE7WrNrURALTtcfv129y3JfhuVsWsF2bwCwPyTHEjBAfHHBsXdjJQNcV_W9LJjzJmd9Io_1uZhRLT_5EMNaOHFvUyLbucdqWwc5Fve6ZbGa8e0Z6hUsoD2JeAHPo1q6TVY"
                alt="Bé Gói WrapFit Copilot"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#122e20]">Bé Gói AI Packaging Copilot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Tự động kiểm định
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Các bản vẽ trong kho đồ án của bạn luôn được tiền kiểm tự động: Vùng an toàn &ge; 3mm, Bleed bù xén &ge; 2mm, đảm bảo không lỗi khi lên máy bế!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/support"
              className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">help</span>
              <span>Trợ Giúp CAD</span>
            </Link>
            <Link
              href="/editor/step-1"
              className="px-4 py-2 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Bắt Đầu Ngay</span>
            </Link>
          </div>
        </section>
      </main>

      {/* 6. Unified Footer */}
      <MainFooter />

      <StitchRuntime screen="dashboard" />
    </div>
  );
}
