import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Music,
  Play,
  Pause,
  Film,
  Radio,
  Send,
  Heart,
  FileText,
  Sliders,
  Wand2,
  Share2,
  Volume2,
  Mic,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  CloudDownload,
  Settings2,
  MoreVertical,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { AIMusicTrack, User } from '@/types/kamatela';
import { aiMusicSynth, type PlaybackState } from '@/utils/aiMusicSynth';
import { SoundWaveVisualizer } from './SoundWaveVisualizer';
import { StemSeparationModal } from './StemSeparationModal';
import { CoverArtGeneratorModal } from './CoverArtGeneratorModal';

interface MusicStudioViewProps {
  tracks: AIMusicTrack[];
  currentUser: User;
  onGenerateTrack: (params: {
    title?: string;
    prompt: string;
    genre: string;
    mood: string;
    isInstrumental: boolean;
    vocalStyle?: NonNullable<AIMusicTrack['vocalStyle']>;
    lyrics?: string;
  }) => AIMusicTrack;
  onUpdateTrackCover: (trackId: string, newCoverUrl: string) => void;
  onToggleLike: (trackId: string) => void;
  onUseInVideo: (track: AIMusicTrack) => void;
  onPlayInVoiceRoom: (track: AIMusicTrack) => void;
  onShareToChat: (track: AIMusicTrack) => void;
  onDownloadTrack?: (trackId: string) => void;
  onRemoveDownloadedTrack?: (trackId: string) => void;
}

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({
  tracks,
  currentUser: _currentUser,
  onGenerateTrack,
  onUpdateTrackCover,
  onToggleLike,
  onUseInVideo,
  onPlayInVoiceRoom,
  onShareToChat,
  onDownloadTrack,
  onRemoveDownloadedTrack,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'downloaded'>('all');
  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Afrobeats');
  const [selectedMood, setSelectedMood] = useState('Upbeat');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [vocalStyle, setVocalStyle] = useState<NonNullable<AIMusicTrack['vocalStyle']>>('female_afropop');
  const [lyrics, setLyrics] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [viewingLyricsTrack, setViewingLyricsTrack] = useState<AIMusicTrack | null>(null);
  const [activeStemTrack, setActiveStemTrack] = useState<AIMusicTrack | null>(null);
  const [activeCoverArtTrack, setActiveCoverArtTrack] = useState<AIMusicTrack | null>(null);
  const [isExportingTrackId, setIsExportingTrackId] = useState<string | null>(null);

  // Playback sync from multi-track synth
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() => aiMusicSynth.getState());
  const [stemVolumes, setStemVolumes] = useState({ vocals: 100, beat: 100, bass: 100 });
  const [masterVolumeBoost, setMasterVolumeBoost] = useState(160);

  useEffect(() => {
    const unsub = aiMusicSynth.subscribe((state) => {
      setPlaybackState(state);
      if (!state.isPlaying) {
        setActivePlayingId(null);
      } else if (state.currentTrackId) {
        setActivePlayingId(state.currentTrackId);
      }
    });
    return unsub;
  }, []);

  const GENRES = [
    'Afrobeats',
    'Amapiano',
    'Lo-Fi Chill',
    'Hip-Hop',
    'R&B / Soul',
    'EDM / Dance',
    'Cinematic',
    'Reggaeton',
  ];

  const MOODS = ['Upbeat', 'Chill', 'Energetic', 'Dreamy', 'Dark'];

  const VOCAL_STYLES: Array<{ id: NonNullable<AIMusicTrack['vocalStyle']>; label: string }> = [
    { id: 'female_afropop', label: 'Female Afro-Pop' },
    { id: 'male_soul', label: 'Male Soul' },
    { id: 'autotune_trap', label: 'Autotune Trap' },
    { id: 'acoustic', label: 'Acoustic Indie' },
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !customTitle.trim()) {
      toast.error('Please enter a song prompt or description');
      return;
    }

    aiMusicSynth.ensureUnlocked().catch(() => {});
    setIsGenerating(true);
    setGeneratingStep('Synthesizing chords & rhythm...');

    setTimeout(() => {
      setGeneratingStep(isInstrumental ? 'Mastering instrumental track...' : 'Composing AI vocal harmonies...');
    }, 1200);

    setTimeout(() => {
      const newTrack = onGenerateTrack({
        title: customTitle.trim() || undefined,
        prompt: prompt.trim() || `${selectedGenre} song`,
        genre: selectedGenre,
        mood: selectedMood,
        isInstrumental,
        vocalStyle: !isInstrumental ? vocalStyle : undefined,
        lyrics: !isInstrumental ? lyrics : undefined,
      });

      setIsGenerating(false);
      setGeneratingStep('');
      setPrompt('');
      setCustomTitle('');
      setLyrics('');
      setShowAdvanced(false);
      toast.success(`Created "${newTrack.title}"! Playing now.`);
      handlePlayTrack(newTrack);
    }, 2400);
  };

  const handlePlayTrack = (track: AIMusicTrack) => {
    aiMusicSynth.ensureUnlocked().catch(() => {});
    if (activePlayingId === track.id && playbackState.isPlaying) {
      aiMusicSynth.pause();
    } else if (activePlayingId === track.id && !playbackState.isPlaying) {
      aiMusicSynth.resume();
    } else {
      aiMusicSynth.playTrack(
        track.id,
        track.genre,
        () => setActivePlayingId(null),
        track
      );
      setActivePlayingId(track.id);
    }
  };

  const handleExportTrack = async (track: AIMusicTrack) => {
    try {
      setIsExportingTrackId(track.id);
      toast.info(`Rendering "${track.title}.wav"...`);
      await aiMusicSynth.exportTrackAudioAsWav(track);
      toast.success(`Downloaded "${track.title}.wav"!`);
    } catch {
      toast.error('Failed to export audio');
    } finally {
      setIsExportingTrackId(null);
    }
  };

  const handleAutoGenerateLyrics = () => {
    const generated = `[Verse 1]
Walking down the city light
Rhythm moving in the night
Melodies ringing loud and clear
Chasing away every single fear

[Chorus]
This is our moment, this is our song
Singing together where we belong!
${selectedGenre} fire in the sky
We are unstoppable, reaching so high!

[Outro]
Yeah, feel the groove...`;

    setLyrics(generated);
    toast.success('Generated lyrics with verse and chorus!');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayedTracks = filterMode === 'downloaded' ? tracks.filter((t) => t.isDownloaded) : tracks;

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-4 pb-20">
      {/* Sleek Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" /> Music Studio
          </h2>
          <p className="text-xs text-muted-foreground">Suno AI Song & Multi-Track Engine</p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-muted p-0.5 border border-border text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterMode === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({tracks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('downloaded')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
              filterMode === 'downloaded'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Saved ({tracks.filter((t) => t.isDownloaded).length})
          </button>
        </div>
      </div>

      {/* Simple, Powerful Creator Card */}
      <form onSubmit={handleGenerate} className="rounded-2xl border border-border bg-card p-3 md:p-4 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your song... (e.g. Afrobeats summer anthem with saxophone)"
              className="h-10 px-3 pr-9 text-xs rounded-xl bg-background border-border"
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-xs transition-colors ${
                showAdvanced ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Customize Vocals, Lyrics & Style"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="h-10 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {isGenerating ? 'Creating...' : 'Create'}
          </Button>
        </div>

        {/* Quick Genre Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar py-0.5">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                selectedGenre === g
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Progress feedback when generating */}
        {isGenerating && (
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs animate-pulse text-purple-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> {generatingStep}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">Suno Engine</span>
          </div>
        )}

        {/* Collapsible Advanced Customizer */}
        {showAdvanced && (
          <div className="pt-3 border-t border-border/60 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Title (Optional)</label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Song name"
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Vocal Style</label>
                <select
                  disabled={isInstrumental}
                  value={vocalStyle}
                  onChange={(e) => setVocalStyle(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-md bg-background border border-border px-2 text-foreground disabled:opacity-50"
                >
                  {VOCAL_STYLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full h-8 text-xs rounded-md bg-background border border-border px-2 text-foreground"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsInstrumental(!isInstrumental)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                  isInstrumental
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                {isInstrumental ? '🎻 Instrumental Only' : '🎤 Singing Vocals Included'}
              </button>

              {!isInstrumental && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoGenerateLyrics}
                  className="h-7 text-xs text-emerald-400 hover:text-emerald-300 gap-1"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Lyrics
                </Button>
              )}
            </div>

            {!isInstrumental && (
              <Textarea
                rows={3}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Your lyrics here...&#10;&#10;[Chorus]&#10;Catchy chorus here..."
                className="text-xs font-mono bg-background resize-none px-3"
              />
            )}
          </div>
        )}
      </form>

      {/* Active Playing Console (Clean & Powerful) */}
      {playbackState.isPlaying && playbackState.currentTrack && (
        <div className="rounded-2xl border border-purple-500/40 bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md space-y-2.5 text-white animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={playbackState.currentTrack.coverUrl}
                alt=""
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-purple-500/30"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold truncate text-white">{playbackState.currentTrack.title}</h4>
                  <span className="text-[10px] text-purple-300 font-mono px-1.5 py-0.2 rounded bg-purple-500/20 shrink-0">
                    {playbackState.currentTrack.genre}
                  </span>
                </div>
                <p className="text-[11px] text-pink-300 truncate font-medium flex items-center gap-1 mt-0.5">
                  <Mic className="w-3 h-3 text-pink-400 shrink-0 animate-pulse" />
                  {playbackState.currentLyricLine || 'Melodic rhythm & bassline groove...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Minimalist Animated Sound Wave Visualizer */}
              <div className="hidden sm:flex items-center px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-500/20 mr-1">
                <SoundWaveVisualizer isPlaying={playbackState.isPlaying} barCount={12} height={16} />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMixer(!showMixer)}
                className={`h-7 px-2.5 rounded-xl text-xs gap-1 border ${
                  showMixer ? 'bg-purple-600 text-white border-purple-500' : 'text-purple-300 border-purple-500/40 hover:bg-purple-500/20'
                }`}
              >
                <Sliders className="w-3 h-3" />
                Mixer
              </Button>
              <Button
                size="sm"
                onClick={() => aiMusicSynth.pause()}
                className="h-7 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold gap-1 shadow-sm"
              >
                <Pause className="w-3 h-3 fill-current" />
                Pause
              </Button>
            </div>
          </div>

          {/* Collapsible Stem & Studio Boost Mixer */}
          {showMixer && (
            <div className="pt-2 border-t border-white/10 space-y-2 text-[10px] animate-in fade-in duration-150">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/20 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-pink-300 font-bold">Vocals</span>
                    <span className="font-mono text-white/70">{stemVolumes.vocals}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stemVolumes.vocals}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStemVolumes((prev) => ({ ...prev, vocals: val }));
                      aiMusicSynth.setStemVolume('vocals', val / 100);
                    }}
                    className="w-full accent-pink-500 h-1 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/20 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-cyan-300 font-bold">Beat</span>
                    <span className="font-mono text-white/70">{stemVolumes.beat}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stemVolumes.beat}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStemVolumes((prev) => ({ ...prev, beat: val }));
                      aiMusicSynth.setStemVolume('beat', val / 100);
                    }}
                    className="w-full accent-cyan-500 h-1 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-500/20 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-amber-300 font-bold">Bass</span>
                    <span className="font-mono text-white/70">{stemVolumes.bass}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stemVolumes.bass}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStemVolumes((prev) => ({ ...prev, bass: val }));
                      aiMusicSynth.setStemVolume('bass', val / 100);
                    }}
                    className="w-full accent-amber-500 h-1 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Master Volume Boost */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20">
                <span className="flex items-center gap-1 font-bold text-white">
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" /> Master Boost
                </span>
                <div className="flex items-center gap-2 w-36">
                  <input
                    type="range"
                    min="80"
                    max="220"
                    value={masterVolumeBoost}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMasterVolumeBoost(val);
                      aiMusicSynth.setMasterVolume(val / 100);
                    }}
                    className="w-full accent-pink-500 h-1 rounded cursor-pointer"
                  />
                  <span className="font-mono text-pink-300 font-bold min-w-8 text-right">
                    {masterVolumeBoost}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Track Library List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {displayedTracks.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-4">
            <CloudDownload className="w-6 h-6 text-muted-foreground/60 mx-auto mb-1.5" />
            <p className="text-xs font-semibold">No tracks found</p>
          </div>
        ) : (
          displayedTracks.map((track) => {
            const isPlaying = activePlayingId === track.id;

            return (
              <div
                key={track.id}
                className={`p-2.5 rounded-2xl bg-card border transition-all flex items-center justify-between gap-3 ${
                  isPlaying
                    ? 'border-purple-500 shadow-sm shadow-purple-500/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                {/* Artwork & Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 group">
                    <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handlePlayTrack(track)}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                        isPlaying ? 'bg-purple-900/60 opacity-100' : 'bg-black/40 opacity-90 group-hover:opacity-100'
                      }`}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-current animate-pulse" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                      {track.isDownloaded && (
                        <span title="Saved offline">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-semibold text-purple-400">{track.genre}</span>
                      <span>•</span>
                      <span className="font-mono">{formatSeconds(track.durationSeconds)}</span>
                      {!track.isInstrumental && (
                        <>
                          <span>•</span>
                          <span className="text-pink-400 font-semibold">Vocal</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Actions (Mixer, Download, Dropdown Menu) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleLike(track.id)}
                    className={`p-1.5 rounded-lg hover:bg-muted ${track.isLiked ? 'text-rose-500' : 'text-muted-foreground'}`}
                    title="Like"
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveStemTrack(track)}
                    className="h-7 px-2 text-[10px] font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1"
                    title="Stem Isolation Mixer"
                  >
                    <Sliders className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isExportingTrackId === track.id}
                    onClick={() => handleExportTrack(track)}
                    className="h-7 px-2 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
                    title="Download WAV file"
                  >
                    <Download className="w-3 h-3" />
                  </Button>

                  {/* Dropdown Menu for Secondary Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      {track.lyrics && (
                        <DropdownMenuItem onClick={() => setViewingLyricsTrack(track)} className="gap-2">
                          <FileText className="w-3.5 h-3.5 text-purple-400" /> View Lyrics
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setActiveCoverArtTrack(track)} className="gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Custom Cover Art
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUseInVideo(track)} className="gap-2">
                        <Film className="w-3.5 h-3.5 text-emerald-400" /> Use in Video
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPlayInVoiceRoom(track)} className="gap-2">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" /> Stream in Room
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShareToChat(track)} className="gap-2">
                        <Send className="w-3.5 h-3.5 text-purple-400" /> Share to Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: track.title,
                                text: `Listen to "${track.title}" on KAMATELA AI Music!`,
                                url: window.location.href,
                              });
                              return;
                            } catch {
                              // dismissed
                            }
                          }
                          navigator.clipboard?.writeText(window.location.href);
                          toast.success('Track link copied!');
                        }}
                        className="gap-2"
                      >
                        <Share2 className="w-3.5 h-3.5 text-muted-foreground" /> Share Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {track.isDownloaded ? (
                        <DropdownMenuItem
                          onClick={() => {
                            onRemoveDownloadedTrack?.(track.id);
                            toast.info(`Removed "${track.title}" from offline cache`);
                          }}
                          className="gap-2 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Cache
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            onDownloadTrack?.(track.id);
                            toast.success(`Saved "${track.title}" for offline playback!`);
                          }}
                          className="gap-2 text-emerald-400"
                        >
                          <CloudDownload className="w-3.5 h-3.5" /> Save Offline
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lyrics Viewer Modal */}
      {viewingLyricsTrack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate">{viewingLyricsTrack.title}</h3>
                <p className="text-[10px] text-muted-foreground">{viewingLyricsTrack.genre} • Synced Lyrics</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setViewingLyricsTrack(null)} className="h-7 px-2 text-xs">
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {viewingLyricsTrack.lyrics || 'No lyrics available for this track.'}
            </div>
          </div>
        </div>
      )}

      {/* Stem Isolation Modal */}
      {activeStemTrack && (
        <StemSeparationModal
          track={activeStemTrack}
          isOpen={Boolean(activeStemTrack)}
          onClose={() => setActiveStemTrack(null)}
        />
      )}

      {/* Cover Art Generator Modal */}
      {activeCoverArtTrack && (
        <CoverArtGeneratorModal
          track={activeCoverArtTrack}
          isOpen={Boolean(activeCoverArtTrack)}
          onClose={() => setActiveCoverArtTrack(null)}
          onUpdateCover={(trackId: string, newCoverUrl: string) => {
            onUpdateTrackCover(trackId, newCoverUrl);
            setActiveCoverArtTrack(null);
          }}
        />
      )}
    </div>
  );
};
