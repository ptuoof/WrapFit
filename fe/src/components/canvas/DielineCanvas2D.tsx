"use client";

import React from "react";
import { DielineGeometry } from "@wrapfit/shared";

interface DielineCanvas2DProps {
  dieline: DielineGeometry;
  scale?: number;
}

export const DielineCanvas2D: React.FC<DielineCanvas2DProps> = ({ dieline, scale = 1.0 }) => {
  const { width: totalW, height: totalH } = dieline.totalBoundingBox;
  const padding = 30; // 30mm visual margin
  const viewBoxW = totalW + (2 * padding);
  const viewBoxH = totalH + (2 * padding);

  return (
    <div className="relative w-full h-[550px] bg-paper-ivory rounded-2xl border border-stone-200 overflow-hidden flex items-center justify-center p-4 shadow-inner">
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        className="w-full h-full max-h-full transition-all duration-300"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Layer 1: Background paper boundary */}
        <rect
          x={padding}
          y={padding}
          width={totalW}
          height={totalH}
          fill="#FAF4EC"
          stroke="#E8DCB8"
          strokeWidth="0.5"
          rx="2"
        />

        {/* Layer 2: Panel bounds & labels */}
        {dieline.panels.map((panel) => (
          <g key={panel.id}>
            <rect
              x={panel.bounds.x + padding}
              y={panel.bounds.y + padding}
              width={panel.bounds.width}
              height={panel.bounds.height}
              fill="rgba(255, 255, 255, 0.4)"
              stroke="#CBD5E1"
              strokeWidth="0.3"
            />
            <text
              x={panel.bounds.x + padding + 4}
              y={panel.bounds.y + padding + 12}
              fontSize="6"
              fontFamily="sans-serif"
              fill="#64748B"
              fontWeight="500"
            >
              {panel.name}
            </text>
            <text
              x={panel.bounds.x + padding + 4}
              y={panel.bounds.y + padding + 20}
              fontSize="4.5"
              fontFamily="monospace"
              fill="#94A3B8"
            >
              {panel.bounds.width}x{panel.bounds.height}mm
            </text>
          </g>
        ))}

        {/* Layer 3: Crease & Cut Lines */}
        {dieline.segments.map((seg) => {
          const x1 = seg.start.x + padding;
          const y1 = seg.start.y + padding;
          const x2 = seg.end.x + padding;
          const y2 = seg.end.y + padding;

          if (seg.pathString) {
            return (
              <path
                key={seg.id}
                d={seg.pathString}
                className={seg.type === "cut" ? "dieline-cut" : "dieline-crease"}
                fill="none"
              />
            );
          }

          return (
            <line
              key={seg.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={seg.type === "cut" ? "dieline-cut" : "dieline-crease"}
            />
          );
        })}
      </svg>

      {/* Dieline Legend Overlay */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] flex gap-4 text-stone-600 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#E53E3E]" />
          <span>Nét cắt dao (Cut)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-[#3182CE]" />
          <span>Nếp cấn gấp (Crease)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dotted border-[#38A169]" />
          <span>Vùng tràn lề (Bleed)</span>
        </div>
      </div>
    </div>
  );
};
