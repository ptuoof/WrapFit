---
name: fluid-mobile-gestures
description: >-
  Provides iOS-grade touch ergonomics, swipeable bottom sheets, pinch-to-zoom 2D/3D navigation,
  and momentum inertia controls for mobile devices and smartphones.
---

# Fluid Mobile Gestures & iOS Touch Ergonomics Skill

This skill enforces strict mobile-first ergonomic rules so that WrapFit functions effortlessly on smartphones, tablets, and mobile browsers.

---

## 1. Ergonomic Thumb-Zone Architecture

On mobile devices ($< 1024\text{px}$), the user's thumb comfortably reaches only the bottom third of the screen.

### Hard Rules:
1. **No Critical CTAs at Screen Top**: Primary actions ("Tạo hộp mới", "Xuất file in", "Đổi kích thước mm") must sit within the Bottom Bar or Bottom Sheet.
2. **Minimum Touch Target**: Every interactive icon, button, and slider handle must have a tap area of at least **$48 \times 48\text{px}$**.
3. **Safe Area Insets**: Support iPhone notch and home indicator:
   ```css
   padding-bottom: max(16px, env(safe-area-inset-bottom));
   ```

---

## 2. Swipeable Bottom Sheet (iOS Style)

A pull-up drawer with physics-based spring dampening:

```typescript
import anime from 'animejs';

export class SwipeableSheetController {
  private sheetEl: HTMLElement;
  private startY = 0;
  private currentY = 0;
  private isOpen = false;

  constructor(sheetEl: HTMLElement) {
    this.sheetEl = sheetEl;
    this.bindEvents();
  }

  private bindEvents() {
    this.sheetEl.addEventListener('touchstart', (e) => {
      this.startY = e.touches[0].clientY;
    }, { passive: true });

    this.sheetEl.addEventListener('touchmove', (e) => {
      this.currentY = e.touches[0].clientY;
      const deltaY = Math.max(0, this.currentY - this.startY);
      if (this.isOpen) {
        this.sheetEl.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    this.sheetEl.addEventListener('touchend', () => {
      const deltaY = this.currentY - this.startY;
      if (deltaY > 120) {
        this.close();
      } else {
        this.open();
      }
    });
  }

  open() {
    this.isOpen = true;
    anime({
      targets: this.sheetEl,
      translateY: 0,
      duration: 380,
      easing: 'spring(1, 85, 12, 0)'
    });
  }

  close() {
    this.isOpen = false;
    anime({
      targets: this.sheetEl,
      translateY: '85%', // Thu gọn để lộ thanh pull handle và mascot
      duration: 320,
      easing: 'easeOutCubic'
    });
  }
}
```

---

## 3. Pinch-to-Zoom & Pan for 2D Dieline & 3D Stage

- **2D Canvas**: Multi-touch pinch adjusts Fabric.js canvas zoom scale, clamping between $0.5\times$ and $4.0\times$.
- **3D WebGL**: OrbitControls configured with `enableDamping={true}`, `dampingFactor={0.05}`, and touch gestures enabled for single-finger rotation and two-finger pinch zoom.
