"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Layers,
  FolderOpen,
  Sliders,
  MoreVertical,
  Download,
  Trash2,
  Copy,
  ChevronRight,
  Box,
} from "lucide-react";
import { GoiMascot } from "@/components/mascot/GoiMascot";
import { AiCopilotAssistant } from "@/components/ai/AiCopilotAssistant";
import { tactileAudio } from "@/lib/audio/tactileAudio";
import { apiClient } from "@/lib/apiClient";
import { materialThemeOf } from "@/lib/projectMaterial";

interface ProjectItem {
  id: string;
  title: string;
  boxType: "tuck-top" | "sleeve-drawer" | "lid-base" | "pillow";
  boxTypeName: string;
  dimensions: { length: number; width: number; height: number };
  paperGsm: string;
  fitCheckScore: number;
  updatedAt: string;
  thumbnailTheme: "ivory" | "kraft" | "forest" | "gold_foil";
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Hũ Nến Thơm Gỗ Thông & Quế",
    boxType: "tuck-top",
    boxTypeName: "Hộp nắp gài đáy khóa",
    dimensions: { length: 85, width: 85, height: 105 },
    paperGsm: "350 GSM Ivory",
    fitCheckScore: 100,
    updatedAt: "10 phút trước",
    thumbnailTheme: "ivory",
  },
  {
    id: "proj-2",
    title: "Nước Hoa Unisex L'Automne 50ml",
    boxType: "sleeve-drawer",
    boxTypeName: "Hộp bao diêm (Khay rút)",
    dimensions: { length: 65, width: 40, height: 120 },
    paperGsm: "350 GSM Duplex Cán Mờ",
    fitCheckScore: 98,
    updatedAt: "2 giờ trước",
    thumbnailTheme: "forest",
  },
  {
    id: "proj-3",
    title: "Bộ Trang Sức Vòng Tay Bạc Tinh Xảo",
    boxType: "lid-base",
    boxTypeName: "Hộp âm dương cao cấp",
    dimensions: { length: 100, width: 100, height: 60 },
    paperGsm: "Carton Lạnh Ép Kim Vàng",
    fitCheckScore: 100,
    updatedAt: "Hôm qua",
    thumbnailTheme: "gold_foil",
  },
  {
    id: "proj-4",
    title: "Khăn Lụa Tơ Tằm Bảo Lộc Dệt Tay",
    boxType: "pillow",
    boxTypeName: "Hộp gối cánh cung",
    dimensions: { length: 160, width: 110, height: 35 },
    paperGsm: "250 GSM Kraft Mộc",
    fitCheckScore: 86,
    updatedAt: "3 ngày trước",
    thumbnailTheme: "kraft",
  },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);

  // Fetch real projects from NestJS backend
  React.useEffect(() => {
    async function loadProjects() {
      try {
        const res = await apiClient.listProjects({ search: searchQuery });
        if (res && res.items && res.items.length > 0) {
          const mapped: ProjectItem[] = res.items.map((p, idx) => {
            // The API returns the structure as `template.id`; the offline demo data uses `templateId`.
            const structure = p.template?.id ?? p.templateId;
            return {
              id: p.id,
              title: p.title || "Dự Án Hộp Quà",
              boxType: (structure || "tuck-top") as any,
              boxTypeName:
                structure === "sleeve-drawer"
                  ? "Hộp bao diêm (Khay rút)"
                  : structure === "lid-base"
                  ? "Hộp âm dương"
                  : structure === "pillow"
                  ? "Hộp gối"
                  : "Hộp nắp gài đáy khóa",
              dimensions: p.dimensions || { length: 120, width: 80, height: 60 },
              paperGsm: `${p.materialSpec?.gsm || 300} GSM ${p.materialSpec?.type || "Ivory"}`,
              fitCheckScore: 100,
              updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("vi-VN") : "Hôm nay",
              thumbnailTheme: p.materialSpec
                ? materialThemeOf(null, p.materialSpec)
                : idx % 2 === 0
                ? "ivory"
                : "forest",
            };
          });
          setProjects(mapped);
        }
      } catch {
        // Keep initial mock
      }
    }
    loadProjects();
  }, [searchQuery]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.boxTypeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || p.boxType === filterType;
    return matchesSearch && matchesType;
  });

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    tactileAudio.playSquishyTap();
    try {
      await apiClient.deleteProject(id);
    } catch {
      // Ignored if local
    }
    setProjects((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-paper-grain flex flex-col font-sans">
      {/* Top Dashboard Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-18 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              onClick={() => tactileAudio.playSquishyTap()}
              className="flex items-center gap-3 group"
            >
              <img
                src="/branding/wrapfit-logo.png"
                alt="WrapFit Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <span className="font-serif text-xl font-bold tracking-tight text-brand-forest">
                WrapFit
              </span>
            </Link>
            <span className="hidden sm:inline-block text-stone-300">/</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-stone-600">
              Không Gian Sáng Tạo & Quản Lý Dự Án
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/editor/new"
              onClick={() => tactileAudio.playSquishyTap()}
              className="px-4 py-2 rounded-squircle-md bg-vibrant-cobalt hover:bg-vibrant-cobalt-dark text-white text-xs font-bold transition shadow-cobalt-glow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Hộp Quà Mới</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Top Hero Pill Search & Welcome Banner */}
        <div className="bg-gradient-to-r from-[#FAF6EE] via-[#F4EFE6] to-[#EAE0D2] rounded-squircle-xl p-6 sm:p-8 border border-[#E0D2C0] shadow-tactile relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D8C7B4] text-xs font-semibold text-brand-forest">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Canva-Style Packaging Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-forest leading-snug">
              Bắt đầu thiết kế chiếc hộp hoàn hảo cho món quà hôm nay
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Tạo bản vẽ bế 2D chính xác từng milimet, xem mô phỏng gập 3D trực tiếp và tự động kiểm định tiêu chuẩn in ấn FitCheck™.
            </p>
          </div>

          {/* Mascot Decorative Greeting */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-squircle-lg border border-[#D8C7B4] shadow-tactile z-10">
            <GoiMascot pose="waving" size={54} />
            <div className="text-left text-xs">
              <span className="font-bold text-brand-forest font-serif block">
                Gói đã sẵn sàng!
              </span>
              <span className="text-stone-500 text-[11px]">
                Cần gợi ý kích thước hộp? Bấm vào Gói góc phải nhé.
              </span>
            </div>
          </div>
        </div>

        {/* Pill Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Pill Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án, loại hộp, kích thước..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-stone-200 focus:outline-none focus:border-vibrant-cobalt text-xs text-stone-800 shadow-tactile placeholder-stone-400 transition"
            />
          </div>

          {/* Box Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Tất cả mẫu" },
              { id: "tuck-top", label: "Nắp Gài Đáy Khóa" },
              { id: "sleeve-drawer", label: "Hộp Bao Diêm" },
              { id: "lid-base", label: "Hộp Âm Dương" },
              { id: "pillow", label: "Hộp Gối" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  tactileAudio.playSquishyTap();
                  setFilterType(f.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                  filterType === f.id
                    ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Bento Item 1: Create New Quick Action Card */}
          <Link
            href="/editor/new"
            onClick={() => tactileAudio.playSquishyTap()}
            className="rounded-squircle-lg border-2 border-dashed border-stone-300 hover:border-vibrant-cobalt bg-white/60 hover:bg-white p-6 flex flex-col items-center justify-center text-center gap-3 transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-vibrant-cobalt/10 text-vibrant-cobalt flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif font-bold text-stone-900 group-hover:text-vibrant-cobalt transition-colors block text-base">
                Tạo Dự Án Hộp Mới
              </span>
              <span className="text-xs text-stone-500 block mt-1">
                Tự do nhập mm hoặc chọn từ 4 mẫu chuẩn
              </span>
            </div>
          </Link>

          {/* Bento Projects Cards */}
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-squircle-lg border border-stone-200 shadow-tactile hover:shadow-tactile-lg transition-all p-5 flex flex-col justify-between group overflow-hidden relative"
            >
              {/* Card Top: Thumbnail Color Strip + Box Type */}
              <div className="space-y-3">
                <div
                  className={`h-24 w-full rounded-squircle flex items-center justify-center p-3 relative overflow-hidden ${
                    proj.thumbnailTheme === "forest"
                      ? "bg-[#1A362B] text-brand-gold"
                      : proj.thumbnailTheme === "gold_foil"
                      ? "bg-gradient-to-br from-[#F5E7B2] to-[#D4AF37] text-stone-900"
                      : proj.thumbnailTheme === "kraft"
                      ? "bg-[#E8D8C8] text-amber-900"
                      : "bg-[#FAF6EE] text-stone-800"
                  }`}
                >
                  <Box className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-mono font-bold tracking-wider uppercase opacity-90">
                    {proj.dimensions.length}x{proj.dimensions.width}x{proj.dimensions.height} mm
                  </span>

                  {/* FitCheck Pill */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        proj.fitCheckScore === 100
                          ? "bg-green-100 text-green-800"
                          : "bg-vibrant-coral/15 text-vibrant-coral"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{proj.fitCheckScore}/100</span>
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-vibrant-cobalt transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs font-mono text-stone-400 mt-0.5">
                    {proj.boxTypeName}
                  </p>
                </div>

                <div className="text-xs text-stone-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Chất liệu:</span>
                    <span className="font-medium text-stone-700">{proj.paperGsm}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{proj.updatedAt}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                <Link
                  href={`/editor/${proj.id}`}
                  onClick={() => tactileAudio.playSquishyTap()}
                  className="px-3.5 py-1.5 rounded-squircle bg-stone-100 hover:bg-brand-forest hover:text-white text-stone-800 text-xs font-semibold transition flex items-center gap-1"
                >
                  <span>Chỉnh Sửa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={(e) => handleDeleteProject(proj.id, e)}
                  className="p-1.5 text-stone-400 hover:text-vibrant-coral hover:bg-red-50 rounded-lg transition"
                  title="Xóa dự án"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Bento Item AI Pattern Lab Card */}
          <div className="bg-gradient-to-br from-[#1A362B] to-[#10241C] text-white rounded-squircle-lg p-6 shadow-tactile flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>AI Pattern Studio</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-white">
                Sinh Hoa Văn Bao Bì Bằng AI
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Tự động tạo hoa văn ép kim, phong cách thực vật Botanical, hoặc vân đá cẩm thạch phủ liền mạch toàn bộ bản bế hộp.
              </p>
            </div>

            <Link
              href="/editor/demo?mode=pattern"
              onClick={() => tactileAudio.playSquishyTap()}
              className="w-full py-2.5 px-3 rounded-squircle bg-brand-gold hover:bg-brand-gold-light text-stone-900 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
            >
              <span>Thử Nghiệm Sinh Hoa Văn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Floating Copilot Assistant */}
      <AiCopilotAssistant />
    </div>
  );
}
