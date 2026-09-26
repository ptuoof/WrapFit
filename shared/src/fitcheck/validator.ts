/**
 * FitCheck™ Validation Engine
 * Owned by IT 2 (Production Physics)
 */

import { CanvasElement } from "../types/project";
import { DielineGeometry } from "../types/dieline";
import { FitCheckReport, FitCheckViolation } from "../types/fitcheck";

export function runFitCheck(elements: CanvasElement[], dieline: DielineGeometry): FitCheckReport {
  const violations: FitCheckViolation[] = [];

  for (const el of elements) {
    // 1. Safe Margin Check (Must be >= 3.0mm from crease and cut lines)
    const targetPanel = dieline.panels.find(p => p.id === el.panelId);
    if (targetPanel) {
      const marginX = el.x;
      const marginY = el.y;
      const marginRight = targetPanel.bounds.width - (el.x + el.width);
      const marginBottom = targetPanel.bounds.height - (el.y + el.height);

      const minMargin = Math.min(marginX, marginY, marginRight, marginBottom);

      if (minMargin < 3.0) {
        violations.push({
          id: `margin_${el.id}`,
          code: "CREASE_OVERLAP",
          severity: minMargin < 1.0 ? "error" : "warning",
          elementId: el.id,
          panelId: el.panelId,
          title: "Khoảng cách an toàn không đạt chuẩn",
          message: `Phần tử "${el.content.slice(0, 15)}..." chỉ cách mép/nếp gấp ${minMargin.toFixed(1)}mm.`,
          suggestion: "Dịch chuyển phần tử vào bên trong tối thiểu 3.0mm để tránh bị đứt nét hoặc gãy hình khi gập hộp.",
          currentValue: minMargin,
          expectedValue: 3.0
        });
      }
    }

    // 2. Low DPI Check for Uploaded Images
    if (el.type === "image" && el.dpi && el.dpi < 200) {
      violations.push({
        id: `dpi_${el.id}`,
        code: "LOW_DPI",
        severity: "warning",
        elementId: el.id,
        panelId: el.panelId,
        title: "Độ phân giải hình ảnh thấp",
        message: `Hình ảnh có độ phân giải ${el.dpi} DPI, có thể bị mờ nhòe khi in công nghiệp.`,
        suggestion: "Sử dụng ảnh có độ phân giải từ 200 đến 300 DPI để chất lượng in sắc nét nhất.",
        currentValue: el.dpi,
        expectedValue: 300
      });
    }
  }

  const errorCount = violations.filter(v => v.severity === "error").length;
  const warningCount = violations.filter(v => v.severity === "warning").length;

  const score = Math.max(0, 100 - (errorCount * 30) - (warningCount * 10));

  return {
    isValidForProduction: errorCount === 0,
    score,
    violations,
    auditedAt: new Date().toISOString()
  };
}
