/**
 * Pretext Text Layout Integration for WrapFit Packaging
 * Performs zero-DOM-reflow canvas text measurement, line wrapping,
 * shrink-wrap bounding box calculation, and Safe Margin checking.
 */

import { prepareWithSegments, layoutWithLines, LayoutLine } from "@chenglou/pretext";

export interface PretextMeasuredText {
  lines: Array<{ text: string; width: number }>;
  totalWidth: number;
  totalHeight: number;
  lineCount: number;
  isOutOfBounds: boolean;
  minMarginDistanceMm: number;
}

/**
 * Measures text using @chenglou/pretext without DOM reflow.
 * Converts mm <-> px based on standard 3.78 px/mm canvas scale.
 */
export function measurePackagingText(
  text: string,
  options: {
    fontFamily?: string;
    fontSizePx?: number;
    lineHeightPx?: number;
    maxPanelWidthMm: number;
    maxPanelHeightMm: number;
    elementXMm: number;
    elementYMm: number;
    safeMarginMm?: number;
  }
): PretextMeasuredText {
  if (!text || !text.trim()) {
    return {
      lines: [],
      totalWidth: 0,
      totalHeight: 0,
      lineCount: 0,
      isOutOfBounds: false,
      minMarginDistanceMm: 10,
    };
  }

  const {
    fontFamily = "Playfair Display, serif",
    fontSizePx = 14,
    lineHeightPx = 18,
    maxPanelWidthMm,
    maxPanelHeightMm,
    elementXMm,
    elementYMm,
    safeMarginMm = 3.0,
  } = options;

  const fontDescriptor = `${fontSizePx}px ${fontFamily}`;
  const pxPerMm = 3.78; // 96 DPI / 25.4 mm
  const maxAvailableWidthPx = Math.max(50, (maxPanelWidthMm - 2 * safeMarginMm) * pxPerMm);

  try {
    // 1. Pretext Segmentation & Arithmetic Layout
    const prepared = prepareWithSegments(text, fontDescriptor);
    const layout = layoutWithLines(prepared, maxAvailableWidthPx, lineHeightPx);

    const lines = layout.lines.map((l: LayoutLine) => ({
      text: l.text,
      width: l.width / pxPerMm, // convert back to mm
    }));

    const totalWidthMm = Math.max(...lines.map((l) => l.width), 10);
    const totalHeightMm = layout.height / pxPerMm;

    // 2. Safe Margin Physical Checking (>= 3mm from crease/cut)
    const marginDistLeft = elementXMm;
    const marginDistTop = elementYMm;
    const marginDistRight = maxPanelWidthMm - (elementXMm + totalWidthMm);
    const marginDistBottom = maxPanelHeightMm - (elementYMm + totalHeightMm);

    const minMargin = Math.min(
      marginDistLeft,
      marginDistTop,
      marginDistRight,
      marginDistBottom
    );

    const isOutOfBounds = minMargin < safeMarginMm;

    return {
      lines,
      totalWidth: totalWidthMm,
      totalHeight: totalHeightMm,
      lineCount: layout.lineCount,
      isOutOfBounds,
      minMarginDistanceMm: Number(minMargin.toFixed(1)),
    };
  } catch (err) {
    // Fallback if canvas context is missing (SSR or headless)
    const roughCharWidthMm = (fontSizePx * 0.55) / pxPerMm;
    const estimatedWidth = Math.min(text.length * roughCharWidthMm, maxPanelWidthMm * 0.8);
    return {
      lines: [{ text, width: estimatedWidth }],
      totalWidth: estimatedWidth,
      totalHeight: lineHeightPx / pxPerMm,
      lineCount: 1,
      isOutOfBounds: false,
      minMarginDistanceMm: 5.0,
    };
  }
}
