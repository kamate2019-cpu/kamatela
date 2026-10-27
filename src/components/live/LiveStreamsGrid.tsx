import React from 'react';
import { Radio, Users, Flame, Plus, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveStreamItem, User } from '@/types/kamatela';

interface LiveStreamsGridProps {
  streams: LiveStreamItem[];
  currentUser: User;
  onSelectStream: (stream: LiveStreamItem) => void;
  onGoLive: () => void;
}

export const LiveStreamsGrid: React.FC<LiveStreamsGridProps> = ({
  streams,
  currentUser,
  onSelectStream,
  onGoLive,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner with Go Live CTA */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600/20 via-pink-600/20 to-purple-600/20 border border-red-500/30 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-foreground truncate flex items-center gap-1.5">
              KAMATELA Live Streams
              <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Watch creator broadcasts, send gifts, shop live & chat in real time.
            </p>
          </div>
        </div>

        <Button
          onClick={onGoLive}
          className="h-9 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md gap-1.5 shrink-0"
        >
          <Radio className="w-3.5 h-3.5" /> Go Live
        </Button>
      </div>

      {/* Grid of Active Live Streams */}
      <div className="grid grid-cols-2 gap-3">
        {streams.map((stream) => (
          <div
            key={stream.id}
            onClick={() => onSelectStream(stream)}
            className="group relative rounded-2xl overflow-hidden bg-card border border-border/80 shadow-sm hover:shadow-md transition-all cursor-pointer aspect-[3/4] flex flex-col justify-between"
          >
            {/* Background Thumbnail */}
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none" />

            {/* Top Badges: Category & LIVE */}
            <div className="relative z-10 p-2.5 flex items-center justify-between gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
              </span>

              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold">
                <Users className="w-2.5 h-2.5 text-emerald-400" />
                <span>{stream.viewerCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="relative z-10 p-2.5 space-y-1.5">
              <span className="inline-block px-1.5 py-0.2 rounded bg-white/20 backdrop-blur-md text-white text-[9px] font-bold">
                {stream.category}
              </span>

              <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">
                {stream.title}
              </h4>

              <div className="flex items-center gap-1.5 pt-0.5">
                <img
                  src={stream.host.avatar}
                  alt={stream.host.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400 shrink-0"
                />
                <span className="text-[11px] font-semibold text-white/90 truncate flex-1">
                  {stream.host.name}
                </span>
                {stream.host.verified && <span className="text-emerald-400 text-[10px]">✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
