import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  isMe: boolean;
  label?: string;
  waveform?: number[];
  durationSeconds?: number;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  isMe,
  label = 'Voice message',
  waveform,
  durationSeconds,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (durationSeconds) {
      setDuration(durationSeconds);
    }
  }, [durationSeconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.round(audio.duration));
      } else if (!durationSeconds) {
        setDuration(12);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [durationSeconds]);

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackSpeed;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(true);
          const maxSecs = duration || 12;
          const intervalMs = Math.round(1000 / playbackSpeed);
          const t = setInterval(() => {
            setCurrentTime((p) => {
              if (p >= maxSecs) {
                clearInterval(t);
                setIsPlaying(false);
                return 0;
              }
              return p + 1;
            });
          }, intervalMs);
        });
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bars = waveform && waveform.length > 0
    ? waveform
    : [35, 70, 45, 90, 60, 40, 80, 50, 75, 30, 85, 65, 40, 95, 55, 30];

  return (
    <div className="flex items-center gap-2.5 py-1 px-1 min-w-[230px]">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Play / Pause circle button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
          isMe
            ? 'bg-white text-emerald-600 hover:bg-white/90'
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Animated Waveform Visualizer */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-0.5 h-6">
          {bars.map((h, i) => {
            const totalBars = bars.length;
            const playedRatio = duration > 0 ? currentTime / duration : 0;
            const isPlayed = i / totalBars <= playedRatio;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isMe
                      ? 'bg-white'
                      : 'bg-emerald-500'
                    : isMe
                    ? 'bg-emerald-800/60'
                    : 'bg-muted-foreground/40'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, (h / 100) * 24)}px` : `${Math.max(4, (h / 100) * 16)}px`,
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
          <span>{isPlaying ? formatSecs(currentTime) : label}</span>
          <div className="flex items-center gap-1.5">
            <span>{formatSecs(duration || 12)}</span>
            <button
              type="button"
              onClick={toggleSpeed}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full transition-colors ${
                isMe
                  ? 'bg-emerald-800/60 hover:bg-emerald-800 text-white'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
