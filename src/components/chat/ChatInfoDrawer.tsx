import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Clock,
  Image as ImageIcon,
  FileText,
  MapPin,
  Star,
  BellOff,
  Bell,
  Trash2,
  Ban,
  Phone,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  User as UserIcon,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatConversation, User } from '@/types/kamatela';
import { toast } from 'sonner';

interface ChatInfoDrawerProps {
  chat: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  onSetDisappearingTimer: (timer: 'off' | '24h' | '7d' | '90d') => void;
  onClearHistory: () => void;
  onBlockUser?: () => void;
  onStartCall: (isVideo: boolean) => void;
  onSelectMessage?: (messageId: string) => void;
}

export const ChatInfoDrawer: React.FC<ChatInfoDrawerProps> = ({
  chat,
  isOpen,
  onClose,
  onSetDisappearingTimer,
  onClearHistory,
  onBlockUser,
  onStartCall,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs' | 'starred'>('media');
  const [isMuted, setIsMuted] = useState(chat.isMuted || false);

  if (!isOpen) return null;

  const contact = chat.participant;
  const disappearingTimer = chat.disappearingTimer || 'off';

  // Gather media and documents from messages
  const mediaMessages = chat.messages.filter(
    (m) => (m.mediaType === 'image' || m.mediaType === 'song') && !m.isDeleted
  );
  const docMessages = chat.messages.filter(
    (m) => m.mediaType === 'document' && !m.isDeleted
  );
  const starredMessages = chat.messages.filter((m) => m.isStarred && !m.isDeleted);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(!isMuted ? 'Notifications muted for this chat' : 'Notifications unmuted');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Drawer Panel */}
      <div className="w-full max-w-sm md:max-w-md bg-card h-full flex flex-col border-l border-border shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-sm">Contact Info</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">KAMATELA</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {/* Section 1: Hero Avatar & Identity */}
          <div className="flex flex-col items-center py-6 px-4 text-center bg-gradient-to-b from-muted/30 to-transparent">
            <div className="relative mb-3">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-lg"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <h3 className="text-lg font-bold flex items-center gap-1.5 text-foreground">
              {contact.name}
              {contact.verified && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              )}
            </h3>

            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {contact.businessPhone || '+225 07 88 99 00 11'}
            </p>

            <p className="text-xs text-muted-foreground/90 mt-2 px-4 italic line-clamp-2">
              "{contact.bio || 'Available on KAMATELA SuperApp'}"
            </p>

            {/* Quick Call Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-4 w-full">
              <button
                type="button"
                onClick={() => onStartCall(false)}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-3 bg-secondary/80 hover:bg-secondary rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-medium">Audio Call</span>
              </button>

              <button
                type="button"
                onClick={() => onStartCall(true)}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-3 bg-secondary/80 hover:bg-secondary rounded-xl transition-all"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-medium">Video Call</span>
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-3 bg-secondary/80 hover:bg-secondary rounded-xl transition-all"
              >
                {isMuted ? (
                  <BellOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bell className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-[11px] font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: End-to-End Encryption Banner */}
          <div className="p-4 flex items-start gap-3 bg-emerald-950/20 border-y border-emerald-900/30">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-300">End-to-End Encrypted</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Messages and calls stay between you and this contact. No third party or even KAMATELA can read or listen.
              </p>
            </div>
          </div>

          {/* Section 3: Disappearing Messages Control */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold">Disappearing Messages</p>
                  <p className="text-[11px] text-muted-foreground">Auto-delete new messages after time</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                {disappearingTimer}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['off', '24h', '7d', '90d'] as const).map((timer) => (
                <button
                  key={timer}
                  type="button"
                  onClick={() => {
                    onSetDisappearingTimer(timer);
                    toast.info(`Disappearing messages set to: ${timer.toUpperCase()}`);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    disappearingTimer === timer
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                  }`}
                >
                  {timer === 'off' ? 'Off' : timer.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Media, Docs & Starred Messages */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Media, Links & Docs</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {mediaMessages.length + docMessages.length} items
              </span>
            </div>

            {/* Media Tabs */}
            <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setActiveMediaTab('media')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMediaTab === 'media' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Media ({mediaMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('docs')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMediaTab === 'docs' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Docs ({docMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('starred')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeMediaTab === 'starred' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Starred ({starredMessages.length})
              </button>
            </div>

            {/* Tab 1: Media Preview Grid */}
            {activeMediaTab === 'media' && (
              <div>
                {mediaMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No shared photos or audio tracks</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaMessages.map((m) => (
                      <div
                        key={m.id}
                        className="aspect-square rounded-lg overflow-hidden border border-border/80 bg-muted relative group"
                      >
                        <img
                          src={m.mediaUrl || m.songSnippet?.coverUrl || m.productSnippet?.imageUrl}
                          alt="media"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {m.mediaType === 'song' && (
                          <span className="absolute bottom-1 left-1 bg-black/60 rounded px-1 text-[9px] text-white">
                            Song
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Docs List */}
            {activeMediaTab === 'docs' && (
              <div className="space-y-2">
                {docMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No shared documents</p>
                ) : (
                  docMessages.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50 border border-border"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 font-bold text-xs">
                        PDF
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {m.documentSnippet?.fileName || m.text}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.documentSnippet?.fileSize || '1.2 MB'} • {m.timestamp}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => toast.success('Document download initiated')}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Starred Messages */}
            {activeMediaTab === 'starred' && (
              <div className="space-y-2">
                {starredMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No starred messages in this chat</p>
                ) : (
                  starredMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-emerald-400">
                          {m.senderId === chat.participant.id ? chat.participant.name : 'You'}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{m.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/90 line-clamp-2">{m.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section 5: Danger Actions (Clear, Block) */}
          <div className="p-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all messages in this chat?')) {
                  onClearHistory();
                  toast.success('Chat history cleared');
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-500/10 text-red-400 transition-colors text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat History</span>
            </button>

            {onBlockUser && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBlockUser();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-500/10 text-red-500 transition-colors text-xs font-semibold"
              >
                <Ban className="w-4 h-4" />
                <span>Block {contact.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
