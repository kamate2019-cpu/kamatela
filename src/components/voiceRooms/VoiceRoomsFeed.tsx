import React from 'react';
import { Radio, Users, Plus, Volume2, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VoiceRoom, User } from '@/types/kamatela';

interface VoiceRoomsFeedProps {
  rooms: VoiceRoom[];
  currentUser: User;
  onJoinRoom: (room: VoiceRoom) => void;
  onOpenCreateModal: () => void;
}

export const VoiceRoomsFeed: React.FC<VoiceRoomsFeedProps> = ({
  rooms,
  currentUser,
  onJoinRoom,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header with Start Room button */}
      <div className="p-3.5 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold text-foreground">Live Group Voice Rooms</h3>
        </div>

        <Button
          size="sm"
          onClick={onOpenCreateModal}
          className="h-8 px-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Start Room
        </Button>
      </div>

      {/* Voice Rooms List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {rooms.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground px-4 space-y-2">
            <Radio className="w-10 h-10 mx-auto stroke-[1.5] text-muted-foreground/60" />
            <p className="text-xs font-semibold">No live voice rooms active</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
              Be the first to host an interactive group audio discussion for your followers!
            </p>
            <Button
              size="sm"
              onClick={onOpenCreateModal}
              className="mt-2 text-xs rounded-full bg-emerald-500 text-white"
            >
              Start Room Now
            </Button>
          </div>
        ) : (
          rooms.map((room) => {
            const speakers = room.participants.filter(
              (p) => p.role === 'host' || p.role === 'speaker'
            );
            const listenerCount = room.participants.filter((p) => p.role === 'listener').length;

            return (
              <div
                key={room.id}
                onClick={() => onJoinRoom(room)}
                className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/80 transition-all cursor-pointer space-y-3 group shadow-sm"
              >
                {/* Topic and Live Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-background border border-border">
                      {room.topic}
                    </span>
                  </div>

                  <span className="text-[10px] text-muted-foreground">{room.createdAt}</span>
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                    {room.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {room.description}
                  </p>
                </div>

                {/* Host and Speakers Preview Avatars */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {/* Overlapping avatars */}
                    <div className="flex -space-x-2">
                      {speakers.slice(0, 4).map((s) => (
                        <div
                          key={s.user.id}
                          className="w-7 h-7 rounded-full overflow-hidden border-2 border-card bg-muted shrink-0"
                          title={s.user.name}
                        >
                          <img
                            src={s.user.avatar}
                            alt={s.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                      Host: {room.host.businessName || room.host.name}
                    </span>
                  </div>

                  {/* Participant stats and Join button */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {room.participants.length}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoinRoom(room);
                      }}
                      className="h-7 px-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
