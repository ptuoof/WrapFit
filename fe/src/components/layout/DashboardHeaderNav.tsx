'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserAvatarDropdown } from './UserAvatarDropdown';

export const DASHBOARD_TABS = [
  { href: '/dashboard', label: 'Tổng Quan', icon: 'grid_view' },
  { href: '/dashboard/projects', label: 'Dự Án', icon: 'folder_special' },
  { href: '/dashboard/orders', label: 'Đơn Hàng & VAT', icon: 'receipt_long' },
  { href: '/dashboard/brand-kit', label: 'Brand Kit', icon: 'palette' },
  { href: '/dashboard/materials', label: 'Vật Liệu PBR', icon: 'texture' },
  { href: '/dashboard/specs', label: 'Quy Chuẩn CAD', icon: 'architecture' },
  { href: '/dashboard/profile', label: 'Hồ Sơ', icon: 'badge' },
  { href: '/dashboard/settings', label: 'Cài Đặt', icon: 'tune' },
];

export function DashboardHeaderNav({
  showActions = true,
  showAvatar = true,
}: {
  showActions?: boolean;
  showAvatar?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col xl:flex-row items-center justify-between gap-3 w-full">
      {/* Navigation Pill Tabs */}
      <nav
        className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto py-1 scrollbar-none"
        data-purpose="nav-tabs"
      >
        {DASHBOARD_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-700 font-medium border border-stone-200/50 shadow-2xs'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] leading-none">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Action Buttons & Interactive Account Avatar */}
      <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
        {showActions && (
          <>
            <Link
              href="/editor"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all border border-stone-200/60 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
              <span>3D Studio</span>
            </Link>
            <Link
              href="/editor/step-1"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#122e20] hover:bg-[#1a382b] text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ Tạo Hộp Mới</span>
            </Link>
          </>
        )}

        {showAvatar && <UserAvatarDropdown size="md" align="right" />}
      </div>
    </div>
  );
}
