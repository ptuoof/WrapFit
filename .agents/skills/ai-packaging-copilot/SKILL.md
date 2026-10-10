---
name: ai-packaging-copilot
description: >-
  Architects and orchestrates the intelligent AI Packaging Copilot ("Gói" / BeBoxy) for WrapFit.
  Manages contextual state machine, floating dynamic island UI, packaging recommendation heuristics,
  and proactive FitCheck™ error remediation.
---

# AI Packaging Copilot ("Gói" / BeBoxy) Skill

This skill teaches the agent how to build, orchestrate, and style the conversational AI Assistant for WrapFit, transforming the brand mascot into an intelligent, proactive packaging copilot.

---

## 1. Copilot Architecture & Dynamic Island System

The AI Assistant is not a generic chatbot box. It is designed as a **Floating Dynamic Island** anchored at the viewport corner (or docked into the bottom navigation on mobile).

### Component State Model:
```typescript
export type CopilotMode = 'idle' | 'listening' | 'analyzing' | 'warning' | 'suggesting' | 'celebrating';

export interface CopilotState {
  mode: CopilotMode;
  mascotPose: 'waving' | 'thumbs_up' | 'measuring' | 'folding' | 'presenting' | 'delivery' | 'celebration' | 'unboxing_pop' | 'chilling';
  headline: string;
  speechText: string;
  suggestionChips: Array<{
    id: string;
    label: string;
    actionType: 'APPLY_DIMENSIONS' | 'AUTO_FIX_FITCHECK' | 'GENERATE_PATTERN' | 'SWITCH_TEMPLATE';
    payload?: any;
  }>;
  isExpanded: boolean;
}
```

---

## 2. Gift-to-Packaging Dimension Heuristics

When the user queries the copilot with a gift item name or category, the copilot maps it to physical packaging dimensions $(L, W, H)$ in mm with recommended paper thickness (GSM) and clearance tolerance ($+5\text{mm}$ to $+10\text{mm}$ inner clearance):

| Gift Item Category | Suggested $L \times W \times H$ (mm) | Recommended Structure | Optimal Paper GSM |
| :--- | :--- | :--- | :--- |
| **Hũ nến thơm (Scented Candle 200g)** | $85 \times 85 \times 105$ | Tuck Top Box (Khóa đáy) | 350 GSM Ivory |
| **Son môi / Mỹ phẩm nhỏ (Lipstick / Serum)**| $25 \times 25 \times 85$ | Tuck Top Box | 300 GSM Kraft |
| **Chai nước hoa (Perfume Bottle 50ml)** | $65 \times 40 \times 120$ | Sleeve & Drawer (Hộp bao diêm) | 350 GSM Ivory / Duplex |
| **Đồng hồ / Vòng tay (Jewelry / Watch)** | $100 \times 100 \times 60$ | Lid & Base Box (Hộp âm dương) | 300 GSM Rigid Greyboard |
| **Khăn lụa / Cà vạt (Silk Scarf / Tie)** | $160 \times 110 \times 35$ | Pillow Box (Hộp gối) | 250 GSM Kraft |

---

## 3. Proactive FitCheck™ Watchdog Rules

The copilot continuously observes the design state without blocking user interaction:

1. **Crease Overlap Warning**:
   - If distance to crease is $< 3.0\text{mm}$, set `mascotPose: 'measuring'` and pop chip: `[1-Click: Thụt lề an toàn +3mm]`.
2. **Low DPI Detection**:
   - If uploaded raster image is $< 200\text{ DPI}$, set `mascotPose: 'analyzing'` and suggest: `[Khuyên dùng vector SVG hoặc ảnh nét hơn]`.
3. **Glue Tab Contamination**:
   - If artwork overlaps the glue flap (Mép dán), alert: `[Xóa nền khỏi vùng dán keo để tránh bung hộp]`.

---

## 4. Anime.js Spring Motion Integration

```typescript
import anime from 'animejs';

export function animateCopilotExpand(islandEl: HTMLElement, speechBubbleEl: HTMLElement) {
  anime.timeline()
    .add({
      targets: islandEl,
      scale: [0.92, 1],
      borderRadius: ['24px', '28px'],
      duration: 350,
      easing: 'spring(1, 80, 10, 0)'
    })
    .add({
      targets: speechBubbleEl,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 250,
      easing: 'easeOutCubic'
    }, '-=150');
}
```
