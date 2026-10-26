import React, { useState } from 'react';
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
  Check,
  Disc3,
  Download,
  Image as ImageIcon,
  HardDrive,
  CheckCircle2,
  Trash2,
  CloudDownload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { AIMusicTrack, User } from '@/types/kamatela';
import { aiMusicSynth } from '@/utils/aiMusicSynth';
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
  currentUser,
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
  const [lyrics, setLyrics] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [viewingLyricsTrack, setViewingLyricsTrack] = useState<AIMusicTrack | null>(null);
  const [activeStemTrack, setActiveStemTrack] = useState<AIMusicTrack | null>(null);
  const [activeCoverArtTrack, setActiveCoverArtTrack] = useState<AIMusicTrack | null>(null);
  const [isExportingTrackId, setIsExportingTrackId] = useState<string | null>(null);

  const GENRES = [
    'Afrobeats',
    'Amapiano',
    'Lo-Fi Chill',
    'Hip-Hop',
    'R&B / Soul',
    'EDM / Dance',
    'Cinematic',
    'Latin Reggaeton',
  ];

  const MOODS = ['Upbeat', 'Chill', 'Energetic', 'Dreamy', 'Dark'];

  const PROMPT_INSPIRATIONS = [
    'Afrobeats summer anthem with log drum groove and uplifting saxophone',
    'Lo-fi hip-hop chill study beats with warm electric piano and vinyl crackle',
    'Kinshasa Amapiano bassline with rhythmic shaker and hypnotic piano keys',
    'High-energy trap beat for luxury sneaker commercial with 808 bass',
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please describe the music you want to generate');
      return;
    }

    setIsGenerating(true);
    setGeneratingStep('Analyzing music prompt and genre acoustics...');

    setTimeout(() => {
      setGeneratingStep('Synthesizing basslines, harmony chords and rhythm...');
    }, 800);

    setTimeout(() => {
      setGeneratingStep(isInstrumental ? 'Arranging instrumental master track...' : 'Composing AI vocal harmonies and lyrics...');
    }, 1600);

    setTimeout(() => {
      const newTrack = onGenerateTrack({
        title: customTitle.trim() || undefined,
        prompt: prompt.trim(),
        genre: selectedGenre,
        mood: selectedMood,
        isInstrumental,
        lyrics: !isInstrumental ? lyrics : undefined,
      });

      setIsGenerating(false);
      setGeneratingStep('');
      setPrompt('');
      setCustomTitle('');
      setLyrics('');
      toast.success(`Generated "${newTrack.title}"! Playing preview now.`);

      // Auto play newly generated track
      handlePlayTrack(newTrack);
    }, 2400);
  };

  const handlePlayTrack = (track: AIMusicTrack) => {
    if (activePlayingId === track.id) {
      aiMusicSynth.stop();
      setActivePlayingId(null);
    } else {
      aiMusicSynth.playTrack(track.id, track.genre, () => {
        setActivePlayingId(null);
      });
      setActivePlayingId(track.id);
      toast.info(`Playing: ${track.title}`);
    }
  };

  const handleExportTrack = async (track: AIMusicTrack) => {
    try {
      setIsExportingTrackId(track.id);
      toast.info(`Rendering master audio file for "${track.title}"...`);
      await aiMusicSynth.exportTrackAudioAsWav(track);
      toast.success(`Downloaded "${track.title}.wav" successfully!`);
    } catch (err) {
      toast.error('Failed to export audio file');
    } finally {
      setIsExportingTrackId(null);
    }
  };

  const handleAutoGenerateLyrics = () => {
    const generated = `[Verse 1]
Midnight rhythm through the air
Electric bass beyond compare
KAMATELA groove in motion
Flowing like a golden ocean

[Chorus]
Feel the sound, feel the light
Dancing till the morning bright
${selectedGenre} heart and soul
Making all the broken whole!

[Outro]
Echoes fading into the night...`;

    setLyrics(generated);
    setShowLyricsEditor(true);
    toast.success('AI Lyrics generated! You can edit them below.');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-6 pb-20">
      {/* Studio Header Banner */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-emerald-950/40 border border-purple-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Suno AI Music Engine Integrated
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            AI Music & Soundtrack Studio
          </h2>
          <p className="text-xs text-white/70 max-w-lg">
            Generate original, copyright-free songs, beats, and commercial jingles with AI vocals.
            Separate stems, customize album covers, export WAV files, and stream in voice rooms.
          </p>
        </div>
      </div>

      {/* Creation Studio Card */}
      <div className="bg-card rounded-2xl border border-border p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-foreground">Generate New Track</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Unlimited Creator Generations</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Song Description / Prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Music Description or Prompt</Label>
            <Textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Afrobeats summer banger with upbeat log drums, saxophone solo, and smooth female vocals..."
              className="text-xs resize-none bg-background px-3"
            />
            {/* Quick Inspiration chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pt-1 no-scrollbar">
              <span className="text-[10px] text-muted-foreground shrink-0 font-medium">Try:</span>
              {PROMPT_INSPIRATIONS.map((ins, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(ins)}
                  className="px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-[10px] text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                >
                  {ins.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* Genre Selection Chips */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Music Style / Genre</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedGenre === g
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-105'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mood & Instrumental Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Vibe & Mood</Label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full h-8 text-xs rounded-md bg-background border border-border px-2 text-foreground focus:outline-none"
              >
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Track Type</Label>
              <button
                type="button"
                onClick={() => setIsInstrumental(!isInstrumental)}
                className={`w-full h-8 px-2 rounded-md text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  isInstrumental
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                {isInstrumental ? '🎻 Instrumental (No Vocals)' : '🎤 With AI Vocals'}
              </button>
            </div>
          </div>

          {/* Lyrics Option (if not instrumental) */}
          {!isInstrumental && (
            <div className="space-y-2 pt-1 border-t border-border/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowLyricsEditor(!showLyricsEditor)}
                  className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showLyricsEditor ? 'Hide Custom Lyrics' : 'Write or Generate Custom Lyrics'}
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoGenerateLyrics}
                  className="h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 gap-1"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Lyrics
                </Button>
              </div>

              {showLyricsEditor && (
                <Textarea
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="[Verse 1]&#10;Your lyrics here...&#10;&#10;[Chorus]&#10;Catchy hook here..."
                  className="text-xs font-mono bg-background resize-none px-3"
                />
              )}
            </div>
          )}

          {/* Generation Progress Animation */}
          {isGenerating && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <Disc3 className="w-4 h-4 animate-spin text-purple-400" />
                  {generatingStep}
                </span>
                <span className="text-[10px] text-purple-400/80 font-mono">Suno V3 Engine</span>
              </div>
              <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 text-white font-bold text-xs gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.99] transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating Track with Suno AI...' : 'Create Track Now'}
          </Button>
        </form>
      </div>

      {/* Generated Tracks Library */}
      <div className="space-y-3">
        {/* Offline Storage Status Banner */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                Offline Audio Storage
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Tracks downloaded here are cached into browser storage for instant playback without internet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
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
                Downloaded ({tracks.filter((t) => t.isDownloaded).length})
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-foreground">
              {filterMode === 'downloaded' ? 'Offline Cached Tracks' : 'Track Library & Master Cuts'}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {filterMode === 'downloaded'
              ? `${tracks.filter((t) => t.isDownloaded).length} Cached on Device`
              : `${tracks.length} Tracks Ready`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(filterMode === 'downloaded' ? tracks.filter((t) => t.isDownloaded) : tracks).length === 0 ? (
            <div className="col-span-full py-10 text-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-6">
              <CloudDownload className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-xs font-semibold">No offline tracks downloaded yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tap the "Save Offline" button on any track below to cache it for offline listening.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode('all')}
                className="mt-3 text-xs border border-white/60 text-white hover:bg-white/10 rounded-xl"
              >
                Browse All Tracks
              </Button>
            </div>
          ) : (
            (filterMode === 'downloaded' ? tracks.filter((t) => t.isDownloaded) : tracks).map((track) => {
              const isPlaying = activePlayingId === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-2xl bg-card border transition-all ${
                    isPlaying
                      ? 'border-purple-500 shadow-md shadow-purple-500/10'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Cover Artwork with Play/Pause button */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0 group">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() => handlePlayTrack(track)}
                        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                          isPlaying
                            ? 'bg-purple-900/60 opacity-100'
                            : 'bg-black/40 opacity-90 group-hover:opacity-100'
                        }`}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white fill-current animate-pulse" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                          {track.isDownloaded && (
                            <span
                              className="shrink-0 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-0.5"
                              title="Cached in device offline storage"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" /> Offline
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleLike(track.id)}
                          className={`shrink-0 ${track.isLiked ? 'text-rose-500' : 'text-muted-foreground'}`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${track.isLiked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/20">
                          {track.genre}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {formatSeconds(track.durationSeconds)}
                        </span>
                        {track.isInstrumental && (
                          <span className="text-amber-400 font-semibold">Instrumental</span>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                        "{track.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Animated Waveform when Playing */}
                  {isPlaying && (
                    <div className="mt-2.5 px-2 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <div className="flex-1 flex items-center gap-0.5 h-4">
                        {[30, 75, 40, 90, 60, 35, 80, 50, 95, 45, 70, 30, 85, 40, 60].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-purple-400 rounded-full animate-pulse"
                            style={{
                              height: `${(h / 100) * 16}px`,
                              animationDelay: `${i * 60}ms`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-purple-300">
                        {track.isDownloaded ? 'Offline Cache' : 'Live Synthesis'}
                      </span>
                    </div>
                  )}

                  {/* Middle Action Bar: Stems, AI Cover Art, Offline Cache Toggle, Download WAV */}
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* Stem Splitter */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveStemTrack(track)}
                        className="h-6 px-2 text-[10px] font-semibold text-purple-400 border-purple-500/30 hover:bg-purple-500/10 gap-1"
                        title="Isolate Vocals, Beat & Bassline Stems"
                      >
                        <Sliders className="w-3 h-3" /> Stems
                      </Button>

                      {/* AI Cover Art */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveCoverArtTrack(track)}
                        className="h-6 px-2 text-[10px] font-semibold text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1"
                        title="Generate custom AI cover art"
                      >
                        <ImageIcon className="w-3 h-3" /> Cover Art
                      </Button>

                      {/* Offline Download Toggle */}
                      {track.isDownloaded ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onRemoveDownloadedTrack?.(track.id);
                            toast.info(`Removed "${track.title}" from offline device storage`);
                          }}
                          className="h-6 px-2 text-[10px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1 border border-rose-500/20"
                          title="Remove from offline cache"
                        >
                          <Trash2 className="w-3 h-3" /> Cached
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onDownloadTrack?.(track.id);
                            toast.success(`Saved "${track.title}" for offline playback!`);
                          }}
                          className="h-6 px-2 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 border border-emerald-500/20"
                          title="Download for offline playback without internet"
                        >
                          <CloudDownload className="w-3 h-3" /> Save Offline
                        </Button>
                      )}
                    </div>

                    {/* Export Audio File (.WAV) */}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isExportingTrackId === track.id}
                      onClick={() => handleExportTrack(track)}
                      className="h-6 px-2 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 border border-emerald-500/20"
                      title="Download Master WAV Audio File"
                    >
                      <Download className="w-3 h-3" />
                      {isExportingTrackId === track.id ? 'Exporting...' : 'WAV'}
                    </Button>
                  </div>

                {/* Bottom Cross-App Integration Action Buttons */}
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between gap-1">
                  {/* Lyrics modal preview */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingLyricsTrack(track)}
                    className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                  >
                    <FileText className="w-3 h-3" /> Lyrics
                  </Button>

                  <div className="flex items-center gap-1">
                    {/* Use in Video */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUseInVideo(track)}
                      className="h-7 px-2 text-[10px] font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                      title="Use track as soundtrack in Video Feed"
                    >
                      <Film className="w-3 h-3" /> In Video
                    </Button>

                    {/* Stream in Voice Room */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPlayInVoiceRoom(track)}
                      className="h-7 px-2 text-[10px] font-semibold text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 gap-1"
                      title="Broadcast track in Voice Room"
                    >
                      <Radio className="w-3 h-3" /> Voice Room
                    </Button>

                    {/* Send to WhatsApp Chat */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShareToChat(track)}
                      className="h-7 px-2 text-[10px] font-semibold text-purple-400 border-purple-500/30 hover:bg-purple-500/10 gap-1"
                      title="Share track card to Chat"
                    >
                      <Send className="w-3 h-3" /> Chat
                    </Button>

                    {/* Native Web Share API */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `${track.title} - KAMATELA AI Music`,
                              text: `Listen to "${track.title}" (${track.genre}) generated with Suno AI on KAMATELA Super App!`,
                              url: window.location.href,
                            });
                            toast.success('Track shared via native share!');
                            return;
                          } catch {
                            // dismissed
                          }
                        }
                        navigator.clipboard?.writeText(window.location.href);
                        toast.success('Track link copied to clipboard!');
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground border-border"
                      title="Share via native device apps"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Lyrics Viewer Modal */}
      {viewingLyricsTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 space-y-3 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-border pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{viewingLyricsTrack.title}</h3>
                <p className="text-[10px] text-muted-foreground">Generated Lyrics • {viewingLyricsTrack.genre}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingLyricsTrack(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-2xl border border-border/50">
              {viewingLyricsTrack.lyrics || 'No lyrics provided for this track.'}
            </div>

            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(viewingLyricsTrack.lyrics || '');
                toast.success('Lyrics copied to clipboard!');
              }}
              className="w-full h-8 text-xs font-semibold rounded-xl bg-purple-600 text-white"
            >
              Copy Lyrics
            </Button>
          </div>
        </div>
      )}

      {/* Stem Separation Modal */}
      <StemSeparationModal
        track={activeStemTrack}
        isOpen={Boolean(activeStemTrack)}
        onClose={() => setActiveStemTrack(null)}
      />

      {/* AI Cover Art Studio Modal */}
      <CoverArtGeneratorModal
        track={activeCoverArtTrack}
        isOpen={Boolean(activeCoverArtTrack)}
        onClose={() => setActiveCoverArtTrack(null)}
        onUpdateCover={onUpdateTrackCover}
      />
    </div>
  );
};
