---
name: scroll-storytelling
description: >-
  Designs and builds immersive scroll-driven 3D landing pages and product reveal experiences. Use when building marketing pages, hero sections, pitching presentations, or scroll-triggered product unboxing animations.
---

# Scroll Storytelling & 3D Hero Experience Skill

This skill teaches the agent how to build high-converting, scroll-linked storytelling experiences using `GSAP ScrollTrigger` and `Three.js` (inspired by `scroll-world`).

## 1. The 4-Phase Storytelling Architecture

For the WrapFit pitching landing page, organize the scroll timeline into 4 stages:

```text
Scroll 0% -> 25%: [The Generic Frustration]
- Camera focuses on an oversized, generic cardboard box filled with plastic packing peanuts.
- Headline: "Món quà là thứ mang đậm dấu ấn cá nhân. Tại sao bao bì lại rập khuôn công nghiệp?"

Scroll 25% -> 50%: [The Gift & Measurement]
- The generic box disappears. The gift (e.g. handmade scented candle / perfume) appears floating.
- Laser measurement lines scan the gift's dimensions (L x W x H).

Scroll 50% -> 75%: [The Precision Wrap]
- Flat Kraft paper folds up seamlessly around the gift with zero wasted space.
- Subtle texture, custom shop logo, and personalized greeting appear on the lid.

Scroll 75% -> 100%: [The Present Moment]
- The box closes neatly with a soft click.
- Ribbons tie, camera sweeps into an artistic 45° Hero view.
- Headline: "Make Every Present, Present." + CTA "Thử nghiệm tạo hộp ngay".
```

## 2. GSAP ScrollTrigger Integration Pattern

```typescript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHeroScrollStory(canvasContainer: HTMLElement, boxTimeline: gsap.core.Timeline) {
  ScrollTrigger.create({
    trigger: canvasContainer,
    start: "top top",
    end: "+=3000",
    pin: true,
    scrub: 1.0, // Smooth interpolation lag
    animation: boxTimeline,
    onUpdate: (self) => {
      // Optional: adjust lighting intensity or camera FOV along scroll
    }
  });
}
```

## 3. Performance Best Practices

1. **Avoid Layout Thrashing**: Never animate CSS `top`, `left`, `width`, or `height`. Animate only `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.
2. **Device Pixel Ratio (DPR) Clamping**: When rendering Three.js canvas in hero sections, always clamp `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to prevent mobile GPU throttling.
3. **Passive Scroll Listeners**: Ensure GSAP ScrollTrigger operates with passive touch events on mobile browsers.
