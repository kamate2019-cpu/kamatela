import React from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CallLog, User } from '@/types/kamatela';
import { mockUsers } from '@/services/kamatelaStore';
import { soundEffects } from '@/utils/audioEffects';

interface CallHistoryListProps {
  callLogs: CallLog[];
  onStartCall: (user: User, isVideo: boolean) => void;
  onSimulateIncomingCall?: (user: User, isVideo: boolean) => void;
  onClearLogs?: () => void;
}

export const CallHistoryList: React.FC<CallHistoryListProps> = ({
  callLogs,
  onStartCall,
  onSimulateIncomingCall,
  onClearLogs,
}) => {
  const formatDuration = (secs: number) => {
    if (secs === 0) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getPartnerUser = (log: CallLog): User => {
    return (
      Object.values(mockUsers).find((u) => u.id === log.partnerId) || {
        id: log.partnerId,
        name: log.partnerName,
        handle: '@' + log.partnerName.toLowerCase().replace(/\s+/g, '_'),
        avatar: log.partnerAvatar,
        bio: 'KAMATELA Contact',
        isBusiness: false,
        followersCount: 120,
        followingCount: 40,
        likesCount: 500,
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header with Clear button */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-foreground">Call Logs & Real Records</h3>
        </div>
        {callLogs.length > 0 && onClearLogs && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearLogs}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-400 gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </Button>
        )}
      </div>

      {/* Call Logs list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {callLogs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground px-4 space-y-2">
            <Clock className="w-10 h-10 mx-auto stroke-[1.5] opacity-50" />
            <p className="text-xs font-semibold">No recent calls yet</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
              Tap the phone or camera icon in any chat to start a real HD audio or video call!
            </p>
          </div>
        ) : (
          callLogs.map((log) => {
            const isMissed = log.status === 'missed';
            const partner = getPartnerUser(log);

            return (
              <div
                key={log.id}
                className="px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                  <img src={log.partnerAvatar} alt={log.partnerName} className="w-full h-full object-cover" />
                </div>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isMissed ? 'text-rose-400' : 'text-foreground'}`}>
                    {log.partnerName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    {/* Status icon */}
                    {isMissed ? (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : log.direction === 'outgoing' ? (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <PhoneIncoming className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}

                    <span>{log.timestamp}</span>
                    {log.durationSeconds > 0 && (
                      <span className="text-[10px] text-muted-foreground">({formatDuration(log.durationSeconds)})</span>
                    )}
                  </div>
                </div>

                {/* Quick Call-back Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {onSimulateIncomingCall && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSimulateIncomingCall(partner, log.type === 'video')}
                      className="h-8 px-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full border border-amber-500/30"
                      title="Simulate receiving an incoming call from this contact"
                    >
                      Receive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      soundEffects.unlock();
                      onStartCall(partner, false);
                    }}
                    className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full"
                    title="Call Back (Voice)"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      soundEffects.unlock();
                      onStartCall(partner, true);
                    }}
                    className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full"
                    title="Call Back (Video)"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
