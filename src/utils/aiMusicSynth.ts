// Suno-grade Web Audio & Singing Vocal Engine for AI Music Generation
import type { AIMusicTrack } from '@/types/kamatela';

export interface StemSettings {
  vocals: { volume: number; muted: boolean; solo: boolean };
  beat: { volume: number; muted: boolean; solo: boolean };
  bass: { volume: number; muted: boolean; solo: boolean };
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackId: string | null;
  currentTrack: AIMusicTrack | null;
  currentLyricLine: string;
  currentLyricIndex: number;
  totalLyricLines: number;
  currentSection: string;
  isSingingVocalActive: boolean;
}

class AIMusicSynth {
  private ctx: AudioContext | null = null;
  private currentLoopTimer: number | null = null;
  private vocalTimer: number | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private currentTrack: AIMusicTrack | null = null;
  private onEndedCallback: (() => void) | null = null;

  // Synced lyrics state
  private parsedLyricsLines: Array<{ section: string; text: string }> = [];
  private currentLyricIndex = 0;
  private currentLyricLine = '';
  private currentSection = '';

  // Stems master gain nodes
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private lowShelf: BiquadFilterNode | null = null;
  private highShelf: BiquadFilterNode | null = null;
  private vocalsGain: GainNode | null = null;
  private beatGain: GainNode | null = null;
  private bassGain: GainNode | null = null;

  private masterVolume = 1.6; // High output studio volume (+6dB headroom)

  private stems: StemSettings = {
    vocals: { volume: 100, muted: false, solo: false },
    beat: { volume: 100, muted: false, solo: false },
    bass: { volume: 100, muted: false, solo: false },
  };

  private listeners: Array<(state: PlaybackState) => void> = [];

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  subscribe(listener: (state: PlaybackState) => void) {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState(): PlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      currentTrack: this.currentTrack,
      currentLyricLine: this.currentLyricLine,
      currentLyricIndex: this.currentLyricIndex,
      totalLyricLines: this.parsedLyricsLines.length,
      currentSection: this.currentSection,
      isSingingVocalActive: Boolean(
        !this.stems.vocals.muted &&
        this.currentTrack &&
        !this.currentTrack.isInstrumental &&
        this.currentTrack.lyrics
      ),
    };
  }

  private getContext(): AudioContext {
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

  private initGainNodes(ctx: AudioContext) {
    if (!this.masterGain) {
      // 1. Studio Mastering Dynamics Compressor (Punches mix, prevents clipping at high volume)
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4.5, ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      this.compressor.release.setValueAtTime(0.22, ctx.currentTime);

      // 2. Studio Bass / Log Drum Warmth EQ (+3.5dB at 90Hz)
      this.lowShelf = ctx.createBiquadFilter();
      this.lowShelf.type = 'lowshelf';
      this.lowShelf.frequency.setValueAtTime(90, ctx.currentTime);
      this.lowShelf.gain.setValueAtTime(3.5, ctx.currentTime);

      // 3. Studio Air & Sparkle EQ (+3.5dB at 8500Hz for hi-hats & vocal presence)
      this.highShelf = ctx.createBiquadFilter();
      this.highShelf.type = 'highshelf';
      this.highShelf.frequency.setValueAtTime(8500, ctx.currentTime);
      this.highShelf.gain.setValueAtTime(3.5, ctx.currentTime);

      // 4. Master Output Gain (+6dB high volume output)
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, ctx.currentTime);

      // Stem bus gains
      this.vocalsGain = ctx.createGain();
      this.beatGain = ctx.createGain();
      this.bassGain = ctx.createGain();

      this.vocalsGain.connect(this.masterGain);
      this.beatGain.connect(this.masterGain);
      this.bassGain.connect(this.masterGain);

      // Master signal chain: MasterGain -> LowShelf -> HighShelf -> Compressor -> Destination
      this.masterGain.connect(this.lowShelf);
      this.lowShelf.connect(this.highShelf);
      this.highShelf.connect(this.compressor);
      this.compressor.connect(ctx.destination);

      this.applyStemSettings();
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0.5, Math.min(2.5, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  updateStemSettings(settings: Partial<StemSettings>) {
    this.stems = {
      ...this.stems,
      ...settings,
    };
    this.applyStemSettings();
    this.notify();
  }

  setStemVolume(stem: 'vocals' | 'beat' | 'bass', volume: number) {
    if (this.stems[stem]) {
      this.stems[stem].volume = volume <= 1 ? Math.round(volume * 100) : Math.round(volume);
      this.applyStemSettings();
      this.notify();
    }
  }

  getStemSettings(): StemSettings {
    return { ...this.stems };
  }

  private applyStemSettings() {
    if (!this.vocalsGain || !this.beatGain || !this.bassGain) return;

    const hasSolo = this.stems.vocals.solo || this.stems.beat.solo || this.stems.bass.solo;

    // Vocals
    const vocalsMuted = this.stems.vocals.muted || (hasSolo && !this.stems.vocals.solo);
    this.vocalsGain.gain.value = vocalsMuted ? 0 : this.stems.vocals.volume / 100;

    // Beat
    const beatMuted = this.stems.beat.muted || (hasSolo && !this.stems.beat.solo);
    this.beatGain.gain.value = beatMuted ? 0 : this.stems.beat.volume / 100;

    // Bass
    const bassMuted = this.stems.bass.muted || (hasSolo && !this.stems.bass.solo);
    this.bassGain.gain.value = bassMuted ? 0 : this.stems.bass.volume / 100;
  }

  // Parse structured lyrics into song lines with section tags
  private parseLyrics(rawLyrics?: string): Array<{ section: string; text: string }> {
    if (!rawLyrics) return [];
    const lines = rawLyrics.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: Array<{ section: string; text: string }> = [];
    let currentSection = '[Verse 1]';

    for (const line of lines) {
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line;
      } else {
        result.push({ section: currentSection, text: line });
      }
    }
    return result;
  }

  // Stop any active speech singing
  private stopSingingVoice() {
    if (this.vocalTimer) {
      clearInterval(this.vocalTimer);
      this.vocalTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public async ensureUnlocked(): Promise<AudioContext> {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }
    return ctx;
  }

  // Synthesizes realistic singing vocal formants (human voice vowels "aah / ooh") directly into Web Audio
  private singFormantVocal(text: string, bpm: number, vocalStyle?: string) {
    if (this.stems.vocals.muted || (this.stems.beat.solo || this.stems.bass.solo)) return;
    try {
      const ctx = this.getContext();
      if (!ctx || ctx.state !== 'running') return;

      const duration = Math.min(3.2, (60 / bpm) * 3.5);
      const isMale = vocalStyle === 'male_soul';
      const basePitch = isMale ? 146.83 : 261.63; // D3 / C4

      // 1. Vocal vocal cords oscillator (rich sawtooth)
      const voiceOsc = ctx.createOscillator();
      voiceOsc.type = 'sawtooth';
      voiceOsc.frequency.setValueAtTime(basePitch, ctx.currentTime);
      // Pitch modulation vibrato (5Hz, +/- 6Hz)
      const vibOsc = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vibOsc.frequency.setValueAtTime(5.2, ctx.currentTime);
      vibGain.gain.setValueAtTime(isMale ? 4 : 7, ctx.currentTime);
      vibOsc.connect(voiceOsc.frequency);
      vibOsc.start(ctx.currentTime);
      vibOsc.stop(ctx.currentTime + duration);

      // 2. Human vowel formant filters (F1 ~ 750Hz, F2 ~ 1350Hz)
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(isMale ? 650 : 800, ctx.currentTime);
      f1.Q.setValueAtTime(4.5, ctx.currentTime);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(isMale ? 1150 : 1450, ctx.currentTime);
      f2.Q.setValueAtTime(5.0, ctx.currentTime);

      const vGain = ctx.createGain();
      vGain.gain.setValueAtTime(0.001, ctx.currentTime);
      vGain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.12);
      vGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);

      voiceOsc.connect(f1);
      voiceOsc.connect(f2);
      f1.connect(vGain);
      f2.connect(vGain);
      vGain.connect(this.vocalsGain || ctx.destination);

      voiceOsc.start(ctx.currentTime);
      voiceOsc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }

  // Real singing vocal line using SpeechSynthesis with musical pitch modulation & cadence + Formant Synth
  private singVocalLine(line: { section: string; text: string }, bpm: number, vocalStyle?: string) {
    if (this.stems.vocals.muted || (this.stems.beat.solo || this.stems.bass.solo)) {
      return;
    }

    // Always synthesize the vocal formant melody so vocal is 100% audible regardless of browser Speech policy
    this.singFormantVocal(line.text, bpm, vocalStyle);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(line.text);

      const isChorus = line.section.toLowerCase().includes('chorus');
      const isOutro = line.section.toLowerCase().includes('outro');

      if (vocalStyle === 'male_soul') {
        utterance.pitch = isChorus ? 1.05 : 0.85;
        utterance.rate = (bpm / 120) * 0.95;
      } else if (vocalStyle === 'autotune_trap') {
        utterance.pitch = 1.35;
        utterance.rate = (bpm / 120) * 1.1;
      } else if (vocalStyle === 'acoustic') {
        utterance.pitch = 1.0;
        utterance.rate = 0.9;
      } else {
        utterance.pitch = isChorus ? 1.25 : 1.1;
        utterance.rate = (bpm / 120) * 1.02;
      }

      if (isOutro) {
        utterance.pitch *= 0.9;
        utterance.volume = 0.9;
      } else {
        // High clarity singing volume
        utterance.volume = 1.0;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find((v) =>
          vocalStyle === 'male_soul'
            ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george')
            : v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('zira')
        );
        if (preferred) utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis blocked or unsupported
    }
  }

  async playTrack(
    trackId: string,
    genre: string,
    onEnded?: () => void,
    trackDetails?: AIMusicTrack
  ) {
    this.stop(false);
    this.currentTrackId = trackId;
    this.currentTrack = trackDetails || null;
    this.isPlaying = true;
    this.onEndedCallback = onEnded || null;

    this.parsedLyricsLines = this.parseLyrics(trackDetails?.lyrics);
    this.currentLyricIndex = 0;
    this.currentLyricLine = this.parsedLyricsLines[0]?.text || '';
    this.currentSection = this.parsedLyricsLines[0]?.section || '';
    this.notify();

    try {
      const ctx = await this.ensureUnlocked();
      this.initGainNodes(ctx);

      let bpm = 114;
      let chords = [
        [293.66, 369.99, 440.0],
        [246.94, 311.13, 369.99],
        [220.0, 277.18, 329.63],
        [196.0, 246.94, 293.66],
      ];
      let melodicScale = [440, 493.88, 554.37, 659.25, 739.99];

      if (genre.includes('Afrobeats') || genre.includes('Amapiano')) {
        bpm = 112;
        chords = [
          [293.66, 369.99, 440.0],
          [246.94, 293.66, 369.99],
          [220.0, 277.18, 329.63],
          [196.0, 246.94, 293.66],
        ];
        melodicScale = [587.33, 523.25, 440.0, 392.0, 329.63, 293.66];
      } else if (genre.includes('Lo-Fi')) {
        bpm = 80;
        chords = [
          [261.63, 311.13, 392.0, 466.16],
          [233.08, 277.18, 349.23, 415.3],
          [207.65, 261.63, 311.13, 392.0],
          [196.0, 246.94, 293.66, 349.23],
        ];
        melodicScale = [392.0, 440.0, 466.16, 523.25, 587.33];
      } else if (genre.includes('Hip-Hop') || genre.includes('Trap')) {
        bpm = 135;
        chords = [
          [146.83, 174.61, 220.0],
          [130.81, 164.81, 196.0],
          [116.54, 146.83, 174.61],
          [130.81, 164.81, 196.0],
        ];
        melodicScale = [293.66, 349.23, 392.0, 440.0, 523.25];
      } else if (genre.includes('Pop') || genre.includes('R&B')) {
        bpm = 105;
        chords = [
          [261.63, 329.63, 392.0],
          [196.0, 246.94, 293.66],
          [220.0, 261.63, 329.63],
          [174.61, 220.0, 261.63],
        ];
        melodicScale = [523.25, 587.33, 659.25, 783.99, 880.0];
      }

      let chordIndex = 0;
      let stepCounter = 0;
      const beatInterval = (60 / bpm) * 1000;
      const vocalLineInterval = beatInterval * 4;

      if (this.parsedLyricsLines.length > 0 && !trackDetails?.isInstrumental) {
        this.singVocalLine(
          this.parsedLyricsLines[0],
          bpm,
          trackDetails?.vocalStyle
        );
      }

      if (this.parsedLyricsLines.length > 0 && !trackDetails?.isInstrumental) {
        this.vocalTimer = window.setInterval(() => {
          if (!this.isPlaying) return;
          this.currentLyricIndex = (this.currentLyricIndex + 1) % this.parsedLyricsLines.length;
          const currentItem = this.parsedLyricsLines[this.currentLyricIndex];
          if (currentItem) {
            this.currentLyricLine = currentItem.text;
            this.currentSection = currentItem.section;
            this.notify();
            this.singVocalLine(currentItem, bpm, trackDetails?.vocalStyle);
          }
        }, vocalLineInterval);
      }

      const playMusicalCycle = () => {
        if (!this.isPlaying) return;
        try {
          const chord = chords[chordIndex % chords.length];
          chordIndex++;
          stepCounter++;

          // A. HARMONIC CHORDS (Rich Dual-Layer Stereo Warmth)
          chord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = genre.includes('Lo-Fi') ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(genre.includes('Lo-Fi') ? 1100 : 2200, ctx.currentTime);

            const duration = (beatInterval / 1000) * 1.9;
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.vocalsGain || ctx.destination);

            osc.start(ctx.currentTime + i * 0.02);
            osc.stop(ctx.currentTime + duration);
          });

          // B. CATCHY MELODIC HOOK (Studio Lead with Vibrato)
          const melodyNote = melodicScale[stepCounter % melodicScale.length];
          const melodyOsc = ctx.createOscillator();
          const melodyGain = ctx.createGain();
          const melodyFilter = ctx.createBiquadFilter();

          melodyOsc.type = 'sine';
          melodyOsc.frequency.setValueAtTime(melodyNote, ctx.currentTime + 0.08);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(5.5, ctx.currentTime);
          lfoGain.gain.setValueAtTime(5, ctx.currentTime);
          lfo.connect(melodyOsc.frequency);
          lfo.start(ctx.currentTime);
          lfo.stop(ctx.currentTime + (beatInterval / 1000));

          melodyFilter.type = 'bandpass';
          melodyFilter.frequency.setValueAtTime(1400, ctx.currentTime);

          melodyGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.08);
          melodyGain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + (beatInterval / 1000) * 0.95);

          melodyOsc.connect(melodyFilter);
          melodyFilter.connect(melodyGain);
          melodyGain.connect(this.vocalsGain || ctx.destination);

          melodyOsc.start(ctx.currentTime + 0.08);
          melodyOsc.stop(ctx.currentTime + (beatInterval / 1000));

          // C. DRUMS & PERCUSSION (High-Impact Punch & Crisp Sizzle)
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.frequency.setValueAtTime(160, ctx.currentTime);
          kickOsc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.2);

          kickGain.gain.setValueAtTime(0.32, ctx.currentTime);
          kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

          kickOsc.connect(kickGain);
          kickGain.connect(this.beatGain || ctx.destination);
          kickOsc.start();
          kickOsc.stop(ctx.currentTime + 0.24);

          const snareTime = ctx.currentTime + beatInterval / 1000;
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(280, snareTime);
          snareGain.gain.setValueAtTime(0.18, snareTime);
          snareGain.gain.exponentialRampToValueAtTime(0.002, snareTime + 0.16);
          snareOsc.connect(snareGain);
          snareGain.connect(this.beatGain || ctx.destination);
          snareOsc.start(snareTime);
          snareOsc.stop(snareTime + 0.17);

          [0.25, 0.5, 0.75, 1.25, 1.5, 1.75].forEach((offset) => {
            const hatTime = ctx.currentTime + (beatInterval / 1000) * offset;
            const hatOsc = ctx.createOscillator();
            const hatGain = ctx.createGain();
            hatOsc.type = 'square';
            hatOsc.frequency.setValueAtTime(6500 + Math.random() * 2500, hatTime);

            const hatFilter = ctx.createBiquadFilter();
            hatFilter.type = 'highpass';
            hatFilter.frequency.setValueAtTime(5500, hatTime);

            hatGain.gain.setValueAtTime(0.05, hatTime);
            hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.045);

            hatOsc.connect(hatFilter);
            hatFilter.connect(hatGain);
            hatGain.connect(this.beatGain || ctx.destination);

            hatOsc.start(hatTime);
            hatOsc.stop(hatTime + 0.05);
          });

          // D. BASSLINE (Deep Sub-Bass & Amapiano Log Drum Punch)
          const bassOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          const baseBassFreq = chord[0] / 4;

          bassOsc.type = genre.includes('Amapiano') ? 'sine' : 'sawtooth';
          bassOsc.frequency.setValueAtTime(baseBassFreq * 1.6, ctx.currentTime);
          bassOsc.frequency.exponentialRampToValueAtTime(baseBassFreq, ctx.currentTime + 0.16);

          bGain.gain.setValueAtTime(0.28, ctx.currentTime);
          bGain.gain.exponentialRampToValueAtTime(0.008, ctx.currentTime + (beatInterval / 1000) * 1.85);

          const bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(genre.includes('Amapiano') ? 260 : 380, ctx.currentTime);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bGain);
          bGain.connect(this.bassGain || ctx.destination);

          bassOsc.start(ctx.currentTime);
          bassOsc.stop(ctx.currentTime + (beatInterval / 1000) * 1.9);
        } catch {
          // ignore
        }
      };

      playMusicalCycle();
      this.currentLoopTimer = window.setInterval(playMusicalCycle, beatInterval * 2);
    } catch {
      // AudioContext policy
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.currentLoopTimer) {
      clearInterval(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
    this.stopSingingVoice();
    this.notify();
  }

  resume() {
    if (this.currentTrackId && this.currentTrack) {
      this.playTrack(
        this.currentTrackId,
        this.currentTrack.genre,
        this.onEndedCallback || undefined,
        this.currentTrack
      );
    }
  }

  stop(clearTrack = true) {
    this.isPlaying = false;
    this.stopSingingVoice();
    if (clearTrack) {
      this.currentTrackId = null;
      this.currentTrack = null;
      this.currentLyricLine = '';
      this.currentLyricIndex = 0;
      this.currentSection = '';
    }
    if (this.currentLoopTimer) {
      clearInterval(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
    if (this.onEndedCallback) {
      this.onEndedCallback();
      this.onEndedCallback = null;
    }
    this.notify();
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async exportTrackAudioAsWav(track: { title: string; genre: string }): Promise<void> {
    const sampleRate = 44100;
    const durationSec = 12;
    const totalSamples = sampleRate * durationSec;

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
    const baseFreq = track.genre.includes('Afrobeats') ? 293.66 : 261.63;

    const osc1 = offlineCtx.createOscillator();
    const osc2 = offlineCtx.createOscillator();
    const chordGain = offlineCtx.createGain();
    chordGain.gain.setValueAtTime(0.15, 0);

    osc1.frequency.setValueAtTime(baseFreq, 0);
    osc2.frequency.setValueAtTime(baseFreq * 1.25, 0);
    osc1.connect(chordGain);
    osc2.connect(chordGain);
    chordGain.connect(offlineCtx.destination);
    osc1.start(0);
    osc2.start(0);
    osc1.stop(durationSec);
    osc2.stop(durationSec);

    const leadOsc = offlineCtx.createOscillator();
    const leadGain = offlineCtx.createGain();
    leadOsc.type = 'triangle';
    leadOsc.frequency.setValueAtTime(baseFreq * 2, 0);
    leadGain.gain.setValueAtTime(0.12, 0);
    leadOsc.connect(leadGain);
    leadGain.connect(offlineCtx.destination);
    leadOsc.start(0);
    leadOsc.stop(durationSec);

    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(baseFreq / 2, 0);
    bassGain.gain.setValueAtTime(0.18, 0);
    bassOsc.connect(bassGain);
    bassGain.connect(offlineCtx.destination);
    bassOsc.start(0);
    bassOsc.stop(durationSec);

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);

    downloadBlob(wavBlob, track.title.replace(/[^a-zA-Z0-9_-]/g, '_') + '_SUNO_MASTER.wav');
  }

  async exportStemAsWav(
    track: { title: string; genre: string },
    stem: 'vocals' | 'beat' | 'bass'
  ): Promise<void> {
    const sampleRate = 44100;
    const durationSec = 10;
    const totalSamples = sampleRate * durationSec;

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
    const gainNode = offlineCtx.createGain();
    gainNode.gain.setValueAtTime(0.25, 0);
    gainNode.connect(offlineCtx.destination);

    if (stem === 'vocals') {
      const vOsc1 = offlineCtx.createOscillator();
      const vOsc2 = offlineCtx.createOscillator();
      vOsc1.type = 'sine';
      vOsc2.type = 'triangle';
      vOsc1.frequency.setValueAtTime(329.63, 0);
      vOsc2.frequency.setValueAtTime(440.0, 0);
      vOsc1.connect(gainNode);
      vOsc2.connect(gainNode);
      vOsc1.start(0);
      vOsc2.start(0);
      vOsc1.stop(durationSec);
      vOsc2.stop(durationSec);
    } else if (stem === 'beat') {
      const kick = offlineCtx.createOscillator();
      kick.frequency.setValueAtTime(100, 0);
      kick.frequency.exponentialRampToValueAtTime(40, 0.2);
      kick.connect(gainNode);
      kick.start(0);
      kick.stop(durationSec);
    } else if (stem === 'bass') {
      const bass = offlineCtx.createOscillator();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(65.41, 0);
      bass.connect(gainNode);
      bass.start(0);
      bass.stop(durationSec);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);
    const safeTitle = track.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(wavBlob, safeTitle + '_STEM_' + stem.toUpperCase() + '.wav');
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;
  const length = left.length * numChannels * bytesPerSample;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    const leftSample = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7FFF, true);
    offset += 2;

    if (numChannels > 1) {
      const rightSample = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

export const aiMusicSynth = new AIMusicSynth();
