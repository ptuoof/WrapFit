'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { DashboardHeaderNav } from './DashboardHeaderNav';

export interface DashboardTopBarProps {
  /** Page title or subtitle */
  title?: string;
  /** Whether to show the quick actions inside DashboardHeaderNav */
  showActions?: boolean;
  className?: string;
}

export function DashboardTopBar({
  title = 'Không Gian Sáng Tạo',
  showActions = true,
  className = '',
}: DashboardTopBarProps) {
  return (
    <header className={`w-full bg-white/90 backdrop-blur-xl border-b border-stone-200/70 py-3.5 px-4 sm:px-6 lg:px-8 space-y-3 ${className}`}>
      {/* Upper Row: Brand Logo, Status & Account Menu */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Page Subtitle */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" href="/dashboard" />
          <div className="h-4 w-px bg-stone-300 hidden sm:block" />
          <span className="hidden sm:inline-block font-['Plus_Jakarta_Sans'] text-xs font-semibold text-stone-500">
            {title}
          </span>
        </div>

        {/* Right: Notifications, Engine Status, Avatar Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-['JetBrains_Mono'] text-[11px] font-semibold border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CAD Cloud Node • OK</span>
          </div>

          {/* Quick Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-full text-stone-600 hover:text-black hover:bg-stone-100 transition-colors"
            title="Trung tâm thông báo"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </Link>

          {/* User Avatar Dropdown */}
          <UserAvatarDropdown size="md" align="right" />
        </div>
      </div>

      {/* Lower Row: Synchronized Dashboard Navigation Tabs */}
      <div className="max-w-7xl mx-auto pt-1 border-t border-stone-100">
        <DashboardHeaderNav showActions={showActions} />
      </div>
    </header>
  );
}
