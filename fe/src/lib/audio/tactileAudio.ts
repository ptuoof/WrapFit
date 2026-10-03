/**
 * Tactile Haptic Audio Synthesis Engine
 * Zero-asset procedural sound generation for packaging interactions using Web Audio API.
 * Supports crisp paper creasing, unboxing pop, squishy taps, and mobile haptic feedback.
 */

class PackagingAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (this.isMuted) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Âm thanh cấn nếp giấy / gập góc 90° (Crisp Paper Crease Snap)
   * Tạo tiếng click giòn của thớ giấy kraft/ivory khi bị bẻ cong vào rãnh cấn
   */
  public playCreaseSnap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.07);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      // Thêm bandpass filter nhẹ cho chất âm mộc
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(2.0, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);

      // Haptic pulse trên smartphone
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignored for autoplay restrictions
    }
  }

  /**
   * Alias cho playCreaseSnap
   */
  public playPaperSnap() {
    this.playCreaseSnap();
  }

  /**
   * Alias cho playUnboxPop
   */
  public playUnboxingPop() {
    this.playUnboxPop();
  }

  /**
   * Alias cho playPaperSlide
   */
  public playPaperFold(progress: number = 0.5) {
    this.playPaperSlide(progress);
  }

  /**
   * Âm thanh gài tai khóa hộp (Box Flap Tuck-in)
   * Tiếng "khấc" chắc nịch khi tai gài trượt vào khe đáy hoặc nắp
   */
  public playPaperTuck() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.095);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([8, 15]);
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh mở nắp hộp bật tung quà (Unboxing Pop / Confetti Whoosh)
   * Dùng cho trải nghiệm unboxing hoặc mở hộp 3D
   */
  public playUnboxPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 30, 20]);
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh nhún lò xo Squishy khi chạm nút bấm
   * Dành cho các phím CTA hoặc chip gợi ý của trợ lý Gói
   */
  public playSquishyTap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.045);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(6);
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh ma sát trượt giấy (Paper Slide Whisper) khi kéo thanh fold slider
   */
  public playPaperSlide(factor: number = 0.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 180 + factor * 220;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq + 30, now + 0.03);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignored
    }
  }

  /**
   * Âm thanh ăn mừng chúc mừng khi FitCheck đạt 100 điểm hoặc xuất PDF thành công
   */
  public playSuccessChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const noteTime = now + index * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.08, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.26);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 20, 10, 30]);
      }
    } catch {
      // Ignored
    }
  }
}

export const tactileAudio = new PackagingAudioEngine();
