import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  isMe: boolean;
  label?: string;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  isMe,
  label = 'Voice message',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.round(audio.duration));
      } else {
        setDuration(12); // fallback display
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
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Play simulated timer if blob audio is empty
          setIsPlaying(true);
          const t = setInterval(() => {
            setCurrentTime((p) => {
              if (p >= 8) {
                clearInterval(t);
                setIsPlaying(false);
                return 0;
              }
              return p + 1;
            });
          }, 1000);
        });
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2.5 py-1 px-1 min-w-[210px]">
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
          {[35, 70, 45, 90, 60, 40, 80, 50, 75, 30, 85, 65, 40, 95, 55, 30].map((h, i) => {
            const playedRatio = duration > 0 ? currentTime / duration : 0;
            const isPlayed = i / 16 <= playedRatio;
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
          <span>{formatSecs(duration || 12)}</span>
        </div>
      </div>
    </div>
  );
};
