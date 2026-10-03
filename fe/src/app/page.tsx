"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Layers,
  ShieldCheck,
  Wand2,
  Box,
  Sliders,
  CheckCircle,
  Eye,
  RotateCcw,
  Palette,
  ChevronRight,
  FileCheck2,
  PackageOpen,
  Volume2,
} from "lucide-react";
import { animate } from "animejs";
import { animateFoldProgress, animateStaggerEntrance } from "@/lib/animation/animeUtils";
import { InteractiveFoldingBox3D, BoxMaterialTheme } from "@/components/three/InteractiveFoldingBox3D";
import { AiCopilotAssistant, POPULAR_GIFT_PRESETS, GiftPreset } from "@/components/ai/AiCopilotAssistant";
import { BlueprintIntro } from "@/components/intro/BlueprintIntro";
import { GoiMascot } from "@/components/mascot/GoiMascot";
import { tactileAudio } from "@/lib/audio/tactileAudio";
import { BoxDimensions } from "@wrapfit/shared";

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<BoxDimensions>({
    length: 120,
    width: 80,
    height: 60,
    paperThickness: 0.38,
  });
  const [foldProgress, setFoldProgress] = useState<number>(0.85);
  const [activeTheme, setActiveTheme] = useState<BoxMaterialTheme>("ivory");
  const [activePattern, setActivePattern] = useState<string | null>("tet");
  const [selectedGiftId, setSelectedGiftId] = useState<string>("tea");

  // Check intro seen on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("wrapfit_intro_seen");
      if (!seen) {
        setShowIntro(true);
      }
    }
  }, []);

  // Smoothly morph box dimensions using Anime.js
  const handleApplyGift = (preset: GiftPreset) => {
    tactileAudio.playCreaseSnap();
    setSelectedGiftId(preset.id);

    const animObj = {
      l: dimensions.length,
      w: dimensions.width,
      h: dimensions.height,
    };

    animate(animObj, {
      l: preset.dimensions.length,
      w: preset.dimensions.width,
      h: preset.dimensions.height,
      duration: 600,
      ease: "outCubic",
      onUpdate: () => {
        setDimensions({
          length: Math.round(animObj.l),
          width: Math.round(animObj.w),
          height: Math.round(animObj.h),
          paperThickness: preset.dimensions.paperThickness,
        });
      },
    });
  };

  const handleFoldChange = (val: number) => {
    setFoldProgress(val);
    tactileAudio.playPaperSlide(val);
  };

  // Smooth Anime.js fold slider transition for quick preset clicks
  const handleFoldPreset = (targetVal: number) => {
    tactileAudio.playPaperTuck();
    animateFoldProgress({
      from: foldProgress,
      to: targetVal,
      duration: 700,
      onUpdate: (v) => setFoldProgress(v),
    });
  };

  const handleThemeChange = (t: BoxMaterialTheme) => {
    tactileAudio.playSquishyTap();
    setActiveTheme(t);
  };

  return (
    <>
      {/* CAD Blueprint to 3D Origami Intro */}
      {showIntro && (
        <BlueprintIntro
          onComplete={() => {
            setShowIntro(false);
          }}
        />
      )}

      <div className="min-h-screen bg-paper-grain flex flex-col font-sans selection:bg-brand-gold/30 selection:text-brand-forest">
        {/* Top Luxury Navbar */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200/80 transition-all">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Brand Logo with Real Illustrated Cartoon Asset */}
            <Link
              href="/"
              onClick={() => tactileAudio.playSquishyTap()}
              className="flex items-center gap-3 group"
            >
              <img
                src="/branding/wrapfit-logo.png"
                alt="WrapFit Logo"
                className="h-11 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-brand-forest leading-none">
                  WrapFit
                </span>
                <span className="text-[10px] font-sans font-semibold tracking-wider text-vibrant-cobalt bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200/60 mt-1 w-fit">
                  Packaging Intelligence
                </span>
              </div>
            </Link>

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
              <a
                href="#stage"
                className="hover:text-brand-forest transition flex items-center gap-1.5"
              >
                <span>Sân Khấu 3D</span>
              </a>
              <a
                href="#how-it-works"
                className="hover:text-brand-forest transition flex items-center gap-1.5"
              >
                <span>Quy Trình 3 Bước</span>
              </a>
              <a
                href="#structures"
                className="hover:text-brand-forest transition flex items-center gap-1.5"
              >
                <span>4 Mẫu Hộp Chuẩn</span>
              </a>
              <a
                href="#fitcheck"
                className="hover:text-brand-forest transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-vibrant-coral" />
                <span>FitCheck™ An Toàn In</span>
              </a>
              <Link
                href="/dashboard"
                onClick={() => tactileAudio.playSquishyTap()}
                className="hover:text-brand-forest transition"
              >
                Dự Án
              </Link>
            </nav>

            {/* Right Action CTA */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  tactileAudio.playSquishyTap();
                  setShowIntro(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-squircle text-xs font-semibold text-stone-600 hover:text-brand-forest hover:bg-stone-100 transition border border-stone-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xem Intro CAD</span>
              </button>

              <Link
                href="/editor/demo"
                onClick={() => tactileAudio.playSquishyTap()}
                className="px-5 py-2.5 rounded-squircle-md bg-vibrant-cobalt hover:bg-vibrant-cobalt-dark text-white text-xs font-bold tracking-wide transition shadow-cobalt-glow flex items-center gap-2 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Mở Studio Pacdora</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Pitch Narrative (6 Cols) */}
              <div className="lg:col-span-6 space-y-5 text-left">
                {/* Mascot Welcome Speech Bubble (Cute Cartoon iOS Style) */}
                <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-white shadow-tactile-lg">
                  <GoiMascot pose="waving" size={68} />
                  <div className="space-y-0.5 text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-brand-forest font-serif">
                        Bé Gói AI Copilot
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vibrant-coral/10 text-vibrant-coral">
                        Chào bạn! 🎁
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      &quot;Mình đã tính sẵn kích thước chuẩn xưởng in cho các món quà bên dưới. Bạn thích đựng quà gì nào?&quot;
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3EDE2] border border-[#E2D5C3] text-brand-forest text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-vibrant-coral animate-ping" />
                  <span>EXE101 — Nền Tảng Đóng Gói Quà Tặng Đột Phá</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-forest leading-[1.12] tracking-tight">
                  Make Every Present,{" "}
                  <span className="italic font-normal text-brand-terracotta underline decoration-brand-gold/60 decoration-wavy decoration-2">
                    Present.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-xl">
                  Thiết kế chiếc hộp ôm trọn món quà của bạn. Từ kích thước vật lý $(L, W, H)$, hệ thống tự động sinh bản vẽ bế 2D, mô phỏng gập 3D trực quan và kiểm định an toàn in ấn FitCheck™ đạt 100% dung sai xưởng in.
                </p>

                {/* Quick Gift Trigger Pills with Emojis */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                    Gợi ý kích thước nhanh cho món quà của bạn:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { preset: POPULAR_GIFT_PRESETS[0], emoji: "🕯️" },
                      { preset: POPULAR_GIFT_PRESETS[1], emoji: "💄" },
                      { preset: POPULAR_GIFT_PRESETS[2], emoji: "🌸" },
                      { preset: POPULAR_GIFT_PRESETS[3], emoji: "💍" },
                      { preset: POPULAR_GIFT_PRESETS[4], emoji: "🧣" },
                      { preset: POPULAR_GIFT_PRESETS[5], emoji: "🍵" },
                    ].map(({ preset, emoji }) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyGift(preset)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition border flex items-center gap-1.5 shadow-sm ${
                          selectedGiftId === preset.id
                            ? "bg-brand-forest text-white border-brand-forest shadow-tactile scale-105"
                            : "bg-white/90 text-stone-700 border-stone-200 hover:border-brand-forest hover:bg-stone-50"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="font-semibold">{preset.name.split("(")[0]}</span>
                        <span className="font-mono text-[10px] opacity-75">
                          {preset.dimensions.length}x{preset.dimensions.width}mm
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    href="/editor/demo"
                    onClick={() => tactileAudio.playSquishyTap()}
                    className="px-7 py-3.5 rounded-squircle-md bg-brand-forest hover:bg-brand-forest-dark text-white text-sm font-semibold tracking-wide transition shadow-tactile flex items-center gap-2.5 group"
                  >
                    <span>Bắt Đầu Tạo Hộp Ngay</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#structures"
                    onClick={() => tactileAudio.playSquishyTap()}
                    className="px-6 py-3.5 rounded-squircle-md bg-white border border-stone-200 text-stone-800 text-sm font-semibold hover:bg-stone-50 transition shadow-tactile-inner"
                  >
                    Khám Phá 4 Mẫu Hộp
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 flex items-center gap-6 text-xs text-stone-500 border-t border-stone-200/80">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-brand-forest" />
                    <span>100% Khả thi dao bế</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-vibrant-coral" />
                    <span>FitCheck™ Bảo vệ tràn lề</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-brand-gold" />
                    <span>Xuất PDF vector CMYK</span>
                  </div>
                </div>
              </div>

              {/* Right 3D Interactive Stage (6 Cols) */}
              <div id="stage" className="lg:col-span-6 space-y-4">
                <div className="relative w-full h-[460px] sm:h-[500px]">
                  <InteractiveFoldingBox3D
                    dimensions={dimensions}
                    foldProgress={foldProgress}
                    theme={activeTheme}
                    backgroundPatternSvg={activePattern}
                    customLogoText="WrapFit Signature"
                  />
                </div>

                {/* Dual-Mode Controls: Progress Slider + Material Themes */}
                <div className="bg-white p-5 rounded-3xl border-2 border-white shadow-tactile-lg space-y-4">
                  {/* Fold Progress Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-forest">
                      <div className="flex items-center gap-2">
                        <GoiMascot pose="folding" size={36} />
                        <span>Kéo Để Gập Mở Mô Hình 3D (Dual-Mode):</span>
                      </div>
                      <span className="font-mono text-vibrant-cobalt font-bold text-sm bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {Math.round(foldProgress * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={foldProgress}
                      onChange={(e) => handleFoldChange(Number(e.target.value))}
                      className="w-full cursor-pointer accent-vibrant-cobalt"
                    />

                    <div className="flex justify-between items-center text-[11px] font-mono gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleFoldPreset(0)}
                        className={`px-3 py-1 rounded-full border transition font-medium flex items-center gap-1 shadow-sm ${
                          foldProgress === 0
                            ? "bg-vibrant-cobalt text-white border-vibrant-cobalt shadow-cobalt-glow scale-105"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                        title="Mở phẳng bản bế 2D"
                      >
                        <span>📄 0% Phẳng 2D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFoldPreset(0.5)}
                        className={`px-3 py-1 rounded-full border transition font-medium flex items-center gap-1 shadow-sm ${
                          Math.abs(foldProgress - 0.5) < 0.05
                            ? "bg-vibrant-cobalt text-white border-vibrant-cobalt shadow-cobalt-glow scale-105"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                        title="Dựng các vách góc 90 độ"
                      >
                        <span>📦 50% Dựng vách</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFoldPreset(1.0)}
                        className={`px-3 py-1 rounded-full border transition font-medium flex items-center gap-1 shadow-sm ${
                          foldProgress >= 0.98
                            ? "bg-vibrant-cobalt text-white border-vibrant-cobalt shadow-cobalt-glow scale-105"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                        title="Đóng nắp khóa hoàn chỉnh"
                      >
                        <span>🎁 100% Đóng kín</span>
                      </button>
                    </div>
                  </div>

                  {/* Material Selector Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                    <span className="text-xs font-medium text-stone-600 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Chất liệu giấy:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {[
                        { id: "ivory", label: "Ivory", bg: "bg-[#FAF6EE] text-stone-800" },
                        { id: "kraft", label: "Kraft Linen", bg: "bg-[#E8D8C8] text-amber-900" },
                        { id: "forest", label: "Xanh Rừng", bg: "bg-[#1A362B] text-white" },
                        { id: "gold_foil", label: "Ép Kim Vàng", bg: "bg-[#D4AF37] text-amber-950 font-bold" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleThemeChange(item.id as BoxMaterialTheme)}
                          className={`px-3 py-1 rounded-full text-xs transition border ${item.bg} ${
                            activeTheme === item.id
                              ? "ring-2 ring-vibrant-cobalt shadow-sm scale-105"
                              : "opacity-80 hover:opacity-100 border-stone-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pattern Selector Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                    <span className="text-xs font-medium text-stone-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Hoa văn AI:</span>
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: "tet", label: "🌸 Mai Tết" },
                        { id: "xmas", label: "❄️ Noel" },
                        { id: "botanical", label: "🌿 Botanical" },
                        { id: "luxury_gold", label: "✨ Kim Vàng" },
                        { id: null, label: "Trơn" },
                      ].map((item) => (
                        <button
                          key={String(item.id)}
                          type="button"
                          onClick={() => {
                            tactileAudio.playSquishyTap();
                            setActivePattern(item.id);
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs transition border ${
                            activePattern === item.id
                              ? "bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-sm scale-105"
                              : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section: 3 Bước Chuẩn Xưởng In Cùng Bé Gói */}
        <section id="how-it-works" className="py-16 bg-[#FAF6EE] border-t border-[#E8D8C8]">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                Quy Trình Bao Bì Cá Nhân Hóa
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest">
                3 Bước Tạo Hộp Quà Hoàn Mỹ Cùng Bé Gói
              </h2>
              <p className="text-sm text-stone-600">
                Không cần biết vẽ CAD hay phần mềm đồ họa phức tạp. Bé Gói sẽ tự động hóa từ A đến Z!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  pose: "measuring" as const,
                  title: "Nhập Kích Thước Quà",
                  sub: "Dài × Rộng × Cao (mm)",
                  desc: "Chỉ cần đo món quà hoặc chọn các gợi ý nến thơm, son môi, nước hoa. Hệ thống tính bù trừ nếp gập 0.38mm.",
                  badge: "Chuẩn xác từng mm",
                },
                {
                  step: "02",
                  pose: "folding" as const,
                  title: "Sinh Bản Bế 2D & Gập 3D",
                  sub: "Tự động tạo tọa độ dao bế",
                  desc: "Mọi tai gài, rãnh khóa và nắp đậy tự động sinh theo tỷ lệ vàng. Kéo trượt gập mở 3D trực quan như cầm trên tay.",
                  badge: "Mô phỏng 3D Origami",
                },
                {
                  step: "03",
                  pose: "delivery" as const,
                  title: "FitCheck™ & Xuất In",
                  sub: "100% Khả thi sản xuất",
                  desc: "Watchdog quét tràn lề bleed 2mm, an toàn text 3mm và xuất ngay file PDF Vector CMYK 300 DPI xưởng in nhận ngay.",
                  badge: "Xuất file chuẩn xưởng",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="bg-white rounded-3xl p-6 border-2 border-white shadow-tactile hover:shadow-tactile-lg transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-brand-forest/10 text-brand-forest">
                        BƯỚC {s.step}
                      </span>
                      <GoiMascot pose={s.pose} size={54} />
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900">
                        {s.title}
                      </h3>
                      <span className="text-xs font-mono text-vibrant-cobalt font-semibold">
                        {s.sub}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-brand-forest">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span>{s.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Box Structures Showcase */}
        <section id="structures" className="py-20 bg-stone-50 border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-gold">
                Cấu Trúc Đạt Chuẩn Công Nghiệp
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest">
                4 Dòng Hộp Quà Chuẩn Quốc Tế
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Mỗi cấu trúc hộp được tính toán tự động các góc vát, tai gài, rãnh cấn khóa theo dung sai độ dày giấy $(t)$ để đảm bảo sản xuất không lỗi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: "tuck-top",
                  name: "Hộp Nắp Gài Đáy Khóa",
                  eng: "Tuck Top Box",
                  desc: "Mẫu hộp bán lẻ & quà tặng thịnh hành nhất. Đáy khóa chịu tải trọng tốt mà không cần dán keo đáy.",
                  ideal: "Nến thơm, mỹ phẩm, trà bánh",
                  paper: "300 - 350 GSM Ivory / Kraft",
                  tag: "Phổ biến nhất",
                  tagColor: "bg-vibrant-cobalt/10 text-vibrant-cobalt",
                  pose: "presenting" as const,
                },
                {
                  id: "sleeve-drawer",
                  name: "Hộp Bao Diêm",
                  eng: "Sleeve & Drawer Box",
                  desc: "Cấu trúc vỏ bao ngoài và khay trượt bên trong. Trải nghiệm rút khay mượt mà, đầy bất ngờ.",
                  ideal: "Nước hoa, son môi, macaron",
                  paper: "350 GSM Duplex / Carton",
                  tag: "Sang trọng",
                  tagColor: "bg-brand-gold/15 text-amber-800",
                  pose: "unboxing_pop" as const,
                },
                {
                  id: "lid-base",
                  name: "Hộp Âm Dương",
                  eng: "Lid & Base Box",
                  desc: "Cấu trúc 2 mảnh nắp và thân tách rời. Cứng cáp, cao cấp bậc nhất cho các bộ sưu tập kỷ niệm.",
                  ideal: "Đồng hồ, vòng tay, trang sức",
                  paper: "Carton lạnh bồi giấy mỹ thuật",
                  tag: "Cao cấp",
                  tagColor: "bg-brand-forest/10 text-brand-forest",
                  pose: "celebration" as const,
                },
                {
                  id: "pillow",
                  name: "Hộp Gối Xếp",
                  eng: "Pillow Box",
                  desc: "Thiết kế đường cong cánh cung độc đáo. Gấp mở nhanh gọn không cần băng dính hay ghim bấm.",
                  ideal: "Khăn lụa, cà vạt, quà cảm ơn",
                  paper: "250 - 300 GSM Kraft mộc",
                  tag: "Tiện lợi",
                  tagColor: "bg-stone-200 text-stone-800",
                  pose: "thumbs_up" as const,
                },
              ].map((box) => (
                <div
                  key={box.id}
                  className="bg-white rounded-3xl p-6 border-2 border-white shadow-tactile hover:shadow-tactile-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${box.tagColor}`}>
                        {box.tag}
                      </span>
                      <GoiMascot pose={box.pose} size={46} />
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-brand-forest transition-colors">
                        {box.name}
                      </h3>
                      <p className="text-xs font-mono text-stone-400">{box.eng}</p>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {box.desc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Ứng dụng:</span>
                        <span className="font-medium text-stone-700">{box.ideal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Định lượng:</span>
                        <span className="font-medium text-stone-700">{box.paper}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/editor/new?type=${box.id}`}
                    onClick={() => tactileAudio.playSquishyTap()}
                    className="mt-6 w-full py-2.5 px-4 rounded-full bg-stone-100 hover:bg-brand-forest hover:text-white text-stone-800 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Thiết Kế Mẫu Này</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Pattern Engine Showcase */}
        <section className="py-20 bg-gradient-to-b from-[#FAF6EE] to-white border-t border-[#E8D8C8]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin" />
                  <span>AI Pattern Generator — Sinh Hoa Văn Liền Mạch</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest">
                  Hoa Văn Độc Bản Chỉ Trong 1 Phút
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Tự động sinh hoa văn vector lặp liền mạch (seamless repeat) theo từng dịp lễ và phong cách thương hiệu. Phủ tràn lề tự động, sẵn sàng in ấn chất lượng cao.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white p-3.5 rounded-3xl border-2 border-white shadow-tactile">
                <GoiMascot pose="celebration" size={54} />
                <div className="text-left text-xs">
                  <span className="font-bold text-brand-forest block">
                    Bé Gói Sinh Mẫu Nhanh
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Hoa văn tự động đồng bộ sang mô hình 3D!
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: "tet",
                  name: "Hoa Mai & Tết Cổ Truyền",
                  desc: "Sắc đỏ son & vàng kim mang lại may mắn, thịnh vượng.",
                  color: "from-red-500 to-amber-500",
                  bgTone: "bg-red-50/60 border-red-200",
                  tag: "Dịp Tết 2026",
                },
                {
                  id: "xmas",
                  name: "Giáng Sinh & Tuyết Trắng",
                  desc: "Họa tiết cành thông, chuông vàng và quả thông tuyết.",
                  color: "from-emerald-600 to-red-600",
                  bgTone: "bg-emerald-50/60 border-emerald-200",
                  tag: "Lễ Hội Đông",
                },
                {
                  id: "botanical",
                  name: "Lá Nhiệt Đới Botanical",
                  desc: "Tối giản, trang nhã cho nến thơm, mỹ phẩm hữu cơ.",
                  color: "from-green-700 to-teal-700",
                  bgTone: "bg-teal-50/60 border-teal-200",
                  tag: "Eco Minimalist",
                },
                {
                  id: "luxury_gold",
                  name: "Họa Tiết Hình Học Ép Kim",
                  desc: "Đường kẻ vàng vương giả dành cho trang sức, nước hoa.",
                  color: "from-amber-600 to-yellow-500",
                  bgTone: "bg-amber-50/60 border-amber-200",
                  tag: "Luxury Gold",
                },
              ].map((pat) => (
                <div
                  key={pat.id}
                  className={`p-6 rounded-3xl border-2 ${pat.bgTone} shadow-tactile space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200 uppercase tracking-wider">
                      {pat.tag}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {pat.name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {pat.desc}
                    </p>
                  </div>

                  <Link
                    href={`/editor/demo?pattern=${pat.id}`}
                    onClick={() => tactileAudio.playSquishyTap()}
                    className="w-full py-2 px-3 rounded-full bg-white hover:bg-brand-forest hover:text-white text-stone-800 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 shadow-sm border border-stone-200"
                  >
                    <span>Áp Dụng Vào Hộp</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FitCheck™ Interactive Rules Section */}
        <section id="fitcheck" className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibrant-coral/10 text-vibrant-coral text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FitCheck™ Engine — Độc Quyền Tại WrapFit</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-forest">
                  4 Quy Tắc An Toàn In Ấn Triệt Tiêu 100% Rủi Ro
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Tại sao các xưởng in thường từ chối file từ Canva thông thường? Vì thiếu tính toán nếp gập và mép dao. FitCheck™ tự động quét từng pixel và đường bế trước khi in.
                </p>
              </div>

              {/* Mascot Watchdog Greeting Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-amber-50/80 border-2 border-amber-200/70 shadow-tactile max-w-md text-left">
                <GoiMascot pose="measuring" size={64} />
                <div className="space-y-0.5">
                  <span className="font-serif font-bold text-xs text-amber-900 block">
                    Bé Gói FitCheck™ Watchdog:
                  </span>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    &quot;Mình kiểm tra từng đường gấp và mép cắt để hộp in ra không bao giờ bị rách mép hay nứt chữ!&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  rule: "Vùng An Toàn Nếp Gấp",
                  threshold: "≥ 3.0 mm",
                  sub: "Safe Margin Area",
                  color: "border-amber-300 bg-amber-50/50",
                  badge: "text-amber-700 bg-amber-100",
                  desc: "Chữ và logo phải cách xa nếp cấn ít nhất 3mm để không bị nứt vỡ chữ khi gấp hộp.",
                },
                {
                  rule: "Vùng Tràn Lề Dao Cắt",
                  threshold: "≥ 2.0 mm",
                  sub: "Bleed Boundary",
                  color: "border-green-300 bg-green-50/50",
                  badge: "text-green-700 bg-green-100",
                  desc: "Nền hoa văn phải vượt ra ngoài nét cắt dao ít nhất 2mm để tránh viền trắng khi máy xén xê dịch.",
                },
                {
                  rule: "Kiểm Định Độ Phân Giải",
                  threshold: "≥ 200 DPI",
                  sub: "Raster Resolution",
                  color: "border-blue-300 bg-blue-50/50",
                  badge: "text-blue-700 bg-blue-100",
                  desc: "Tự động cảnh báo ảnh tải lên mờ nhòe. Khuyên dùng vector SVG sắc nét cho bản in hoàn hảo.",
                },
                {
                  rule: "Vùng Trống Dán Keo",
                  threshold: "100% Sạch Mực",
                  sub: "Glue Flap Clearance",
                  color: "border-red-300 bg-red-50/50",
                  badge: "text-red-700 bg-red-100",
                  desc: "Mép dán keo phải tuyệt đối không phủ mực in hoặc cán màng để keo dính kết dính chặt chẽ.",
                },
              ].map((r, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border-2 ${r.color} shadow-tactile space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-400">
                        0{idx + 1}
                      </span>
                      <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${r.badge}`}>
                        {r.threshold}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {r.rule}
                      </h4>
                      <span className="text-[11px] font-mono text-stone-500">{r.sub}</span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-forest pt-3 border-t border-black/5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span>Tự động quét & sửa trong 0.1s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-brand-forest text-paper-ivory py-16 px-6 border-t border-brand-forest-dark mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/branding/wrapfit-logo.png"
                  alt="WrapFit Logo"
                  className="h-10 w-auto object-contain bg-white/90 p-1 rounded-2xl shadow-md"
                />
                <span className="font-serif text-2xl font-bold tracking-tight text-white">
                  WrapFit Platform
                </span>
              </div>
              <p className="text-xs text-stone-300 max-w-md leading-relaxed">
                Nền tảng cá nhân hóa bao bì quà tặng thông minh — Môn học EXE101 Khởi Nghiệp Trải Nghiệm, Trường Đại Học FPT.
              </p>
              <p className="text-xs font-serif italic text-brand-gold">
                &quot;Make Every Present, Present.&quot;
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-gold block">
                Truy Cập Nhanh
              </span>
              <ul className="space-y-2 text-xs text-stone-300">
                <li>
                  <Link href="/editor/demo" className="hover:text-white transition">
                    Studio Pacdora 2D/3D
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition">
                    Quản Lý Dự Án Bento
                  </Link>
                </li>
                <li>
                  <a href="#structures" className="hover:text-white transition">
                    Thư Viện Mẫu Hộp Chuẩn
                  </a>
                </li>
                <li>
                  <a href="#fitcheck" className="hover:text-white transition">
                    Tiêu Chuẩn FitCheck™
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-gold block">
                Công Nghệ Cốt Lõi
              </span>
              <ul className="space-y-2 text-xs text-stone-300">
                <li>Bản bế tham số SVG / PDF Kit</li>
                <li>Mô phỏng gập Three.js WebGL</li>
                <li>Trợ lý AI Gói (Anime.js)</li>
                <li>Âm thanh xúc giác Web Audio API</li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
            <span>© 2026 WrapFit Team — FPT University EXE101. All rights reserved.</span>
            <span>Chất lượng in ấn chuẩn hóa theo ISO 12647-2</span>
          </div>
        </footer>

        {/* Floating AI Packaging Copilot "Gói" */}
        <AiCopilotAssistant
          currentDimensions={dimensions}
          onApplyDimensions={(dims) => {
            setDimensions(dims);
          }}
        />
      </div>
    </>
  );
}
