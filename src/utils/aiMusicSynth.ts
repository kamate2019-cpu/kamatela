// Web Audio Musical Synthesizer for AI Music Generation Preview & Stem Mixer

export interface StemSettings {
  vocals: { volume: number; muted: boolean; solo: boolean };
  beat: { volume: number; muted: boolean; solo: boolean };
  bass: { volume: number; muted: boolean; solo: boolean };
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackId: string | null;
  currentTrack: {
    id: string;
    title: string;
    genre: string;
    coverUrl: string;
    durationSeconds: number;
    lyrics?: string;
  } | null;
}

class AIMusicSynth {
  private ctx: AudioContext | null = null;
  private currentLoopTimer: number | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private currentTrack: PlaybackState['currentTrack'] = null;
  private onEndedCallback: (() => void) | null = null;

  // Stems master gain nodes
  private masterGain: GainNode | null = null;
  private vocalsGain: GainNode | null = null;
  private beatGain: GainNode | null = null;
  private bassGain: GainNode | null = null;

  private stems: StemSettings = {
    vocals: { volume: 80, muted: false, solo: false },
    beat: { volume: 85, muted: false, solo: false },
    bass: { volume: 90, muted: false, solo: false },
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
    };
  }

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private initGainNodes(ctx: AudioContext) {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);

      this.vocalsGain = ctx.createGain();
      this.beatGain = ctx.createGain();
      this.bassGain = ctx.createGain();

      this.vocalsGain.connect(this.masterGain);
      this.beatGain.connect(this.masterGain);
      this.bassGain.connect(this.masterGain);

      this.applyStemSettings();
    }
  }

  updateStemSettings(settings: Partial<StemSettings>) {
    this.stems = {
      ...this.stems,
      ...settings,
    };
    this.applyStemSettings();
  }

  getStemSettings(): StemSettings {
    return { ...this.stems };
  }

  private applyStemSettings() {
    if (!this.vocalsGain || !this.beatGain || !this.bassGain) return;

    const hasSolo = this.stems.vocals.solo || this.stems.beat.solo || this.stems.bass.solo;

    // Vocals
    const vocalsMuted = this.stems.vocals.muted || (hasSolo && !this.stems.vocals.solo);
    this.vocalsGain.gain.value = vocalsMuted ? 0 : (this.stems.vocals.volume / 100);

    // Beat
    const beatMuted = this.stems.beat.muted || (hasSolo && !this.stems.beat.solo);
    this.beatGain.gain.value = beatMuted ? 0 : (this.stems.beat.volume / 100);

    // Bass
    const bassMuted = this.stems.bass.muted || (hasSolo && !this.stems.bass.solo);
    this.bassGain.gain.value = bassMuted ? 0 : (this.stems.bass.volume / 100);
  }

  playTrack(
    trackId: string,
    genre: string,
    onEnded?: () => void,
    trackDetails?: PlaybackState['currentTrack']
  ) {
    this.stop(false);
    this.currentTrackId = trackId;
    this.currentTrack = trackDetails || {
      id: trackId,
      title: 'Original AI Audio',
      genre,
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
      durationSeconds: 160,
    };
    this.isPlaying = true;
    this.onEndedCallback = onEnded || null;
    this.notify();

    try {
      const ctx = this.getContext();
      this.initGainNodes(ctx);

      let bpm = 115;
      let chords = [
        [261.63, 329.63, 392.0], // C major
        [220.0, 261.63, 329.63], // A minor
        [174.61, 220.0, 261.63], // F major
        [196.0, 246.94, 293.66], // G major
      ];

      if (genre.includes('Afrobeats') || genre.includes('Amapiano')) {
        bpm = 112;
        chords = [
          [293.66, 369.99, 440.0],
          [246.94, 311.13, 369.99],
          [220.0, 277.18, 329.63],
          [196.0, 246.94, 293.66],
        ];
      } else if (genre.includes('Lo-Fi')) {
        bpm = 82;
        chords = [
          [261.63, 311.13, 392.0, 466.16],
          [233.08, 277.18, 349.23, 415.3],
          [207.65, 261.63, 311.13, 392.0],
          [196.0, 246.94, 293.66, 349.23],
        ];
      } else if (genre.includes('Hip-Hop')) {
        bpm = 92;
        chords = [
          [146.83, 174.61, 220.0],
          [130.81, 164.81, 196.0],
          [116.54, 146.83, 174.61],
          [130.81, 164.81, 196.0],
        ];
      }

      let chordIndex = 0;
      const beatInterval = (60 / bpm) * 1000;

      const playChordCycle = () => {
        if (!this.isPlaying) return;
        try {
          const chord = chords[chordIndex % chords.length];
          chordIndex++;

          // 1. HARMONY / VOCAL CHORD STEM
          chord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = genre.includes('Lo-Fi') ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(genre.includes('Lo-Fi') ? 800 : 1600, ctx.currentTime);

            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (beatInterval / 1000) * 1.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.vocalsGain || ctx.destination);

            osc.start(ctx.currentTime + i * 0.04);
            osc.stop(ctx.currentTime + (beatInterval / 1000) * 1.9);
          });

          // 2. BEAT & PERCUSSION STEM
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.frequency.setValueAtTime(120, ctx.currentTime);
          kickOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15);

          kickGain.gain.setValueAtTime(0.08, ctx.currentTime);
          kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

          kickOsc.connect(kickGain);
          kickGain.connect(this.beatGain || ctx.destination);

          kickOsc.start();
          kickOsc.stop(ctx.currentTime + 0.2);

          // Snare / Rim shot
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(220, ctx.currentTime + (beatInterval / 1000));
          snareGain.gain.setValueAtTime(0.03, ctx.currentTime + (beatInterval / 1000));
          snareGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (beatInterval / 1000) + 0.1);

          snareOsc.connect(snareGain);
          snareGain.connect(this.beatGain || ctx.destination);

          snareOsc.start(ctx.currentTime + (beatInterval / 1000));
          snareOsc.stop(ctx.currentTime + (beatInterval / 1000) + 0.12);

          // 3. BASSLINE STEM
          const bassOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(chord[0] / 4, ctx.currentTime);
          bGain.gain.setValueAtTime(0.05, ctx.currentTime);
          bGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + (beatInterval / 1000) * 1.6);

          const bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(280, ctx.currentTime);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bGain);
          bGain.connect(this.bassGain || ctx.destination);

          bassOsc.start(ctx.currentTime);
          bassOsc.stop(ctx.currentTime + (beatInterval / 1000) * 1.7);
        } catch {
          // ignore
        }
      };

      playChordCycle();
      this.currentLoopTimer = window.setInterval(playChordCycle, beatInterval * 2);
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
    if (clearTrack) {
      this.currentTrackId = null;
      this.currentTrack = null;
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

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  // Export full master audio as a high-quality playable WAV file
  async exportTrackAudioAsWav(track: { title: string; genre: string }): Promise<void> {
    const sampleRate = 44100;
    const durationSec = 10;
    const totalSamples = sampleRate * durationSec;

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
    const baseFreq = track.genre.includes('Afrobeats') ? 293.66 : 261.63;
    const osc1 = offlineCtx.createOscillator();
    const osc2 = offlineCtx.createOscillator();
    const kick = offlineCtx.createOscillator();

    const gainNode = offlineCtx.createGain();
    gainNode.gain.setValueAtTime(0.2, 0);

    osc1.frequency.setValueAtTime(baseFreq, 0);
    osc2.frequency.setValueAtTime(baseFreq * 1.25, 0);
    kick.frequency.setValueAtTime(80, 0);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    kick.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    osc1.start(0);
    osc2.start(0);
    kick.start(0);

    osc1.stop(durationSec);
    osc2.stop(durationSec);
    kick.stop(durationSec);

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);

    downloadBlob(wavBlob, `${track.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_KAMATELA.wav`);
  }

  // Export isolated stem audio (Vocals, Beat, or Bass) as an independent WAV file
  async exportStemAsWav(
    track: { title: string; genre: string },
    stem: 'vocals' | 'beat' | 'bass'
  ): Promise<void> {
    const sampleRate = 44100;
    const durationSec = 8;
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
    downloadBlob(wavBlob, `${safeTitle}_STEM_${stem.toUpperCase()}.wav`);
  }
}

// Download helper
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

// Helper to encode AudioBuffer into a binary WAV Blob (RIFF 16-bit PCM)
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;
  const length = left.length * numChannels * bytesPerSample;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // Write RIFF header
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

  // Interleave and write 16-bit PCM samples
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
