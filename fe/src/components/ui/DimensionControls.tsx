"use client";

import React from "react";
import { BoxDimensions } from "@wrapfit/shared";
import { Sliders, Ruler, Sparkles } from "lucide-react";
import { tactileAudio } from "@/lib/audio/tactileAudio";

interface DimensionControlsProps {
  dimensions: BoxDimensions;
  onChange: (dims: BoxDimensions) => void;
  className?: string;
}

export const DimensionControls: React.FC<DimensionControlsProps> = ({
  dimensions,
  onChange,
  className = "",
}) => {
  const updateDim = (key: keyof BoxDimensions, val: number) => {
    tactileAudio.playPaperSlide(val / 300);
    onChange({
      ...dimensions,
      [key]: Math.max(10, Number(val) || 10),
    });
  };

  const handleGsmChange = (gsm: number, t: number) => {
    tactileAudio.playSquishyTap();
    onChange({
      ...dimensions,
      paperThickness: t,
    });
  };

  return (
    <div
      className={`bg-white rounded-squircle-lg border border-stone-200 p-5 space-y-4 shadow-tactile font-sans ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-vibrant-cobalt" />
          <h3 className="font-serif font-bold text-stone-900 text-base">
            Kích Thước Khối (mm)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
          Dung sai ±0.5mm
        </span>
      </div>

      {/* Length (L) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
          <span>Chiều Dài (Length - L)</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="30"
              max="400"
              value={dimensions.length}
              onChange={(e) => updateDim("length", Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-brand-forest bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-vibrant-cobalt"
            />
            <span className="text-[10px] text-stone-400 font-mono">mm</span>
          </div>
        </div>
        <input
          type="range"
          min="30"
          max="350"
          value={dimensions.length}
          onChange={(e) => updateDim("length", Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Width (W) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
          <span>Chiều Rộng (Width - W)</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="20"
              max="300"
              value={dimensions.width}
              onChange={(e) => updateDim("width", Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-brand-forest bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-vibrant-cobalt"
            />
            <span className="text-[10px] text-stone-400 font-mono">mm</span>
          </div>
        </div>
        <input
          type="range"
          min="20"
          max="260"
          value={dimensions.width}
          onChange={(e) => updateDim("width", Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Height / Depth (H) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
          <span>Chiều Cao (Height - H)</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="15"
              max="250"
              value={dimensions.height}
              onChange={(e) => updateDim("height", Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-right font-mono font-bold text-brand-forest bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-vibrant-cobalt"
            />
            <span className="text-[10px] text-stone-400 font-mono">mm</span>
          </div>
        </div>
        <input
          type="range"
          min="15"
          max="200"
          value={dimensions.height}
          onChange={(e) => updateDim("height", Number(e.target.value))}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Paper GSM & Thickness preset */}
      <div className="pt-3 border-t border-stone-100 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-stone-700">
          <span>Định Lượng Giấy & Độ Dày ($t$)</span>
          <span className="font-mono text-[11px] text-stone-500">
            t = {dimensions.paperThickness.toFixed(2)} mm
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { gsm: 250, t: 0.3, label: "250 GSM", desc: "Hộp mỏng" },
            { gsm: 300, t: 0.38, label: "300 GSM", desc: "Chuẩn quà" },
            { gsm: 350, t: 0.45, label: "350 GSM", desc: "Cứng cáp" },
          ].map((item) => {
            const isSelected = Math.abs(dimensions.paperThickness - item.t) < 0.03;
            return (
              <button
                key={item.gsm}
                type="button"
                onClick={() => handleGsmChange(item.gsm, item.t)}
                className={`py-2 px-1 text-center rounded-squircle transition border flex flex-col items-center ${
                  isSelected
                    ? "bg-brand-forest text-white border-brand-forest shadow-sm"
                    : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                }`}
              >
                <span className="text-xs font-bold font-mono">{item.label}</span>
                <span className={`text-[9px] ${isSelected ? "text-stone-200" : "text-stone-400"}`}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
