"use client";

import React, { useRef, useState } from "react";
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

const POSE_COORDINATES: Record<MascotPose, { bgPos: string; label: string; badge: string; bgTone: string }> = {
  waving: { bgPos: "0% 0%", label: "Xin chào!", badge: "👋", bgTone: "" },
  thumbs_up: { bgPos: "50% 0%", label: "Bắt đầu nào!", badge: "👍", bgTone: "" },
  delivery: { bgPos: "100% 0%", label: "Xuất file in!", badge: "📦", bgTone: "" },
  celebration: { bgPos: "0% 50%", label: "Tuyệt vời!", badge: "🎉", bgTone: "" },
  presenting: { bgPos: "50% 50%", label: "Gợi ý mẫu hộp", badge: "✨", bgTone: "" },
  measuring: { bgPos: "100% 50%", label: "Chuẩn từng mm", badge: "📐", bgTone: "" },
  folding: { bgPos: "0% 100%", label: "Gập nếp phẳng", badge: "✂️", bgTone: "" },
  unboxing_pop: { bgPos: "50% 100%", label: "Mở quà 3D!", badge: "🎁", bgTone: "" },
  chilling: { bgPos: "100% 100%", label: "Đã lưu xong", badge: "☕", bgTone: "" },
};

export const GoiMascot: React.FC<GoiMascotProps> = ({
  pose = "waving",
  size = 72,
  className = "",
  showPhotoBadge = true,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBubble, setShowBubble] = useState(false);
  const info = POSE_COORDINATES[pose] || POSE_COORDINATES.waving;

  const handleClick = () => {
    if (!interactive || !containerRef.current) return;

    animate(containerRef.current, {
      scale: [
        { to: 1.22, duration: 150, ease: 'outSine' },
        { to: 0.92, duration: 150, ease: 'inOutSine' },
        { to: 1, duration: 400, ease: 'outElastic(1, .6)' }
      ],
      rotate: [
        { to: -8, duration: 150, ease: 'outSine' },
        { to: 4, duration: 150, ease: 'inOutSine' },
        { to: 0, duration: 400, ease: 'outElastic(1, .6)' }
      ]
    });

    setShowBubble(true);
    setTimeout(() => {
      setShowBubble(false);
    }, 3000);
  };

  const handlePointerEnter = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 1.08,
      translateY: -3,
      rotate: 2,
      duration: 350,
      ease: 'outQuad'
    });
  };

  const handlePointerLeave = () => {
    if (!interactive || !containerRef.current) return;
    animate(containerRef.current, {
      scale: 1,
      translateY: 0,
      rotate: 0,
      duration: 300,
      ease: 'outCubic'
    });
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none cursor-pointer ${className}`}>
      {/* Interactive Speech Bubble */}
      {showBubble && (
        <div className="absolute -top-12 whitespace-nowrap bg-white text-[#122e20] text-sm font-semibold px-4 py-2 rounded-2xl shadow-lg border border-[#e8ded0] animate-bounce z-50">
          {info.label}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-[#e8ded0] rotate-45"></div>
        </div>
      )}

      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        className="relative flex items-center justify-center transition-all"
        style={{ width: size, height: size }}
        title={`Gói AI Copilot: ${info.label}`}
      >
        {/* Transparent Mascot Image with mix-blend-multiply */}
        <div
          className="w-full h-full mix-blend-multiply transition-all duration-300"
          style={{
            backgroundImage: "url('/branding/mascot-stickers.jpg')",
            backgroundSize: "320% 320%",
            backgroundPosition: info.bgPos,
            backgroundRepeat: "no-repeat",
          }}
        />

        {showPhotoBadge && (
          <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-white shadow-sm border border-[#e8ded0] flex items-center justify-center text-xs transform scale-95 hover:scale-110 transition-transform">
            <span>{info.badge}</span>
          </div>
        )}
      </div>
    </div>
  );
};
