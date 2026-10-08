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
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "bg-[#122e20] text-white shadow-sm font-semibold"} href="/admin/appraisal">
              <span className="material-symbols-outlined text-xl">fact_check</span>
              <span>Thẩm Định Ký Gửi</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/ledger">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              <span>Sổ Cái Giao Dịch</span>
            </Link>
            <Link className={"flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm " + "text-[#525a54] hover:bg-white hover:text-[#1b1c18]"} href="/admin/system-config">
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
              <span className="px-2.5 py-0.5 rounded-full bg-[#486458]/15 text-[#122e20] font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider">CAD APPRAISAL</span>
              <span className="text-xs text-[#717971] font-['JetBrains_Mono']">BUILD 2026.10</span>
            </div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">Trung Tâm Thẩm Định Mẫu Hộp Ký Gửi</h1>
            <p className="text-sm text-[#525a54] mt-0.5">Đánh giá độ khả thi dao bế laser CNC, bù gập Caliper và duyệt xuất bản mẫu dieline ra Vault công khai</p>
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
  {/* 4 Top KPI Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider">Chờ Thẩm Định</span>
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
      </div>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">8 Mẫu</p>
      <p className="text-xs text-[#486458] mt-1 font-['JetBrains_Mono']">3 Mẫu ưu tiên cao (SLA &lt; 2h)</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider">Đã Duyệt Tháng Này</span>
        <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
      </div>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">142 Mẫu</p>
      <p className="text-xs text-emerald-700 mt-1 font-['JetBrains_Mono']">+18.5% so với tháng trước</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider">Tỷ Lệ Đạt Dao Bế</span>
        <span className="material-symbols-outlined text-[#2563eb] text-lg">precision_manufacturing</span>
      </div>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">94.6%</p>
      <p className="text-xs text-[#525a54] mt-1 font-['JetBrains_Mono']">Chuẩn ISO 12647-2 &amp; FEFCO</p>
    </div>
    <div className="p-5 rounded-2xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_8px_rgba(28,25,23,0.03)]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider">Doanh Thu Ký Gửi</span>
        <span className="material-symbols-outlined text-[#d4af37] text-lg">monetization_on</span>
      </div>
      <p className="font-['Playfair_Display'] text-3xl font-bold text-[#122e20]">86.4M VNĐ</p>
      <p className="text-xs text-[#486458] mt-1 font-['JetBrains_Mono']">Chia sẻ 70/30 Creators</p>
    </div>
  </div>

  {/* Main Studio Area */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_12px_rgba(28,25,23,0.04)] space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#e8ded0]/60">
        <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20]">Hàng Đợi Thẩm Định CAD Dieline Ký Gửi</h3>
        <span className="font-['JetBrains_Mono'] text-xs text-[#717971]">Đồng bộ trực tiếp Cloud S3</span>
      </div>

      <div className="divide-y divide-[#e8ded0]/60">
        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0] flex items-center justify-center text-[#122e20]">
              <span className="material-symbols-outlined text-2xl">deployed_code</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base text-[#122e20]">Hộp Nam Châm Nắp Gập Ép Kim</p>
                <span className="font-['JetBrains_Mono'] text-xs text-[#717971]">#WF-APP-094</span>
              </div>
              <p className="text-xs text-[#525a54] mt-0.5">Creator: Kiri Atelier • FEFCO 0215 • Caliper 1.8mm • Tương thích máy bế Heidelberg</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-['JetBrains_Mono'] text-xs font-bold">98/100 Điểm</span>
            <button className="px-4 py-2 rounded-xl bg-[#122e20] text-white text-xs font-semibold shadow-xs hover:bg-[#1a382b] transition-all">Duyệt Ký Gửi</button>
          </div>
        </div>

        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0] flex items-center justify-center text-[#122e20]">
              <span className="material-symbols-outlined text-2xl">wine_bar</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base text-[#122e20]">Hộp Rượu Cao Cấp Nắp Trượt Nam Châm</p>
                <span className="font-['JetBrains_Mono'] text-xs text-[#717971]">#WF-APP-095</span>
              </div>
              <p className="text-xs text-[#525a54] mt-0.5">Xưởng Bao Bì Hà Nội • Carton lạnh 2.5mm phủ nhung • FEFCO 0501 Slider</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-['JetBrains_Mono'] text-xs font-bold">95/100 Điểm</span>
            <button className="px-4 py-2 rounded-xl bg-[#122e20] text-white text-xs font-semibold shadow-xs hover:bg-[#1a382b] transition-all">Duyệt Ký Gửi</button>
          </div>
        </div>

        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0] flex items-center justify-center text-[#122e20]">
              <span className="material-symbols-outlined text-2xl">card_giftcard</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base text-[#122e20]">Hộp Gối Uốn Khóa Gập Mỹ Thuật</p>
                <span className="font-['JetBrains_Mono'] text-xs text-[#717971]">#WF-APP-096</span>
              </div>
              <p className="text-xs text-[#525a54] mt-0.5">Saigon Paper Studio • Giấy Ivory 350 GSM • Pillow Box đường cong Parabol</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-['JetBrains_Mono'] text-xs font-bold">92/100 Điểm</span>
            <button className="px-4 py-2 rounded-xl bg-[#122e20] text-white text-xs font-semibold shadow-xs hover:bg-[#1a382b] transition-all">Duyệt Ký Gửi</button>
          </div>
        </div>
      </div>
    </div>

    {/* Right Inspection Rules */}
    <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-[#e8ded0]/80 shadow-[0_2px_12px_rgba(28,25,23,0.04)] space-y-5">
      <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#122e20]">Tiêu Chí Thẩm Định FitCheck™</h3>
      <p className="text-xs text-[#525a54]">Bản vẽ Dieline ký gửi bắt buộc phải vượt qua 4 chốt kiểm định vật lý trước khi cấp phép phát hành ra Vault công khai:</p>

      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
            <span className="text-sm font-semibold text-[#122e20]">Độ Khả Thi Cắt Bế Laser CNC &gt; 90%</span>
          </div>
          <p className="text-xs text-[#717971] pl-6 font-['JetBrains_Mono']">Tối thiểu bán kính góc cong R &ge; 0.5mm</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
            <span className="text-sm font-semibold text-[#122e20]">Khoảng Hở Mép Dán Keo &gt; 12mm</span>
          </div>
          <p className="text-xs text-[#717971] pl-6 font-['JetBrains_Mono']">Đảm bảo máy dán keo tự động bám dính an toàn</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
            <span className="text-sm font-semibold text-[#122e20]">Bù Nếp Gấp Caliper &plusmn;0.05mm</span>
          </div>
          <p className="text-xs text-[#717971] pl-6 font-['JetBrains_Mono']">Hạn chế bục rách thớ giấy khi uốn góc 90°/180°</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#f7f2ef] border border-[#e8ded0]/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
            <span className="text-sm font-semibold text-[#122e20]">Vùng Tràn Lề Artwork &ge; 2.0mm</span>
          </div>
          <p className="text-xs text-[#717971] pl-6 font-['JetBrains_Mono']">Triệt tiêu hoàn toàn viền trắng khi xén lệch</p>
        </div>
      </div>
    </div>
  </div>
</div>

      </main>
    </div>
  );
}
