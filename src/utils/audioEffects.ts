// Realistic Phone Audio Effects using Web Audio API

class SoundEffects {
  private ctx: AudioContext | null = null;
  private ringTimer: number | null = null;
  private isRingingActive: boolean = false;
  private activeOscillators: OscillatorNode[] = [];

  constructor() {
    // Attempt early unlock on first user interaction in the window
    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock();
        window.removeEventListener('click', unlockHandler);
        window.removeEventListener('touchstart', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      };
      window.addEventListener('click', unlockHandler, { once: true, passive: true });
      window.addEventListener('touchstart', unlockHandler, { once: true, passive: true });
      window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
    }
  }

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async unlock(): Promise<void> {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play a zero-volume buffer to ensure hardware output is primed
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // ignore
    }
  }

  // Play standard telephone dual-tone ringing (US standard: 440Hz + 480Hz)
  // Rhythmic cadence: 1.5s audible dual-tone ring -> 2.0s pause -> repeats
  public async startRingtone() {
    this.stopRingtone();
    this.isRingingActive = true;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const playSingleRingBurst = () => {
        if (!this.isRingingActive) return;

        try {
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, now); // Standard US/UK ring frequency 1
          osc2.frequency.setValueAtTime(480, now); // Standard US/UK ring frequency 2

          // Clear audible volume envelope: ramp in, hold, ramp out
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.22, now + 0.05); // Fast attack to 0.22
          gain.gain.setValueAtTime(0.22, now + 1.4); // Hold for 1.4 seconds
          gain.gain.linearRampToValueAtTime(0.001, now + 1.5); // Smooth decay

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          this.activeOscillators.push(osc1, osc2);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.55);
          osc2.stop(now + 1.55);

          osc1.onended = () => {
            this.activeOscillators = this.activeOscillators.filter((o) => o !== osc1 && o !== osc2);
          };
        } catch {
          // ignore error
        }
      };

      // Play first ring immediately
      playSingleRingBurst();

      // Cycle every 3.5 seconds (1.5s ring + 2.0s silence)
      this.ringTimer = window.setInterval(playSingleRingBurst, 3500);
    } catch (err) {
      console.warn('Failed to start ringtone:', err);
    }
  }

  public stopRingtone() {
    this.isRingingActive = false;
    if (this.ringTimer) {
      clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
    // Stop any active ringing oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  // Connected chime sound
  playConnectedChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }

  // End call beep
  playHangupBeep() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(425, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // ignore
    }
  }

  // Recording start beep
  playRecordStart() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  // Message sent pop sound
  playSentPop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEffects();
