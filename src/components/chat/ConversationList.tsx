import React, { useState } from 'react';
import { Search, Pin, CheckCheck, Check, MessageSquarePlus, Store, Users, Smartphone, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChatConversation } from '@/types/kamatela';

interface ConversationListProps {
  chats: ChatConversation[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onOpenSyncContacts?: () => void;
  onOpenQR?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onOpenSyncContacts,
  onOpenQR,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'business' | 'groups'>('all');

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participant.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'unread') return chat.unreadCount > 0;
    if (filterType === 'business') return chat.participant.isBusiness || chat.type === 'business';
    if (filterType === 'groups') return chat.type === 'group';

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden relative">
      {/* Search Bar */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations, businesses or contacts..."
            className="pl-9 h-9 text-xs bg-muted/50 border-border rounded-xl"
          />
        </div>

        {/* KAMATELA Chat-style Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filterType === 'unread'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setFilterType('business')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'business'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Store className="w-3 h-3" /> Businesses
          </button>
          <button
            type="button"
            onClick={() => setFilterType('groups')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'groups'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3 h-3" /> Groups
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {filteredChats.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground px-4">
            <p className="text-xs">No conversations match your filter</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors ${
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/40'
                }`}
              >
                {/* Avatar with Business / Status indicator */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-muted">
                    <img
                      src={chat.participant.avatar}
                      alt={chat.participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {chat.participant.isBusiness && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[9px] font-black border border-background">
                      B
                    </span>
                  )}
                </div>

                {/* Name & Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-bold text-xs text-foreground truncate">
                        {chat.participant.businessName || chat.participant.name}
                      </span>
                      {chat.participant.verified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {chat.lastTimestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-1">
                    <p className="text-[11px] text-muted-foreground truncate leading-tight flex-1 flex items-center gap-1">
                      {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                        <span className="text-[9px] px-1 rounded bg-secondary text-emerald-400 font-mono">
                          {chat.disappearingTimer}
                        </span>
                      )}
                      <span className="truncate">{chat.lastMessage}</span>
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        title="Chat messages cached in offline storage"
                      />
                      {chat.isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                      {chat.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating KAMATELA Chat Action Button (FAB) for Contacts */}
      <button
        type="button"
        onClick={onOpenSyncContacts || onNewChat}
        className="absolute bottom-16 right-4 w-12 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all z-20 group"
        title="Open Contacts"
      >
        <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Action Buttons: Sync Contacts, QR Code & New Chat */}
      <div className="p-3 border-t border-border flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={onOpenSyncContacts || onNewChat}
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold h-8"
          >
            <Users className="w-3.5 h-3.5" /> Contacts
          </Button>
          {onOpenQR && (
            <Button
              onClick={onOpenQR}
              variant="ghost"
              size="sm"
              className="rounded-full gap-1.5 border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs font-semibold h-8"
              title="Exchange Contact QR Codes"
            >
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </Button>
          )}
        </div>
        <Button
          onClick={onOpenSyncContacts || onNewChat}
          size="sm"
          className="rounded-full gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md h-8"
        >
          <MessageSquarePlus className="w-4 h-4" /> New Chat
        </Button>
      </div>
    </div>
  );
};
