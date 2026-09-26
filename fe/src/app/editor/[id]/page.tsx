"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Eye, Layers, Wand2 } from "lucide-react";
import {
  BoxDimensions,
  generateTuckTopDieline,
  runFitCheck,
  CanvasElement,
  exportDielineToSVG
} from "@wrapfit/shared";
import { DielineCanvas2D } from "@/components/canvas/DielineCanvas2D";
import { FoldingBox3D } from "@/components/three/FoldingBox3D";
import { DimensionControls } from "@/components/ui/DimensionControls";
import { FitCheckDrawer } from "@/components/fitcheck/FitCheckDrawer";

export default function PackagingStudioPage({ params }: { params: { id: string } }) {
  // Dimensions state in mm
  const [dimensions, setDimensions] = useState<BoxDimensions>({
    length: 120,
    width: 80,
    height: 60,
    paperThickness: 0.38 // 300 GSM
  });

  const [activeTab, setActiveTab] = useState<"2d" | "3d">("2d");
  const [foldProgress, setFoldProgress] = useState<number>(0.75);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Mock sample design elements placed on box
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: "logo_1",
      type: "logo",
      panelId: "panel_front",
      x: 10,
      y: 12,
      width: 40,
      height: 25,
      rotation: 0,
      content: "Tiệm Nến Thơm Chill",
      dpi: 300
    }
  ]);

  // Pure mathematical recalculation whenever dimensions change
  const dieline = useMemo(() => {
    return generateTuckTopDieline(dimensions);
  }, [dimensions]);

  // Real-time FitCheck constraint audit
  const fitcheckReport = useMemo(() => {
    return runFitCheck(elements, dieline);
  }, [elements, dieline]);

  // Export handler
  const handleExport = () => {
    const svgData = exportDielineToSVG(dieline);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wrapfit_${dimensions.length}x${dimensions.width}x${dimensions.height}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Studio Navbar */}
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-stone-900 font-serif">Studio Thiết Kế Bao Bì</h1>
            <p className="text-xs text-stone-500">Mẫu: Hộp nắp gài đáy khóa (Tuck Top)</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab("2d")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "2d" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Bản Vẽ 2D Phẳng</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("3d")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "3d" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Mô Phỏng Gập 3D</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Xuất File Bế (SVG / PDF)</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left/Center Canvas Viewport (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeTab === "2d" ? (
            <div className="space-y-3">
              <DielineCanvas2D dieline={dieline} scale={zoomScale} />
              <div className="flex items-center justify-between text-xs text-stone-500 px-2">
                <span>Khổ giấy yêu cầu: {dieline.totalBoundingBox.width} x {dieline.totalBoundingBox.height} mm</span>
                <div className="flex items-center gap-2">
                  <span>Thu phóng:</span>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.05"
                    value={zoomScale}
                    onChange={(e) => setZoomScale(Number(e.target.value))}
                    className="w-24 accent-stone-700"
                  />
                  <span>{Math.round(zoomScale * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FoldingBox3D dimensions={dimensions} foldProgress={foldProgress} />
              <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-4 text-xs">
                <span className="font-medium text-stone-700">Kéo để gập hộp:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={foldProgress}
                  onChange={(e) => setFoldProgress(Number(e.target.value))}
                  className="flex-1 accent-amber-700 cursor-pointer"
                />
                <span className="font-mono font-bold text-stone-900">{Math.round(foldProgress * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Parameters & FitCheck Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <DimensionControls dimensions={dimensions} onChange={setDimensions} />
          <FitCheckDrawer report={fitcheckReport} />
        </div>
      </div>
    </div>
  );
}
