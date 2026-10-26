import React, { useState } from 'react';
import type {
  ChatConversation,
  UserStory,
  User,
  CallLog,
  VoiceRoom,
  AIMusicTrack
} from '@/types/kamatela';
import { StoriesBar } from './StoriesBar';
import { StoryViewerModal } from './StoryViewerModal';
import { ConversationList } from './ConversationList';
import { ChatRoom } from './ChatRoom';
import { CallOverlayModal } from './CallOverlayModal';
import { CallHistoryList } from './CallHistoryList';
import { VoiceRoomsFeed } from '@/components/voiceRooms/VoiceRoomsFeed';
import { CreateVoiceRoomModal } from '@/components/voiceRooms/CreateVoiceRoomModal';
import { LiveVoiceRoomModal } from '@/components/voiceRooms/LiveVoiceRoomModal';
import { IncomingCallModal } from './IncomingCallModal';
import { ContactSyncModal } from './ContactSyncModal';
import { ContactQRModal } from './ContactQRModal';
import { MessageSquare, PhoneCall, Radio, Smartphone, QrCode } from 'lucide-react';

interface ChatModuleProps {
  chats: ChatConversation[];
  stories: UserStory[];
  callLogs: CallLog[];
  voiceRooms: VoiceRoom[];
  currentUser: User;
  onSendMessage: (chatId: string, text: string, mediaType?: 'image' | 'voice' | 'product' | 'song' | 'call_memo', mediaUrl?: string) => void;
  onAddStory: (mediaUrl: string, caption?: string) => void;
  onLogCall: (log: Omit<CallLog, 'id'>) => void;
  onClearCallLogs: () => void;
  onCreateVoiceRoom: (title: string, topic: string, description: string) => string;
  onJoinVoiceRoom: (roomId: string, user: User, role?: 'speaker' | 'listener') => void;
  onLeaveVoiceRoom: (roomId: string, userId: string) => void;
  onToggleVoiceRoomMute: (roomId: string, userId: string) => void;
  onRaiseHandInVoiceRoom: (roomId: string, userId: string) => void;
  onPromoteVoiceParticipant: (roomId: string, userId: string) => void;
  onDemoteVoiceParticipant: (roomId: string, userId: string) => void;
  onOpenProductDetail?: (productId: string) => void;
  initialChatId?: string | null;
  musicTracks?: AIMusicTrack[];
  onDeductCoins?: (amount: number) => boolean;
  onAddCoins?: (amount: number, channel?: string) => void;
  onSaveCallMemoToChat?: (
    partnerId: string,
    memo: {
      partnerName: string;
      callType: 'voice' | 'video';
      durationSeconds: number;
      audioUrl?: string;
    }
  ) => void;
}

export const ChatModule: React.FC<ChatModuleProps> = ({
  chats,
  stories,
  callLogs,
  voiceRooms,
  currentUser,
  onSendMessage,
  onAddStory,
  onLogCall,
  onClearCallLogs,
  onCreateVoiceRoom,
  onJoinVoiceRoom,
  onLeaveVoiceRoom,
  onToggleVoiceRoomMute,
  onRaiseHandInVoiceRoom,
  onPromoteVoiceParticipant,
  onDemoteVoiceParticipant,
  onOpenProductDetail,
  initialChatId,
  musicTracks,
  onDeductCoins,
  onAddCoins,
  onSaveCallMemoToChat,
}) => {
  const [subTab, setSubTab] = useState<'chats' | 'voice_rooms' | 'calls'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [callTarget, setCallTarget] = useState<{ user: User; isVideo: boolean } | null>(null);
  const [incomingCallTarget, setIncomingCallTarget] = useState<{ user: User; isVideo: boolean } | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalTab, setQrModalTab] = useState<'my_code' | 'scan'>('my_code');

  // Voice Room Modals state
  const [activeVoiceRoomId, setActiveVoiceRoomId] = useState<string | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeVoiceRoom = voiceRooms.find((r) => r.id === activeVoiceRoomId) || null;

  const handleStartCall = (user: User, isVideo: boolean) => {
    setCallTarget({ user, isVideo });
  };

  const handleSimulateIncomingCall = (caller: User, isVideo: boolean) => {
    setIncomingCallTarget({ user: caller, isVideo });
  };

  const handleAcceptIncomingCall = (callType: 'voice' | 'video') => {
    if (incomingCallTarget) {
      setCallTarget({
        user: incomingCallTarget.user,
        isVideo: callType === 'video',
      });
      setIncomingCallTarget(null);
    }
  };

  const handleDeclineIncomingCall = () => {
    if (incomingCallTarget) {
      onLogCall({
        partnerId: incomingCallTarget.user.id,
        partnerName: incomingCallTarget.user.businessName || incomingCallTarget.user.name,
        partnerAvatar: incomingCallTarget.user.avatar,
        type: incomingCallTarget.isVideo ? 'video' : 'voice',
        direction: 'incoming',
        status: 'declined',
        durationSeconds: 0,
        timestamp: 'Just now',
      });
      setIncomingCallTarget(null);
    }
  };

  const handleJoinVoiceRoom = (room: VoiceRoom) => {
    onJoinVoiceRoom(room.id, currentUser, 'listener');
    setActiveVoiceRoomId(room.id);
  };

  const handleCreateVoiceRoom = (title: string, topic: string, description: string) => {
    const newRoomId = onCreateVoiceRoom(title, topic, description);
    setActiveVoiceRoomId(newRoomId);
  };

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-3">
      {/* Top WhatsApp & Rooms Navigation (Chats / Voice Rooms / Calls) */}
      {!activeChat && (
        <div className="flex items-center justify-between border-b border-border/80 px-1 pb-1">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => setSubTab('chats')}
              className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                subTab === 'chats'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Chats
            </button>

            <button
              type="button"
              onClick={() => setSubTab('voice_rooms')}
              className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                subTab === 'voice_rooms'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="w-4 h-4" /> Voice Rooms ({voiceRooms.length})
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setSubTab('calls')}
              className={`flex items-center gap-1.5 pb-2 text-xs font-bold border-b-2 transition-all shrink-0 ${
                subTab === 'calls'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <PhoneCall className="w-4 h-4" /> Calls ({callLogs.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setQrModalTab('scan');
                setIsQRModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 transition-all shadow-sm"
              title="Scan or Show Contact QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all shadow-sm"
              title="Sync device phone contacts"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Contacts</span>
            </button>
            <span className="text-[10px] text-muted-foreground hidden md:inline">End-to-end Encrypted</span>
          </div>
        </div>
      )}

      {/* 24-hour Status / Stories Carousel */}
      {!activeChat && subTab === 'chats' && (
        <StoriesBar
          stories={stories}
          onSelectStory={(s) => setSelectedStory(s)}
          onAddStory={onAddStory}
        />
      )}

      {/* Main Tab Interface */}
      {activeChat ? (
        <ChatRoom
          chat={activeChat}
          currentUserId={currentUser.id}
          onBack={() => setActiveChatId(null)}
          onSendMessage={onSendMessage}
          onStartCall={handleStartCall}
          onSimulateIncomingCall={handleSimulateIncomingCall}
          onOpenProductDetail={onOpenProductDetail}
        />
      ) : subTab === 'chats' ? (
        <div className="h-[calc(100vh-14rem)] md:h-[620px]">
          <ConversationList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => setActiveChatId(id)}
            onNewChat={() => setIsSyncModalOpen(true)}
            onOpenSyncContacts={() => setIsSyncModalOpen(true)}
            onOpenQR={() => {
              setQrModalTab('scan');
              setIsQRModalOpen(true);
            }}
          />
        </div>
      ) : subTab === 'voice_rooms' ? (
        <div className="h-[calc(100vh-14rem)] md:h-[620px]">
          <VoiceRoomsFeed
            rooms={voiceRooms}
            currentUser={currentUser}
            onJoinRoom={handleJoinVoiceRoom}
            onOpenCreateModal={() => setIsCreateRoomOpen(true)}
          />
        </div>
      ) : (
        <div className="h-[calc(100vh-14rem)] md:h-[620px]">
          <CallHistoryList
            callLogs={callLogs}
            onStartCall={handleStartCall}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            onClearLogs={onClearCallLogs}
          />
        </div>
      )}

      {/* Story Viewer Modal */}
      <StoryViewerModal
        story={selectedStory}
        isOpen={Boolean(selectedStory)}
        onClose={() => setSelectedStory(null)}
        onReply={(story, text) => {
          const matchingChat = chats.find((c) => c.participant.id === story.userId);
          if (matchingChat) {
            onSendMessage(matchingChat.id, `Replied to your status: "${text}"`);
          }
        }}
      />

      {/* Real One-on-One Voice & Video Call Overlay */}
      <CallOverlayModal
        isOpen={Boolean(callTarget)}
        user={callTarget?.user || null}
        isVideo={Boolean(callTarget?.isVideo)}
        onClose={() => setCallTarget(null)}
        onLogCall={onLogCall}
        onSaveCallMemo={(memo) => {
          if (callTarget?.user && onSaveCallMemoToChat) {
            onSaveCallMemoToChat(callTarget.user.id, memo);
          }
        }}
      />

      {/* Interactive Incoming Call Overlay Simulation */}
      <IncomingCallModal
        isOpen={Boolean(incomingCallTarget)}
        caller={incomingCallTarget?.user || null}
        callType={incomingCallTarget?.isVideo ? 'video' : 'voice'}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* Create Voice Room Modal */}
      <CreateVoiceRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateVoiceRoom}
      />

      {/* Interactive Multi-Participant Live Voice Room Modal */}
      <LiveVoiceRoomModal
        room={activeVoiceRoom}
        currentUser={currentUser}
        isOpen={Boolean(activeVoiceRoomId && activeVoiceRoom)}
        musicTracks={musicTracks}
        onDeductCoins={onDeductCoins}
        onAddCoins={onAddCoins}
        onClose={() => {
          if (activeVoiceRoomId) {
            onLeaveVoiceRoom(activeVoiceRoomId, currentUser.id);
          }
          setActiveVoiceRoomId(null);
        }}
        onToggleMute={onToggleVoiceRoomMute}
        onRaiseHand={onRaiseHandInVoiceRoom}
        onPromoteSpeaker={onPromoteVoiceParticipant}
        onDemoteSpeaker={onDemoteVoiceParticipant}
      />

      {/* Phone Contact Sync & Friends Matching Modal */}
      <ContactSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        onOpenQR={() => {
          setIsSyncModalOpen(false);
          setQrModalTab('scan');
          setIsQRModalOpen(true);
        }}
        onStartChatWithUser={(targetUser) => {
          const existing = chats.find((c) => c.participant.id === targetUser.id);
          if (existing) {
            setActiveChatId(existing.id);
          } else {
            onSendMessage(
              targetUser.id,
              `👋 Hello ${targetUser.name}! Found you via phone contacts on KAMATELA.`
            );
            setActiveChatId(targetUser.id);
          }
        }}
        onStartCallWithUser={(targetUser) => {
          handleStartCall(targetUser, false);
        }}
      />

      {/* Personal Contact QR & Live Camera Scanner Modal */}
      <ContactQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        currentUser={currentUser}
        defaultTab={qrModalTab}
        onStartChatWithUser={(targetUser) => {
          const existing = chats.find((c) => c.participant.id === targetUser.id);
          if (existing) {
            setActiveChatId(existing.id);
          } else {
            onSendMessage(
              targetUser.id,
              `👋 Hello ${targetUser.name}! Scanned your QR code on KAMATELA.`
            );
            setActiveChatId(targetUser.id);
          }
        }}
        onStartCallWithUser={(targetUser, isVideo) => {
          handleStartCall(targetUser, isVideo);
        }}
      />
    </div>
  );
};
