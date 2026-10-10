---
name: tactile-haptic-audio
description: >-
  Synthesizes procedural tactile audio and haptic feedback for packaging interactions using
  the Web Audio API. Generates paper creasing, folding snaps, unboxing swooshes,
  and squishy button clicks with zero external audio assets.
---

# Tactile Haptic Audio Synthesis Skill

This skill provides ultra-lightweight, zero-asset procedural sound effects and haptic feedback to elevate the tactile luxury feel of WrapFit.

---

## 1. Zero-Asset Sound Synthesis Engine (Web Audio API)

Avoid loading heavy `.mp3` or `.wav` files over the network. Synthesize realistic paper folding and button clicks directly in browser memory:

```typescript
class PackagingAudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Âm thanh cấn nếp giấy / gập góc 90° (Crisp Paper Crease Snap)
   */
  playCreaseSnap() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);

    // Haptic pulse trên thiết bị di động hỗ trợ
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  }

  /**
   * Âm thanh mở nắp hộp bật tung quà (Unboxing Pop / Confetti Whoosh)
   */
  playUnboxPop() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 30, 20]);
    }
  }

  /**
   * Âm thanh nhún lò xo Squishy khi chạm nút bấm
   */
  playSquishyTap() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const tactileAudio = new PackagingAudioEngine();
```

---

## 2. Interaction Integration Points

1. **Folding Box Hinges**: Kêu `playCreaseSnap()` khi slider vượt qua các mốc quan trọng (25%, 50%, 75%, 100%).
2. **Squishy Buttons**: Kêu `playSquishyTap()` khi nhấn chuột vào các nút CTA hoặc chuyển tab 2D/3D.
3. **Mascot Interaction**: Kêu nhẹ khi hover hoặc click vào linh vật "Gói".
4. **QR Unboxing**: Kêu `playUnboxPop()` khi người dùng mở nắp hộp ảo 3D.
