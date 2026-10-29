import React, { useState, useEffect } from 'react';
import type {
  ChatConversation,
  ChatMessage,
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
import { ContactsDirectoryModal } from './ContactsDirectoryModal';
import { ContactQRModal } from './ContactQRModal';
import {
  MessageSquare,
  PhoneCall,
  Radio,
  Smartphone,
  QrCode,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChatModuleProps {
  chats: ChatConversation[];
  stories: UserStory[];
  callLogs: CallLog[];
  voiceRooms: VoiceRoom[];
  currentUser: User;
  onSendMessage: (
    chatId: string,
    text: string,
    mediaType?: ChatMessage['mediaType'],
    mediaUrl?: string,
    extraSnippet?: {
      productSnippet?: ChatMessage['productSnippet'];
      songSnippet?: ChatMessage['songSnippet'];
      callMemoSnippet?: ChatMessage['callMemoSnippet'];
      voiceNote?: ChatMessage['voiceNote'];
      documentSnippet?: ChatMessage['documentSnippet'];
      locationSnippet?: ChatMessage['locationSnippet'];
      contactCard?: ChatMessage['contactCard'];
      momoTransfer?: ChatMessage['momoTransfer'];
      replyTo?: ChatMessage['replyTo'];
    }
  ) => void;
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
  blockedUserIds?: string[];
  onBlockUser?: (userId: string, reason?: string) => void;
  onUnblockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string, details?: string, shouldBlock?: boolean) => void;
  onSaveCallMemoToChat?: (
    partnerId: string,
    memo: {
      partnerName: string;
      callType: 'voice' | 'video';
      durationSeconds: number;
      audioUrl?: string;
    }
  ) => void;
  onReactToMessage?: (chatId: string, messageId: string, emoji: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string, forEveryone: boolean) => void;
  onToggleStarMessage?: (chatId: string, messageId: string) => void;
  onSetDisappearingTimer?: (chatId: string, timer: 'off' | '24h' | '7d' | '90d') => void;
  onClearChatHistory?: (chatId: string) => void;
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
  blockedUserIds = [],
  onBlockUser,
  onUnblockUser,
  onReportUser,
  onSaveCallMemoToChat,
  onReactToMessage,
  onDeleteMessage,
  onToggleStarMessage,
  onSetDisappearingTimer,
  onClearChatHistory,
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

  // Mobile Phone Signup & Login Gate
  const [isChatRegistered, setIsChatRegistered] = useState<boolean>(() => {
    return localStorage.getItem('kamatela_chat_registered') === 'true';
  });
  const [authStep, setAuthStep] = useState<1 | 2 | 3>(1);
  const [authCountry, setAuthCountry] = useState('+225');
  const [authPhone, setAuthPhone] = useState('07 01 23 45 67');
  const [authOtp, setAuthOtp] = useState('');
  const [authGeneratedCode, setAuthGeneratedCode] = useState('123456');
  const [authResendSeconds, setAuthResendSeconds] = useState(45);
  const [authName, setAuthName] = useState(currentUser.name || 'Alex Kamate');
  const [authStatus, setAuthStatus] = useState('Hey there! I am using KAMATELA Chat.');
  const [authAvatar] = useState(
    currentUser.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  useEffect(() => {
    let timer: any;
    if (authStep === 2 && authResendSeconds > 0) {
      timer = setInterval(() => {
        setAuthResendSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, authResendSeconds]);

  if (!isChatRegistered) {
    return (
      <div className="w-full max-w-md mx-auto my-3 p-5 bg-card/90 backdrop-blur-md border border-emerald-500/30 rounded-3xl shadow-2xl space-y-5">
        {/* KAMATELA Chat Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">
            Welcome to KAMATELA Chat
          </h2>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted messaging & calls</span>
          </p>
        </div>

        {/* STEP 1: Phone Input */}
        {authStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!authPhone.trim()) {
                toast.error('Please enter your mobile phone number');
                return;
              }
              const newCode = Math.floor(100000 + Math.random() * 900000).toString();
              setAuthGeneratedCode(newCode);
              setAuthOtp(newCode);
              setAuthStep(2);
              setAuthResendSeconds(45);
              toast.success(`Verification Code: ${newCode} (Auto-filled on screen)`);
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-foreground">Verify your phone number</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your mobile number to sign up or log in to your private chats.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={authCountry}
                  onChange={(e) => setAuthCountry(e.target.value)}
                  className="w-32 h-11 px-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:border-emerald-500"
                >
                  <option value="+225">🇨🇮 +225 (CI)</option>
                  <option value="+224">🇬🇳 +224 (GN)</option>
                  <option value="+223">🇲🇱 +223 (ML)</option>
                  <option value="+221">🇸🇳 +221 (SN)</option>
                  <option value="+234">🇳🇬 +234 (NG)</option>
                  <option value="+233">🇬🇭 +233 (GH)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+33">🇫🇷 +33 (FR)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                </select>
                <Input
                  type="tel"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="07 01 23 45 67"
                  className="flex-1 h-11 rounded-xl bg-background border-border text-sm font-semibold tracking-wide"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 gap-2"
            >
              <span>Agree & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* STEP 2: SMS Verification */}
        {authStep === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = authOtp.trim() || authGeneratedCode || '123456';
              if (code.length < 6) {
                toast.error('Please enter the 6-digit verification code');
                return;
              }
              toast.success('Phone verified successfully!');
              setAuthStep(3);
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-foreground">Verifying {authCountry} {authPhone}</h3>
              <p className="text-xs text-muted-foreground">
                Enter the verification code to activate your account.{' '}
                <button
                  type="button"
                  onClick={() => setAuthStep(1)}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  Change number
                </button>
              </p>
            </div>

            {/* Prominent Verification Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Verification Code</span>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-300 tracking-widest py-0.5 select-all">
                {authGeneratedCode}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Auto-filled below for instant 1-tap verification.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                maxLength={6}
                value={authOtp}
                onChange={(e) => setAuthOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1 2 3 4 5 6"
                className="h-12 text-center text-lg font-mono font-bold tracking-widest rounded-xl bg-background border-emerald-500/50"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthOtp(authGeneratedCode);
                    toast.info(`Inserted code: ${authGeneratedCode}`);
                  }}
                  className="h-7 text-xs text-emerald-400 hover:text-emerald-300 gap-1 px-2"
                >
                  <Sparkles className="w-3 h-3" /> Insert Code
                </Button>

                <span className="text-muted-foreground text-[11px]">
                  {authResendSeconds > 0 ? (
                    `Resend in ${authResendSeconds}s`
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setAuthGeneratedCode(newCode);
                        setAuthOtp(newCode);
                        setAuthResendSeconds(45);
                        toast.success(`Resent code: ${newCode}`);
                      }}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      Resend SMS
                    </button>
                  )}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
            >
              Verify & Set Up Profile
            </Button>
          </form>
        )}

        {/* STEP 3: Profile Info */}
        {authStep === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!authName.trim()) {
                toast.error('Please enter your name');
                return;
              }
              const fullPhoneNumber = `${authCountry} ${authPhone.trim()}`;
              localStorage.setItem('kamatela_kamatela_chat_registered', 'true');
              localStorage.setItem('kamatela_kamatela_chat_phone', fullPhoneNumber);
              localStorage.setItem('kamatela_kamatela_chat_name', authName.trim());
              currentUser.name = authName.trim();
              currentUser.businessPhone = fullPhoneNumber;
              currentUser.avatar = authAvatar;
              setIsChatRegistered(true);
              toast.success(`Welcome to KAMATELA Chat, ${authName.trim()}!`);
            }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-foreground">Profile Info</h3>
              <p className="text-xs text-muted-foreground">
                Please provide your name and an optional status.
              </p>
            </div>

            <div className="flex justify-center py-1">
              <img
                src={authAvatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Your Name
                </label>
                <Input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Alex Kamate"
                  className="h-11 mt-1 rounded-xl bg-background border-border text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Input
                  type="text"
                  value={authStatus}
                  onChange={(e) => setAuthStatus(e.target.value)}
                  placeholder="Hey there! I am using KAMATELA."
                  className="h-11 mt-1 rounded-xl bg-background border-border text-sm text-muted-foreground"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
            >
              Start Chatting on KAMATELA
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-3">
      {/* KAMATELA Chat Connected Status Bar */}
      {!activeChat && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/25 rounded-2xl text-xs text-emerald-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-400">Phone Chat:</span>
            <span className="font-mono text-white text-[11px]">
              {localStorage.getItem('kamatela_kamatela_chat_phone') || currentUser.businessPhone || '+225 07 01 23 45'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('kamatela_chat_registered');
              setIsChatRegistered(false);
              setAuthStep(1);
              toast.info('Logged out from Chat. Enter number to sign in.');
            }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-emerald-400 font-medium transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch / Log Out</span>
          </button>
        </div>
      )}
      {/* Top KAMATELA Chat & Rooms Navigation (Chats / Voice Rooms / Calls) */}
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
          isBlocked={blockedUserIds.includes(activeChat.participant.id)}
          onBlockUser={onBlockUser}
          onUnblockUser={onUnblockUser}
          onReportUser={onReportUser}
          onReactToMessage={onReactToMessage}
          onDeleteMessage={onDeleteMessage}
          onToggleStarMessage={onToggleStarMessage}
          onSetDisappearingTimer={onSetDisappearingTimer}
          onClearChatHistory={onClearChatHistory}
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

      {/* KAMATELA Chat Contacts Directory & Manager Modal */}
      <ContactsDirectoryModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        blockedUserIds={blockedUserIds}
        onBlockUser={onBlockUser}
        onUnblockUser={onUnblockUser}
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
              `👋 Hello ${targetUser.name}! Starting chat on KAMATELA.`
            );
            setActiveChatId(targetUser.id);
          }
        }}
        onStartCallWithUser={(targetUser, isVideo) => {
          handleStartCall(targetUser, !!isVideo);
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
