---
name: fitcheck-validator
description: >-
  Validates packaging dielines, print constraints, and physical box integrity. Use when checking bleed margins, crease line safe areas, glue flap tolerances, paper thickness (GSM) clearance, or generating CMYK vector export layers.
---

# FitCheck™ Packaging Validation Skill

This skill enforces the core physical validation logic for WrapFit. Every design must pass these algorithmic checks before generating print-ready files.

## 1. Validation Rules & Thresholds

| Rule Name | Target Element | Threshold Constraint | Consequence of Failure |
| :--- | :--- | :--- | :--- |
| **Safe Margin Check** | Text, Logos, Barcodes | $\ge 3.0\text{ mm}$ from any cut or crease line | Elements get sliced off or cracked upon folding |
| **Bleed Coverage** | Background colors, patterns | $\ge 2.0\text{ mm}$ beyond outer knife cut line | White edge artifacts appear when the guillotine trimmer shifts |
| **Resolution Audit** | User uploaded raster images | $\ge 200\text{ DPI}$ (Ideal: $300\text{ DPI}$) | Blurry or pixelated print output |
| **Glue Flap Clearance** | Adhesive tabs (Mép dán) | Must remain $100\%$ free of heavy varnish/ink | Box glue fails to bond, opening unexpectedly |
| **Caliper Allowance** | Crease offsets ($t$) | $t = \text{GSM} \times 0.0014\text{ mm}$ | Panels buckle or warp if paper thickness is neglected |

## 2. FitCheck Audit Function Pattern

```typescript
export interface FitCheckResult {
  passed: boolean;
  warnings: Array<{
    code: "BLEED_INSUFFICIENT" | "CREASE_OVERLAP" | "LOW_DPI" | "GLUE_CONTAMINATED";
    message: string;
    nodeId?: string;
    severity: "error" | "warning";
  }>;
}

export function validateDieline(artworkElements: CanvasElement[], dielineLayers: DielineGeometry): FitCheckResult {
  const warnings = [];

  for (const el of artworkElements) {
    // 1. Safe Margin Check
    const distToCrease = dielineLayers.getDistanceToNearestCrease(el.boundingBox);
    if (distToCrease < 3.0) {
      warnings.push({
        code: "CREASE_OVERLAP",
        message: `Phần tử "${el.name || "Văn bản"}" chỉ cách nếp gấp ${distToCrease.toFixed(1)}mm (yêu cầu tối thiểu 3.0mm)`,
        nodeId: el.id,
        severity: "warning"
      });
    }

    // 2. DPI Check for Bitmaps
    if (el.type === "image" && el.dpi < 200) {
      warnings.push({
        code: "LOW_DPI",
        message: `Ảnh tải lên có độ phân giải thấp (${el.dpi} DPI). Khuyên dùng tối thiểu 200 DPI để tránh vỡ hạt khi in.`,
        nodeId: el.id,
        severity: "warning"
      });
    }
  }

  return {
    passed: warnings.filter(w => w.severity === "error").length === 0,
    warnings
  };
}
```

## 3. CMYK Vector Layer Separation (PDF Export)

Always export dieline PDFs with four separated spot color layers:
- `Layer 1 (Dieline Cut)`: Spot color `CutContour` (100% Magenta, 0.5pt stroke).
- `Layer 2 (Dieline Crease)`: Spot color `Crease` (100% Cyan, 0.5pt dashed stroke).
- `Layer 3 (Artwork CMYK)`: All background graphics, patterns, and typography.
- `Layer 4 (Dimension Specs)`: Non-printing technical dimension callouts in mm.
