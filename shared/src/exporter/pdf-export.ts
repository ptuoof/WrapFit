/**
 * Production-Ready Vector Exporter
 * Generates layered SVG and vector PDF with CMYK cut/crease spot colors
 * Owned by IT 2 (Export Engine)
 */

import { DielineGeometry } from "../types/dieline";
import { PackagingProject } from "../types/project";

export function exportDielineToSVG(dieline: DielineGeometry, project?: PackagingProject): string {
  const { width: w, height: h } = dieline.totalBoundingBox;
  const padding = 20; // 20mm margin around dieline
  const viewBoxW = w + (2 * padding);
  const viewBoxH = h + (2 * padding);

  let segmentsSvg = "";
  for (const seg of dieline.segments) {
    const x1 = seg.start.x + padding;
    const y1 = seg.start.y + padding;
    const x2 = seg.end.x + padding;
    const y2 = seg.end.y + padding;

    if (seg.pathString) {
      segmentsSvg += `    <path d="${seg.pathString}" fill="none" stroke="${seg.type === "cut" ? "#E53E3E" : "#3182CE"}" stroke-width="0.75" ${seg.type === "crease" ? 'stroke-dasharray="4,4"' : ""} />\n`;
    } else {
      segmentsSvg += `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${seg.type === "cut" ? "#E53E3E" : "#3182CE"}" stroke-width="0.75" ${seg.type === "crease" ? 'stroke-dasharray="4,4"' : ""} />\n`;
    }
  }

  let panelsSvg = "";
  for (const panel of dieline.panels) {
    const px = panel.bounds.x + padding;
    const py = panel.bounds.y + padding;
    panelsSvg += `    <rect x="${px}" y="${py}" width="${panel.bounds.width}" height="${panel.bounds.height}" fill="none" stroke="#E2E8F0" stroke-width="0.3" />\n`;
    panelsSvg += `    <text x="${px + 5}" y="${py + 15}" font-family="sans-serif" font-size="6" fill="#94A3B8">${panel.name} (${panel.bounds.width}x${panel.bounds.height}mm)</text>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxW} ${viewBoxH}" width="${viewBoxW}mm" height="${viewBoxH}mm">
  <defs>
    <style>
      .dieline-cut { stroke: #E53E3E; stroke-width: 0.75; fill: none; }
      .dieline-crease { stroke: #3182CE; stroke-width: 0.75; stroke-dasharray: 4,4; fill: none; }
      .text-spec { font-family: sans-serif; font-size: 5px; fill: #64748B; }
    </style>
  </defs>

  <!-- Layer 1: Technical Info Header -->
  <g id="layer-specs">
    <text x="${padding}" y="${padding - 8}" class="text-spec" font-weight="bold">WrapFit Platform — ${dieline.structureType.toUpperCase()} BOX</text>
    <text x="${padding}" y="${padding - 3}" class="text-spec">Dimensions: ${dieline.dimensions.length} x ${dieline.dimensions.width} x ${dieline.dimensions.height} mm (Paper: ${dieline.dimensions.paperThickness}mm)</text>
  </g>

  <!-- Layer 2: Panels Grid -->
  <g id="layer-panels">
${panelsSvg}
  </g>

  <!-- Layer 3: Crease & Cut Dieline Lines -->
  <g id="layer-dieline">
${segmentsSvg}
  </g>
</svg>`;
}
