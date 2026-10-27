import React from 'react';

interface SoundWaveVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  colorClass?: string;
  className?: string;
}

export const SoundWaveVisualizer: React.FC<SoundWaveVisualizerProps> = ({
  isPlaying,
  barCount = 14,
  height = 18,
  colorClass = 'bg-gradient-to-t from-purple-500 to-pink-400',
  className = '',
}) => {
  // Balanced acoustic height pattern
  const pattern = [30, 75, 45, 90, 60, 100, 70, 35, 85, 95, 50, 40, 80, 65, 30];

  return (
    <div
      className={`flex items-center gap-[2.5px] ${className}`}
      style={{ height: `${height}px` }}
      aria-label="Sound wave audio visualizer"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const barHeight = pattern[i % pattern.length];
        return (
          <div
            key={i}
            className={`w-[2px] rounded-full transition-all duration-150 ${colorClass} ${
              isPlaying ? 'animate-pulse' : 'opacity-30'
            }`}
            style={{
              height: isPlaying ? `${Math.max(4, (barHeight / 100) * height)}px` : '3px',
              animationDuration: isPlaying ? `${0.45 + (i % 4) * 0.15}s` : '0s',
              animationDelay: `${(i % 5) * 80}ms`,
            }}
          />
        );
      })}
    </div>
  );
};
