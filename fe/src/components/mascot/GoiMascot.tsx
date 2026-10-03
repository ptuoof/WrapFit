"use client";

import React, { useRef } from "react";
import { animate } from "animejs";

export type MascotPose =
  | "waving"
  | "thumbs_up"
  | "measuring"
  | "folding"
  | "presenting"
  | "delivery"
  | "celebration"
  | "unboxing_pop"
  | "chilling";

interface GoiMascotProps {
  pose?: MascotPose;
  size?: number; // size in px
  className?: string;
  showPhotoBadge?: boolean;
  interactive?: boolean;
}

// Map each of the 9 poses to its exact position in the 3x3 illustrated sticker sheet
const POSE_COORDINATES: Record<MascotPose, { bgPos: string; label: string; badge: string; bgTone: string }> = {
  waving: {
    bgPos: "0% 0%",
    label: "Xin chào!",
    badge: "👋",
    bgTone: "from-[#EBF5FF] to-[#D5EAFF]",
  },
  thumbs_up: {
    bgPos: "50% 0%",
    label: "Bắt đầu nào!",
    badge: "👍",
    bgTone: "from-[#FFF5EB] to-[#FFE3C7]",
  },
  delivery: {
    bgPos: "100% 0%",
    label: "Xuất file in!",
    badge: "📦",
    bgTone: "from-[#F0FDF4] to-[#DCFCE7]",
  },
  celebration: {
    bgPos: "0% 50%",
    label: "Tuyệt vời!",
    badge: "🎉",
    bgTone: "from-[#FFF1F2] to-[#FFE4E6]",
  },
  presenting: {
    bgPos: "50% 50%",
    label: "Gợi ý mẫu hộp",
    badge: "✨",
    bgTone: "from-[#FAF5FF] to-[#F3E8FF]",
  },
  measuring: {
    bgPos: "100% 50%",
    label: "Chuẩn từng mm",
    badge: "📐",
    bgTone: "from-[#FFFBEB] to-[#FEF3C7]",
  },
  folding: {
    bgPos: "0% 100%",
    label: "Gập nếp phẳng",
    badge: "✂️",
    bgTone: "from-[#F0FDF4] to-[#DCFCE7]",
  },
  unboxing_pop: {
    bgPos: "50% 100%",
    label: "Mở quà 3D!",
    badge: "🎁",
    bgTone: "from-[#EFF6FF] to-[#DBEAFE]",
  },
  chilling: {
    bgPos: "100% 100%",
    label: "Đã lưu xong",
    badge: "☕",
    bgTone: "from-[#F5F5F4] to-[#E7E5E4]",
  },
};

export const GoiMascot: React.FC<GoiMascotProps> = ({
  pose = "waving",
  size = 72,
  className = "",
  showPhotoBadge = true,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const info = POSE_COORDINATES[pose] || POSE_COORDINATES.waving;

  const handlePointerEnter = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 1.08,
      translateY: -3,
      rotate: [-1, 2],
      duration: 350,
      ease: "spring(1, 80, 10, 0)",
    });
  };

  const handlePointerLeave = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 1,
      translateY: 0,
      rotate: 0,
      duration: 300,
      ease: "outCubic",
    });
  };

  const handlePointerDown = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 0.92,
      duration: 120,
      ease: "outQuad",
    });
  };

  const handlePointerUp = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 1.08,
      duration: 250,
      ease: "spring(1, 80, 10, 0)",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      title={`Gói AI Copilot: ${info.label}`}
    >
      {/* Outer iOS Squircle Sticker Badge with Glossy 3D Border */}
      <div
        className={`relative w-full h-full rounded-[28%] bg-gradient-to-b ${info.bgTone} p-[3px] shadow-[0_8px_20px_-3px_rgba(30,86,160,0.18)] border-2 border-white flex items-center justify-center overflow-hidden transition-all`}
      >
        {/* Real Illustrated Cartoon Mascot Sticker from Sprite Sheet */}
        <div
          className="w-full h-full rounded-[24%] transition-all duration-300"
          style={{
            backgroundImage: "url('/branding/mascot-stickers.jpg')",
            backgroundSize: "320% 320%",
            backgroundPosition: info.bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Glossy Top Glass Glare highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-[24%] pointer-events-none" />

        {/* Mini Emotion Tag Badge */}
        {showPhotoBadge && (
          <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] border-[1.5px] border-white flex items-center justify-center text-xs transform scale-95 group-hover:scale-110 transition-transform">
            <span>{info.badge}</span>
          </div>
        )}
      </div>
    </div>
  );
};
