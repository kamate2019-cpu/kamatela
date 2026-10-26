import React, { useState } from 'react';
import { Send, Music, Check, User, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { AIMusicTrack, ChatConversation } from '@/types/kamatela';

interface ShareSongModalProps {
  track: AIMusicTrack | null;
  chats: ChatConversation[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmShare: (chatId: string, customMessage: string, track: AIMusicTrack) => void;
}

export const ShareSongModal: React.FC<ShareSongModalProps> = ({
  track,
  chats,
  isOpen,
  onClose,
  onConfirmShare,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !track) return null;

  const filteredChats = chats.filter((c) => {
    const name = c.groupName || c.participant.businessName || c.participant.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSend = () => {
    if (!selectedChatId) {
      toast.error('Please select a chat or contact');
      return;
    }
    const finalMsg = customMessage.trim() || `🎵 Check out my new AI track: "${track.title}" (${track.genre})!`;
    onConfirmShare(selectedChatId, finalMsg, track);
    toast.success(`Shared "${track.title}" to conversation!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 space-y-4 shadow-2xl text-foreground flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Share Track to Chat</h3>
              <p className="text-[10px] text-muted-foreground">Select a contact or group</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Selected Song Preview Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-semibold">
                {track.genre}
              </span>
              <span className="text-[10px] text-muted-foreground">{track.mood}</span>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="text-xs h-8 pl-8 bg-background"
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[140px] max-h-[220px] pr-1">
          {filteredChats.map((c) => {
            const isSelected = selectedChatId === c.id;
            const name = c.groupName || c.participant.businessName || c.participant.name;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedChatId(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/15 border-purple-500 shadow-sm'
                    : 'bg-muted/20 border-border/60 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
                    <img src={c.participant.avatar} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Custom Message */}
        <div className="space-y-1">
          <Textarea
            rows={2}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={`Add a message: "Listen to my new AI song: '${track.title}'"`}
            className="text-xs resize-none bg-background px-3"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            className="h-8 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5 shadow-md shadow-purple-600/25"
          >
            <Send className="w-3.5 h-3.5" /> Send to Chat
          </Button>
        </div>
      </div>
    </div>
  );
};
