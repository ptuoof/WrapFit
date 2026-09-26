"use client";

import React from "react";
import { BoxDimensions } from "@wrapfit/shared";

interface DimensionControlsProps {
  dimensions: BoxDimensions;
  onChange: (dims: BoxDimensions) => void;
}

export const DimensionControls: React.FC<DimensionControlsProps> = ({ dimensions, onChange }) => {
  const updateDim = (key: keyof BoxDimensions, val: number) => {
    onChange({
      ...dimensions,
      [key]: Math.max(10, val)
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
      <h3 className="font-serif font-bold text-stone-900 text-base">Kích Thước Hộp (mm)</h3>

      {/* Length */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-600">
          <span>Chiều Dài (L)</span>
          <span className="font-mono font-bold text-stone-900">{dimensions.length} mm</span>
        </div>
        <input
          type="range"
          min="40"
          max="350"
          value={dimensions.length}
          onChange={(e) => updateDim("length", Number(e.target.value))}
          className="w-full accent-amber-700 cursor-pointer"
        />
      </div>

      {/* Width */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-600">
          <span>Chiều Rộng (W)</span>
          <span className="font-mono font-bold text-stone-900">{dimensions.width} mm</span>
        </div>
        <input
          type="range"
          min="30"
          max="250"
          value={dimensions.width}
          onChange={(e) => updateDim("width", Number(e.target.value))}
          className="w-full accent-amber-700 cursor-pointer"
        />
      </div>

      {/* Height */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-600">
          <span>Chiều Cao (H)</span>
          <span className="font-mono font-bold text-stone-900">{dimensions.height} mm</span>
        </div>
        <input
          type="range"
          min="20"
          max="200"
          value={dimensions.height}
          onChange={(e) => updateDim("height", Number(e.target.value))}
          className="w-full accent-amber-700 cursor-pointer"
        />
      </div>

      {/* Paper Thickness preset */}
      <div className="pt-2 border-t border-stone-100">
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Định Lượng Giấy (GSM)</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { gsm: 250, t: 0.30, label: "250 GSM" },
            { gsm: 300, t: 0.38, label: "300 GSM" },
            { gsm: 350, t: 0.45, label: "350 GSM" },
          ].map((item) => (
            <button
              key={item.gsm}
              type="button"
              onClick={() => updateDim("paperThickness", item.t)}
              className={`py-1.5 text-xs rounded-lg font-medium border transition ${
                Math.abs(dimensions.paperThickness - item.t) < 0.02
                  ? "bg-amber-100 border-amber-500 text-amber-900"
                  : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
