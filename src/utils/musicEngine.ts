/**
 * Original, 100% Copyright-Free Procedural Kids Background Music Engine.
 * Composed specifically for TickTock Mystery (Toy-Box Marimba + Cozy Bass + Celesta + Soft Tick-Tock Woodblock).
 * Zero external audio assets, 100% offline, safe for commercial Apple App Store & Google Play Store release.
 */

const N: Record<string, number> = {
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
};

// 64 eighth-note steps (8 bars of 4/4) — cheerful, bouncy, cozy kids melody
const MELODY: Array<string | null> = [
  // Bar 1 (C): playful skipping motif
  'E5', null, 'G5', null, 'C5', 'D5', 'E5', null,
  // Bar 2 (G): bouncy answer
  'D5', null, 'G4', null, 'B4', 'C5', 'D5', null,
  // Bar 3 (Am): curious mystery tip-toe
  'C5', null, 'E5', null, 'A4', 'B4', 'C5', null,
  // Bar 4 (F -> G): sunny lift
  'A4', 'C5', 'F5', null, 'E5', null, 'D5', null,

  // Bar 5 (C): joyful climb
  'E5', 'G5', 'A5', null, 'G5', null, 'E5', null,
  // Bar 6 (F): warm skip
  'F5', null, 'A5', null, 'G5', 'F5', 'E5', null,
  // Bar 7 (Dm -> G): playful cadence
  'D5', 'E5', 'F5', null, 'G5', null, 'D5', null,
  // Bar 8 (C): happy home landing with breathing space
  'C5', null, 'E5', null, 'C5', null, null, null,
];

// Cozy warm bassline (64 steps)
const BASS: Array<string | null> = [
  'C3', null, null, null, 'G3', null, null, null,
  'G2', null, null, null, 'D3', null, null, null,
  'A2', null, null, null, 'E3', null, null, null,
  'F3', null, null, null, 'G3', null, null, null,

  'C3', null, null, null, 'G3', null, null, null,
  'F3', null, null, null, 'C3', null, null, null,
  'D3', null, null, null, 'G2', null, 'B2', null,
  'C3', null, null, null, 'G2', null, null, null,
];

// Light celesta sparkle twinkles on select phrase peaks
const SPARKLE: Array<string | null> = [
  null, null, null, null, null, null, 'C6', null,
  null, null, null, null, null, null, 'G5', null,
  null, null, null, null, null, null, 'A5', null,
  null, null, 'C6', null, null, null, null, null,

  null, null, 'C6', null, null, null, null, null,
  null, null, 'C6', null, null, null, 'G5', null,
  null, null, null, null, 'B4', null, 'G5', null,
  'C6', null, null, null, null, null, null, null,
];

const STEP_DURATION_SEC = 60 / 112 / 2; // 112 BPM eighth notes (~0.268s)

class KidsMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  private enabled = true;
  private suspended = false;
  private hasUserGesture = false;
  private isPlaying = false;
  private stepIndex = 0;
  private nextNoteTime = 0;
  private schedulerId: number | null = null;
  private duckTimeoutId: number | null = null;

  private readonly baseVolume = 0.34;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 2800;
      this.filter.Q.value = 0.7;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.baseVolume;

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Set preference without prematurely creating an AudioContext before a user gesture */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopLoop();
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else if (this.hasUserGesture && !this.suspended) {
      this.unlockAndStart();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /** Call on user gestures (click / touchend / pointerdown / keydown) to unlock Web Audio reliably on Android WebView, iOS Safari & Desktop */
  public unlockAndStart() {
    this.hasUserGesture = true;
    if (!this.enabled || this.suspended) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const begin = () => {
      if (!this.enabled || this.suspended) return;
      if (ctx.state === 'running') {
        if (!this.isPlaying) {
          this.startLoop();
        } else if (this.nextNoteTime < ctx.currentTime) {
          this.nextNoteTime = ctx.currentTime + 0.05;
        }
      }
    };

    if (ctx.state !== 'running') {
      ctx
        .resume()
        .then(begin)
        .catch(() => {});
    } else {
      begin();
    }
  }

  /** Pause music cleanly when app moves to background, resume when foregrounded */
  public setSuspended(suspended: boolean) {
    this.suspended = suspended;
    if (suspended) {
      this.stopLoop();
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else if (this.enabled && this.hasUserGesture) {
      this.unlockAndStart();
    }
  }

  /** Softly duck music volume during celebration fanfares so SFX shine */
  public duck(durationMs = 1100) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.baseVolume * 0.35, now, 0.05);

    if (this.duckTimeoutId) window.clearTimeout(this.duckTimeoutId);
    this.duckTimeoutId = window.setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.baseVolume, t, 0.18);
    }, durationMs);
  }

  private startLoop() {
    if (this.isPlaying || !this.enabled || this.suspended) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;

    this.isPlaying = true;
    this.nextNoteTime = ctx.currentTime + 0.06;

    const scheduleAhead = 0.2;
    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      if (this.ctx.state !== 'running') return;

      // Guard against long tab pauses causing a burst of catch-up notes
      if (this.nextNoteTime < this.ctx.currentTime - 0.5) {
        this.nextNoteTime = this.ctx.currentTime + 0.05;
      }

      while (this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
        this.scheduleStep(this.stepIndex, this.nextNoteTime);
        const swingOffset = this.stepIndex % 2 === 0 ? 1.07 : 0.93;
        this.nextNoteTime += STEP_DURATION_SEC * swingOffset;
        this.stepIndex = (this.stepIndex + 1) % MELODY.length;
      }
    };

    tick();
    this.schedulerId = window.setInterval(tick, 60);
  }

  private stopLoop() {
    this.isPlaying = false;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  private scheduleStep(step: number, time: number) {
    const ctx = this.ctx;
    const dest = this.filter;
    if (!ctx || !dest) return;

    const melNote = MELODY[step];
    if (melNote && N[melNote]) {
      this.playMarimba(ctx, dest, N[melNote], time, 0.26, 0.28);
    }

    const bassNote = BASS[step];
    if (bassNote && N[bassNote]) {
      this.playBass(ctx, dest, N[bassNote], time, 0.36, 0.26);
    }

    const spNote = SPARKLE[step];
    if (spNote && N[spNote]) {
      this.playSparkle(ctx, dest, N[spNote], time, 0.34, 0.09);
    }

    if (step % 2 === 0) {
      const isTick = step % 4 === 0;
      this.playWoodblock(ctx, dest, isTick ? 920 : 740, time, isTick ? 0.06 : 0.045);
    }
  }

  private playMarimba(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const harm = ctx.createOscillator();
    const gain = ctx.createGain();
    const harmGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    harm.type = 'triangle';
    harm.frequency.setValueAtTime(freq * 2, time);
    harmGain.gain.setValueAtTime(0.16, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    harm.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(dest);

    osc.start(time);
    harm.start(time);
    osc.stop(time + duration + 0.02);
    harm.stop(time + duration + 0.02);
  }

  private playBass(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playSparkle(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playWoodblock(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, time + 0.032);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.036);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.045);
  }
}

export const musicEngine = new KidsMusicEngine();
