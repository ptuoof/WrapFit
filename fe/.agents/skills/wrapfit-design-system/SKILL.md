---
name: wrapfit-design-system
description: >-
  Enforces WrapFit packaging design system tokens, typography, luxury craft styling, and anti-AI-slop UI guidelines. Use when creating or refining UI/UX components, CSS, Tailwind styles, or packaging visual editors.
---

# WrapFit Packaging Design System & Heuristic Review

This skill guides the agent in crafting high-craft, tactile, and intentional user interfaces for the WrapFit platform, adhering to the principles of `open-design` and `impeccable`.

## 1. Design Tokens & Palette

### Material Colors (Tactile & Organic):
```css
:root {
  /* Surface & Papers */
  --color-paper-ivory: #FDFBF7;
  --color-paper-kraft: #E3CBB2;
  --color-paper-cardboard: #C8A882;
  
  /* Brand Accents */
  --color-brand-forest: #1A362B;
  --color-brand-sage: #52796F;
  --color-brand-gold: #D4AF37;
  --color-brand-terracotta: #BC6C25;

  /* Ink & Contrast */
  --color-ink-primary: #1F2421;
  --color-ink-muted: #6B705C;
  --color-ink-subtle: #A5A58D;

  /* Dieline Technical Layers */
  --color-dieline-cut: #E53E3E;     /* 100% Magenta in CMYK */
  --color-dieline-crease: #3182CE;  /* 100% Cyan in CMYK */
  --color-dieline-bleed: #38A169;   /* Safe green boundary */
}
```

## 2. Anti-AI-Slop & Craftsmanship Rules

1. **Avoid Generic Rounded Rectangles**:
   - Use crisp, precise borders (`border border-stone-200`) or subtle double borders reminiscent of vintage packaging boxes.
2. **Tactile Elevation**:
   - Replace heavy dropshadows (`shadow-2xl`) with soft ambient occlusions: `box-shadow: 0 4px 20px -2px rgba(31, 36, 33, 0.08)`.
3. **Typography Harmony**:
   - Headings: `font-serif tracking-tight text-stone-900` (e.g., Playfair Display or Cormorant Garamond).
   - Labels & Parameters: `font-mono text-xs uppercase tracking-wider text-stone-500` (for dimensions $L, W, H$).
   - Body & Controls: `font-sans text-stone-700` (DM Sans or Plus Jakarta Sans).

## 3. Heuristic Critique Checkpoints

Before finalizing any frontend view, review against these criteria:
- **Clarity of Dimension Entry**: Is it obvious whether inputs are in `mm` or `cm`?
- **Hierarchy of Actions**: Is the primary CTA ("FitCheck™ kiểm tra" or "Xuất file in PDF") distinctly prioritized over secondary tools?
- **Touch Targets**: Are all toolbar icons and canvas handles at least $44 \times 44\text{px}$?
- **Color Contrast**: Does all text meet WCAG AA (minimum $4.5:1$ ratio against paper backgrounds)?
