import React, { useState, useEffect } from 'react';
import { Play, Pause, X, SkipForward, SkipBack, Music, Volume2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiMusicSynth, type PlaybackState } from '@/utils/aiMusicSynth';
import { SoundWaveVisualizer } from './SoundWaveVisualizer';
import type { AIMusicTrack } from '@/types/kamatela';

interface FloatingAudioPlayerProps {
  tracks: AIMusicTrack[];
  onOpenTrackDetails?: (track: AIMusicTrack) => void;
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({
  tracks,
  onOpenTrackDetails,
}) => {
  const [playback, setPlayback] = useState<PlaybackState>(() => aiMusicSynth.getState());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = aiMusicSynth.subscribe((state) => {
      setPlayback(state);
      if (state.currentTrackId) {
        setIsDismissed(false);
      }
    });
    return unsubscribe;
  }, []);

  if (!playback.currentTrackId || !playback.currentTrack || isDismissed) {
    return null;
  }

  const { currentTrack, isPlaying } = playback;

  const handleTogglePlay = () => {
    aiMusicSynth.ensureUnlocked().catch(() => {});
    if (isPlaying) {
      aiMusicSynth.pause();
    } else {
      aiMusicSynth.resume();
    }
  };

  const handleNext = () => {
    aiMusicSynth.ensureUnlocked().catch(() => {});
    const currentIdx = tracks.findIndex((t) => t.id === playback.currentTrackId);
    const nextIdx = (currentIdx + 1) % tracks.length;
    const nextTrack = tracks[nextIdx];
    if (nextTrack) {
      aiMusicSynth.playTrack(nextTrack.id, nextTrack.genre, undefined, nextTrack);
    }
  };

  const handlePrev = () => {
    aiMusicSynth.ensureUnlocked().catch(() => {});
    const currentIdx = tracks.findIndex((t) => t.id === playback.currentTrackId);
    const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIdx];
    if (prevTrack) {
      aiMusicSynth.playTrack(prevTrack.id, prevTrack.genre, undefined, prevTrack);
    }
  };

  const fullTrack = tracks.find((t) => t.id === currentTrack.id);

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom duration-200">
      <div className="rounded-2xl p-2.5 bg-zinc-950/95 border border-purple-500/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2.5 text-white">
        {/* Cover thumbnail with spin effect */}
        <div
          onClick={() => fullTrack && onOpenTrackDetails?.(fullTrack)}
          className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-purple-500/30 cursor-pointer group shadow"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Track Title, Genre & Real-time Equalizer */}
        <div
          onClick={() => fullTrack && onOpenTrackDetails?.(fullTrack)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
              {currentTrack.genre}
            </span>
            <SoundWaveVisualizer isPlaying={isPlaying} barCount={8} height={10} colorClass="bg-purple-400" />
          </div>
          <p className="text-xs font-bold text-white truncate leading-tight mt-0.5">
            {currentTrack.title}
          </p>
          {playback.currentLyricLine && (
            <p className="text-[10px] text-pink-300 truncate italic mt-0.5 animate-pulse">
              🎙️ {playback.currentSection ? `${playback.currentSection} ` : ''}{playback.currentLyricLine}
            </p>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Dismiss Mini Player */}
          <button
            type="button"
            onClick={() => {
              aiMusicSynth.stop(true);
              setIsDismissed(true);
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300 ml-0.5 text-xs"
            title="Close Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
