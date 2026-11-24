/**
 * Procedural Toy-Box Sound Engine using Web Audio API.
 * 100% offline, zero audio asset bloat, instant low-latency playback on iOS/Android/Web.
 */
class ToySoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.16,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /** Crisp wooden marimba click when nudging hour/min/sec */
  public playTick(step: 'hour' | 'minute' | 'second' = 'minute', up = true) {
    const base =
      step === 'hour' ? 440 : step === 'minute' ? 587.33 : 740;
    const freq = up ? base * 1.06 : base * 0.94;
    this.playTone(freq, 0.075, 'triangle', 0.15, 0, freq * 0.85);
    this.playTone(freq * 2, 0.035, 'sine', 0.05, 0);
  }

  /** Tactile squishy UI button pop */
  public playButtonPop() {
    this.playTone(360, 0.08, 'sine', 0.14, 0, 620);
  }

  /** Springy bubbly spin when a fresh mystery clock appears */
  public playSpinWhoosh() {
    const notes = [330, 392, 493.88, 587.33, 659.25];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.09, 'triangle', 0.1, idx * 0.045);
    });
    // Cute soft spring boing at the end
    this.playTone(280, 0.18, 'sine', 0.1, 0.24, 420);
  }

  /** Ascending xylophone domino ripple as hidden numbers pop onto the clock */
  public playRevealRipple() {
    const pentatonic = [
      523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
      1174.66, 1318.51,
    ];
    pentatonic.forEach((freq, i) => {
      this.playTone(freq, 0.11, 'sine', 0.085, i * 0.048);
    });
  }

  /** Gentle magical sparkle for Hint Peek */
  public playPeek() {
    this.playTone(783.99, 0.14, 'sine', 0.11, 0);
    this.playTone(1046.5, 0.18, 'sine', 0.11, 0.07);
    this.playTone(1318.51, 0.24, 'triangle', 0.09, 0.14);
  }

  /** Celebratory reaction based on stars earned (0..3) */
  public playCelebrate(stars: number, isExact = false) {
    if (isExact || stars === 3) {
      // Joyful rainbow xylophone fanfare!
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chord.forEach((f, i) => {
        this.playTone(f, 0.28, 'triangle', 0.15, 0.36 + i * 0.075);
        this.playTone(f * 2, 0.18, 'sine', 0.05, 0.36 + i * 0.075);
      });
    } else if (stars === 2) {
      // Warm bouncy happy chime
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((f, i) => {
        this.playTone(f, 0.22, 'triangle', 0.14, 0.36 + i * 0.08);
      });
    } else if (stars === 1) {
      // Friendly encouraging double chime
      this.playTone(440, 0.16, 'triangle', 0.12, 0.36);
      this.playTone(554.37, 0.24, 'triangle', 0.12, 0.46);
    } else {
      // Gentle playful "boop-boop!" (never harsh!)
      this.playTone(392, 0.14, 'sine', 0.11, 0.36, 330);
      this.playTone(330, 0.22, 'sine', 0.11, 0.5, 349.23);
    }
  }

  /** Magical sparkle fanfare when unlocking a new badge or skin */
  public playBadgeUnlock() {
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
    notes.forEach((f, i) => {
      this.playTone(f, 0.24, 'sine', 0.12, i * 0.065);
    });
  }
}

export const soundEngine = new ToySoundEngine();
