/**
 * Tactile Haptic Audio Synthesis Engine
 * Zero-asset procedural sound generation for packaging interactions using Web Audio API.
 * Supports crisp paper creasing, unboxing pop, squishy taps, and mobile haptic feedback.
 */

class PackagingAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private init(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;

    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public getMuted(): boolean {
    return this.muted;
  }

  /**
   * Crisp Paper Crease Snap (Gập nếp / cấn góc giấy)
   */
  public playCreaseSnap() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
    } catch {}
  }

  public playPaperSnap() {
    this.playCreaseSnap();
  }

  /**
   * Unboxing Pop (Bật nắp hộp / Unboxing 3D)
   */
  public playUnboxPop() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([15, 30, 20]);
      }
    } catch {}
  }

  public playUnboxingPop() {
    this.playUnboxPop();
  }

  /**
   * Squishy Tap / Mascot Poke Boop
   */
  public playSquishyTap() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(6);
      }
    } catch {}
  }

  /**
   * Paper Folding sound based on folding progress
   */
  public playPaperFold(progress: number = 0.5) {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const baseFreq = 200 + progress * 240;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  public playPaperTuck() {
    this.playCreaseSnap();
  }

  public playPaperSlide(factor: number = 0.5) {
    this.playPaperFold(factor);
  }

  /**
   * Success Chime on FitCheck 100/100 or Export Complete
   */
  public playSuccessChime() {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch {}
  }
}

export const tactileAudio = new PackagingAudioEngine();
