'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface UserAvatarDropdownProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
}

export function UserAvatarDropdown({
  name = 'Packy Studio',
  role = 'Solo Creator Tier',
  avatarUrl = 'https://lh3.googleusercontent.com/aida/AEtjO1X6oJ4ACXAVlPDN9o1BlL3Y2QdLN2edWtzKaZxLzcPEaBpd36fVEJ4oADSHwrVyezM8dSyUQa56UPitqwftKOxBtBwVoibUFbC592IIKHk8ByOCNN31Ft4QUzPJqke7G0ZD4AxfAaySWaYA3Gdr4RUsjxH1P7FKOscixxSkqSY2vqhNgy8FxiihqeNaXDD67PlLgrxEggJz-AjYgpB2uINOcteLAPp8d5Iup5ZztwpLxkhAoVZrpxic5IcwVUfy5GOAAGngitQpBQs',
  size = 'md',
  align = 'right',
  className = '',
}: UserAvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-200/50 transition-all focus:outline-hidden group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          {avatarUrl && !imageError ? (
            <img
              src={avatarUrl}
              alt={name}
              onError={() => setImageError(true)}
              className={`${sizeClasses} rounded-full object-cover ring-2 ring-stone-200/80 group-hover:ring-[#122e20] transition-all`}
            />
          ) : (
            <div
              className={`${sizeClasses} rounded-full bg-[#122e20] text-white flex items-center justify-center font-bold ring-2 ring-stone-200/80`}
            >
              {initials}
            </div>
          )}
          {/* Online green indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        {/* User name on large displays */}
        <div className="hidden lg:flex flex-col items-start leading-none pr-1">
          <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-stone-800 group-hover:text-black">
            {name}
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
            {role.split(' ')[0]}
          </span>
        </div>

        <span className="material-symbols-outlined text-[16px] text-stone-400 group-hover:text-stone-700 transition-transform duration-200">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-72 rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/80 shadow-[0_16px_40px_rgba(28,25,23,0.12)] p-2 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {/* Profile Header */}
          <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200/50 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#122e20] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-stone-900 truncate">
                  {name}
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-emerald-700 font-medium">
                  {role}
                </span>
                <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Hanoi Node • 256-bit SSL</span>
                </span>
              </div>
            </div>
          </div>

          {/* Group 1: User Workspaces */}
          <div className="space-y-0.5 py-1 text-xs font-medium text-stone-700">
            <Link
              href="/dashboard/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-[#2563eb]">folder_special</span>
              <span>Dự Án Bản Vẽ CAD Của Tôi</span>
            </Link>

            <Link
              href="/dashboard/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-emerald-600">receipt_long</span>
              <span>Đơn Đặt In &amp; Hóa Đơn VAT</span>
            </Link>

            <Link
              href="/dashboard/brand-kit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-amber-600">palette</span>
              <span>Bộ Nhận Diện Brand Kit</span>
            </Link>

            <Link
              href="/dashboard/specs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-purple-600">architecture</span>
              <span>Quy Chuẩn FEFCO &amp; Caliper</span>
            </Link>
          </div>

          <div className="h-px bg-stone-200/60 my-1.5" />

          {/* Group 2: Quick Jump to 3D Studio & Admin */}
          <div className="space-y-0.5 py-1 text-xs font-medium text-stone-700">
            <Link
              href="/editor"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-stone-700">view_in_ar</span>
                <span>Vào 3D CAD Studio</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-100 text-stone-600">
                WebGL
              </span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors group"
            >
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-[#122e20]">shield_person</span>
                <span>Bảng Điều Khiển Admin</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800">
                13 Views
              </span>
            </Link>
          </div>

          <div className="h-px bg-stone-200/60 my-1.5" />

          {/* Group 3: Settings & Logout */}
          <div className="space-y-0.5 py-1 text-xs font-medium text-stone-700">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-stone-500">badge</span>
              <span>Hồ Sơ Nhà Sáng Tạo</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-100/80 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-stone-500">tune</span>
              <span>Cài Đặt Hệ Thống</span>
            </Link>

            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-rose-600">logout</span>
              <span>Đăng Xuất Tài Khoản</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
