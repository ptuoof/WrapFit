/**
 * Production-Ready Layered Vector Exporter
 * Generates layered SVG and vector PDF with CMYK cut/crease spot colors
 * Standardized for industrial plotters (Zünd, Mimaki, Cricut) and pre-press RIP software
 */

import { DielineGeometry } from "../types/dieline";
import { PackagingProject, CanvasElement } from "../types/project";

export function exportDielineToSVG(
  dieline: DielineGeometry,
  elementsOrProject?: CanvasElement[] | PackagingProject,
  project?: PackagingProject
): string {
  let elements: CanvasElement[] = [];
  let proj: PackagingProject | undefined = project;

  if (Array.isArray(elementsOrProject)) {
    elements = elementsOrProject;
  } else if (elementsOrProject) {
    proj = elementsOrProject;
  }

  const { width: w, height: h } = dieline.totalBoundingBox;
  const padding = 25; // 25mm margin around dieline for title block and registration marks
  const viewBoxW = Math.round(w + 2 * padding);
  const viewBoxH = Math.round(h + 2 * padding);

  // Separate crease and cut lines
  let cutSvg = "";
  let creaseSvg = "";
  for (const seg of dieline.segments) {
    const x1 = (seg.start.x + padding).toFixed(2);
    const y1 = (seg.start.y + padding).toFixed(2);
    const x2 = (seg.end.x + padding).toFixed(2);
    const y2 = (seg.end.y + padding).toFixed(2);

    if (seg.type === "cut") {
      if (seg.pathString) {
        cutSvg += `    <path d="${seg.pathString}" class="dieline-cut" />\n`;
      } else {
        cutSvg += `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dieline-cut" />\n`;
      }
    } else {
      if (seg.pathString) {
        creaseSvg += `    <path d="${seg.pathString}" class="dieline-crease" />\n`;
      } else {
        creaseSvg += `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dieline-crease" />\n`;
      }
    }
  }

  // Panel Bounds & Safe Margins (3mm inset)
  let panelsSvg = "";
  let safeMarginsSvg = "";
  for (const panel of dieline.panels) {
    const px = panel.bounds.x + padding;
    const py = panel.bounds.y + padding;
    const pw = panel.bounds.width;
    const ph = panel.bounds.height;

    panelsSvg += `    <rect x="${px.toFixed(2)}" y="${py.toFixed(2)}" width="${pw.toFixed(2)}" height="${ph.toFixed(2)}" fill="none" stroke="#E2E8F0" stroke-width="0.3" />\n`;
    panelsSvg += `    <text x="${(px + 4).toFixed(2)}" y="${(py + 8).toFixed(2)}" class="text-panel">${panel.name}</text>\n`;
    panelsSvg += `    <text x="${(px + 4).toFixed(2)}" y="${(py + 13).toFixed(2)}" class="text-dim-spec">${pw}x${ph}mm</text>\n`;

    // 3mm Safe Margin boundary
    if (pw > 10 && ph > 10) {
      const sx = px + 3;
      const sy = py + 3;
      const sw = pw - 6;
      const sh = ph - 6;
      safeMarginsSvg += `    <rect x="${sx.toFixed(2)}" y="${sy.toFixed(2)}" width="${sw.toFixed(2)}" height="${sh.toFixed(2)}" class="dieline-safemargin" />\n`;
    }
  }

  // Placed Artwork Elements (Text & Logos)
  let artworkSvg = "";
  for (const el of elements) {
    const targetPanel = dieline.panels.find((p) => p.id === el.panelId);
    const panelOffset = targetPanel ? targetPanel.bounds : { x: 0, y: 0 };
    const elX = panelOffset.x + el.x + padding;
    const elY = panelOffset.y + el.y + padding;

    if (el.type === "text" || el.type === "logo") {
      const rot = el.rotation ? ` transform="rotate(${el.rotation}, ${elX}, ${elY})"` : "";
      artworkSvg += `    <text x="${elX.toFixed(2)}" y="${(elY + 8).toFixed(2)}" class="text-artwork"${rot}>${escapeXml(el.content)}</text>\n`;
    } else if (el.type === "image") {
      artworkSvg += `    <image x="${elX.toFixed(2)}" y="${elY.toFixed(2)}" width="${el.width}" height="${el.height}" href="${escapeXml(el.content)}" />\n`;
    }
  }

  // Registration Targets at 4 corners
  const regCrosshairs = [
    { x: padding / 2, y: padding / 2 },
    { x: viewBoxW - padding / 2, y: padding / 2 },
    { x: padding / 2, y: viewBoxH - padding / 2 },
    { x: viewBoxW - padding / 2, y: viewBoxH - padding / 2 },
  ]
    .map(
      (pos) => `    <g transform="translate(${pos.x}, ${pos.y})">
      <circle r="3.5" fill="none" stroke="#1C1917" stroke-width="0.3" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="#1C1917" stroke-width="0.3" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke="#1C1917" stroke-width="0.3" />
    </g>`
    )
    .join("\n");

  const now = new Date().toISOString().split("T")[0];
  const title = proj?.title || "WrapFit Custom Box";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  viewBox="0 0 ${viewBoxW} ${viewBoxH}"
  width="${viewBoxW}mm"
  height="${viewBoxH}mm"
>
  <defs>
    <style>
      .dieline-cut { stroke: #E53E3E; stroke-width: 0.75; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .dieline-crease { stroke: #3182CE; stroke-width: 0.75; stroke-dasharray: 4,4; fill: none; stroke-linecap: round; }
      .dieline-bleed { stroke: #38A169; stroke-width: 0.5; stroke-dasharray: 2,2; fill: none; }
      .dieline-safemargin { stroke: #ECC94B; stroke-width: 0.5; stroke-dasharray: 3,3; fill: none; }
      .text-title { font-family: 'Playfair Display', serif; font-size: 5.5px; font-weight: bold; fill: #1A362B; }
      .text-spec { font-family: 'JetBrains Mono', monospace; font-size: 3.2px; fill: #475569; }
      .text-panel { font-family: sans-serif; font-size: 3.5px; fill: #64748B; font-weight: 600; }
      .text-dim-spec { font-family: 'JetBrains Mono', monospace; font-size: 3px; fill: #94A3B8; }
      .text-artwork { font-family: 'Playfair Display', serif; font-size: 6px; fill: #1C1917; font-weight: bold; }
    </style>
  </defs>

  <!-- LAYER 1: BLEED BOUNDARY (+2mm) -->
  <g id="Bleed" inkscape:label="Bleed (2mm)" inkscape:groupmode="layer">
    <rect
      x="${(padding - 2).toFixed(2)}"
      y="${(padding - 2).toFixed(2)}"
      width="${(w + 4).toFixed(2)}"
      height="${(h + 4).toFixed(2)}"
      class="dieline-bleed"
    />
  </g>

  <!-- LAYER 2: SAFE MARGIN (3mm Inset) -->
  <g id="SafeMargin" inkscape:label="Safe Margin (3mm)" inkscape:groupmode="layer">
${safeMarginsSvg}
  </g>

  <!-- LAYER 3: PANELS REFERENCE -->
  <g id="Panels" inkscape:label="Panel References" inkscape:groupmode="layer">
${panelsSvg}
  </g>

  <!-- LAYER 4: ARTWORK & GRAPHICS -->
  <g id="Artwork" inkscape:label="Artwork" inkscape:groupmode="layer">
${artworkSvg}
  </g>

  <!-- LAYER 5: CREASE LINES (Score / Fold) -->
  <g id="Crease" inkscape:label="Crease" inkscape:groupmode="layer">
${creaseSvg}
  </g>

  <!-- LAYER 6: CUT CONTOUR (Perimeter Knife) -->
  <g id="CutContour" inkscape:label="CutContour" inkscape:groupmode="layer">
${cutSvg}
  </g>

  <!-- LAYER 7: DIMENSIONS & TECHNICAL TITLE BLOCK -->
  <g id="Dimensions" inkscape:label="Dimensions & Title Block" inkscape:groupmode="layer">
    <!-- Title Block Info -->
    <text x="${padding}" y="${(padding - 14).toFixed(2)}" class="text-title">WrapFit Platform — ${escapeXml(title)}</text>
    <text x="${padding}" y="${(padding - 9).toFixed(2)}" class="text-spec">Cấu trúc: ${dieline.structureType.toUpperCase()} | Kích thước: ${dieline.dimensions.length} x ${dieline.dimensions.width} x ${dieline.dimensions.height} mm (Độ dày: ${dieline.dimensions.paperThickness}mm - 300 GSM)</text>
    <text x="${padding}" y="${(padding - 4).toFixed(2)}" class="text-spec">Tỷ lệ: 1:1 mm | Ngày xuất: ${now} | Chuẩn màu: CMYK Spot (Cut=#E53E3E, Crease=#3182CE)</text>

    <!-- Registration Marks -->
${regCrosshairs}
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
