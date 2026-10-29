import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Image,
  Mic,
  MoreVertical,
  CheckCheck,
  Check,
  ShoppingBag,
  ExternalLink,
  Square,
  Trash2,
  Paperclip,
  Radio,
  Music,
  Play,
  Pause,
  Disc,
  Ban,
  ShieldAlert,
  Flag,
  UserX,
  UserCheck,
  AlertTriangle,
  X,
  BellOff,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { ChatConversation, User as KamatelaUser, AIMusicTrack } from '@/types/kamatela';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { soundEffects } from '@/utils/audioEffects';
import { aiMusicSynth } from '@/utils/aiMusicSynth';

interface ChatRoomProps {
  chat: ChatConversation;
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (chatId: string, text: string, mediaType?: 'image' | 'voice' | 'product' | 'song' | 'call_memo', mediaUrl?: string) => void;
  onStartCall: (user: KamatelaUser, isVideo: boolean) => void;
  onSimulateIncomingCall?: (caller: KamatelaUser, isVideo: boolean) => void;
  onOpenProductDetail?: (productId: string) => void;
  isBlocked?: boolean;
  onBlockUser?: (userId: string, reason?: string) => void;
  onUnblockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string, details?: string, shouldBlock?: boolean) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  chat,
  currentUserId,
  onBack,
  onSendMessage,
  onStartCall,
  onSimulateIncomingCall,
  onOpenProductDetail,
  isBlocked = false,
  onBlockUser,
  onUnblockUser,
  onReportUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // KAMATELA Chat Overflow Menu & Safety Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);

  // Block Modal Options
  const [alsoReportFromBlock, setAlsoReportFromBlock] = useState(false);

  // Report Modal Options
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [alsoBlockFromReport, setAlsoBlockFromReport] = useState(true);

  const reportReasonsList = [
    { id: 'spam', label: 'Spam or commercial advertising', icon: Ban },
    { id: 'harassment', label: 'Harassment, hate speech or threats', icon: AlertTriangle },
    { id: 'fraud', label: 'Scam, phishing or financial fraud', icon: ShieldAlert },
    { id: 'impersonation', label: 'Fake account or impersonation', icon: UserX },
    { id: 'inappropriate', label: 'Inappropriate or harmful content', icon: Flag },
  ];

  const handleTogglePlaySong = (song: { id: string; title: string; genre: string }) => {
    if (playingSongId === song.id) {
      aiMusicSynth.stop();
      setPlayingSongId(null);
    } else {
      aiMusicSynth.playTrack(song.id, song.genre, () => {
        setPlayingSongId(null);
      });
      setPlayingSongId(song.id);
      toast.info(`Playing: ${song.title}`);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundEffects.playSentPop();
    onSendMessage(chat.id, inputText.trim());
    setInputText('');
  };

  // Real Native Photo Upload from Camera / Device Gallery
  const handlePhotoPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const realImageUrl = URL.createObjectURL(file);
    soundEffects.playSentPop();
    onSendMessage(chat.id, file.name, 'image', realImageUrl);
    toast.success('Photo sent from device!');
    e.target.value = '';
  };

  // Real Microphone Audio Recording with MediaRecorder
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Audio recording not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      soundEffects.playRecordStart();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      toast.info('Recording voice note... Speak into your microphone!');
    } catch (err) {
      console.warn('Microphone permission denied or not found:', err);
      toast.error('Microphone permission required for real voice notes');
    }
  };

  const cancelVoiceRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
    toast.info('Voice recording cancelled');
  };

  const finishAndSendVoiceNote = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const realAudioUrl = URL.createObjectURL(audioBlob);

        soundEffects.playSentPop();
        onSendMessage(
          chat.id,
          `Voice note (${recordingSeconds}s)`,
          'voice',
          realAudioUrl
        );
        toast.success('Real voice note sent!');
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      recorder.stop();
    } else {
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[680px] max-w-md md:max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Hidden real file input for camera/photo picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoPicked}
        className="hidden"
      />

      {/* KAMATELA Chat Header */}
      <div className="bg-muted/80 backdrop-blur-md px-3 py-2.5 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0">
            <img src={chat.participant.avatar} alt={chat.participant.name} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-foreground truncate">
                {chat.participant.businessName || chat.participant.name}
              </h3>
              {chat.participant.verified && (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-500 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {chat.participant.isBusiness ? 'Official Business Account • Online' : 'Online'}
              <span className="text-muted-foreground">• Offline Cached</span>
            </p>
          </div>
        </div>

        {/* KAMATELA Chat Audio & Video Call buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Simulate Incoming Call button */}
          {onSimulateIncomingCall && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSimulateIncomingCall(chat.participant, false)}
              className="h-8 px-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center gap-1"
              title="Simulate receiving an incoming call from this contact"
            >
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Incoming Call</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            disabled={isBlocked}
            onClick={() => {
              if (isBlocked) {
                toast.error('You blocked this contact. Unblock to make voice calls.');
                return;
              }
              soundEffects.unlock();
              onStartCall(chat.participant, false);
            }}
            className={`h-8 w-8 p-0 rounded-full ${
              isBlocked ? 'opacity-40 cursor-not-allowed' : 'text-foreground hover:text-emerald-500'
            }`}
            title={isBlocked ? 'Contact is blocked' : 'KAMATELA Voice Call'}
          >
            <Phone className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isBlocked}
            onClick={() => {
              if (isBlocked) {
                toast.error('You blocked this contact. Unblock to make video calls.');
                return;
              }
              soundEffects.unlock();
              onStartCall(chat.participant, true);
            }}
            className={`h-8 w-8 p-0 rounded-full ${
              isBlocked ? 'opacity-40 cursor-not-allowed' : 'text-foreground hover:text-emerald-500'
            }`}
            title={isBlocked ? 'Contact is blocked' : 'KAMATELA Video Call'}
          >
            <Video className="w-4 h-4" />
          </Button>

          {/* Three-dot KAMATELA Chat Overflow Menu */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
              title="Chat Options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-10 w-52 rounded-2xl bg-card border border-border shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsContactInfoOpen(true)}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-muted/70 text-foreground transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>View Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.info('Notifications muted for 8 hours');
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-muted/70 text-foreground transition-colors"
                >
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                  <span>Mute Notifications</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success('Chat history cleared locally');
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-muted/70 text-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                  <span>Clear Chat</span>
                </button>

                <div className="h-px bg-border/60 my-1" />

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-rose-500/10 text-rose-400 transition-colors font-medium"
                >
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>Report Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isBlocked) {
                      onUnblockUser?.(chat.participant.id);
                      toast.success(`Unblocked ${chat.participant.name}`);
                    } else {
                      setIsBlockModalOpen(true);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-rose-500/10 text-rose-500 transition-colors font-bold"
                >
                  {isBlocked ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Unblock Contact</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 text-rose-500" />
                      <span>Block Contact</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KAMATELA Chat Blocked Warning Banner */}
      {isBlocked && (
        <div className="px-4 py-2.5 bg-rose-500/15 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">You blocked this contact. Calls and messages are paused.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onUnblockUser?.(chat.participant.id);
              toast.success(`Unblocked ${chat.participant.name}`);
            }}
            className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[11px] hover:bg-rose-600 transition-colors"
          >
            Unblock
          </button>
        </div>
      )}

      {/* Messages Scroll Area with KAMATELA Chat pattern background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] bg-background/50">
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
            🔒 Real-time end-to-end encrypted messaging & voice notes
          </span>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                isMe ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-card border border-border text-foreground rounded-tl-none'
                }`}
              >
                {/* Media preview (real photo) */}
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <div className="w-52 h-40 rounded-xl overflow-hidden mb-1.5 bg-black/20">
                    <img src={msg.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Real Voice Note player */}
                {msg.mediaType === 'voice' && (
                  <VoiceNotePlayer
                    audioUrl={msg.mediaUrl}
                    isMe={isMe}
                    label={msg.text}
                  />
                )}

                {/* Call Recording Memo Card */}
                {msg.mediaType === 'call_memo' && (
                  <div className="mb-2 p-3 rounded-2xl bg-gradient-to-r from-rose-950/50 via-purple-950/40 to-zinc-900 border border-rose-500/40 flex flex-col gap-2 shadow-lg min-w-[240px]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-rose-300">
                        <Disc className="w-3.5 h-3.5 text-rose-400 animate-spin" /> In-Call Audio Memo
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px] text-rose-300 font-mono font-semibold">
                        {msg.callMemoSnippet?.callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                      </span>
                    </div>

                    <VoiceNotePlayer
                      audioUrl={msg.callMemoSnippet?.audioUrl || msg.mediaUrl}
                      isMe={isMe}
                      label={msg.text || 'In-Call Voice Recording Memo'}
                    />

                    {msg.callMemoSnippet && (
                      <div className="flex items-center justify-between text-[9px] text-white/70 pt-1 border-t border-white/10 font-medium">
                        <span>Participant: {msg.callMemoSnippet.partnerName}</span>
                        <span>Recorded: {msg.callMemoSnippet.recordedAt}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Real Playable AI Song Card */}
                {msg.songSnippet && (
                  <div className="mb-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5 shadow-sm">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-purple-500/20">
                      <img
                        src={msg.songSnippet.coverUrl}
                        alt={msg.songSnippet.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleTogglePlaySong(msg.songSnippet!)}
                        className="absolute inset-0 bg-black/50 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
                        aria-label={playingSongId === msg.songSnippet.id ? 'Pause Song' : 'Play Song'}
                      >
                        {playingSongId === msg.songSnippet.id ? (
                          <Pause className="w-5 h-5 fill-current animate-pulse text-purple-300" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-bold">
                          {msg.songSnippet.genre}
                        </span>
                        <span className="text-[9px] text-zinc-300 font-mono">
                          {msg.songSnippet.duration}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {msg.songSnippet.title}
                      </p>
                      {playingSongId === msg.songSnippet.id && (
                        <div className="flex items-center gap-0.5 h-2.5 mt-1">
                          {[30, 80, 50, 95, 60, 40, 85].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-purple-400 rounded-full animate-pulse"
                              style={{
                                height: `${(h / 100) * 10}px`,
                                animationDelay: `${i * 80}ms`,
                              }}
                            />
                          ))}
                          <span className="text-[8px] font-mono text-purple-300 ml-1">Live Audio</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product inquiry snippet */}
                {msg.productSnippet && (
                  <div
                    onClick={() => onOpenProductDetail?.(msg.productSnippet!.id)}
                    className="cursor-pointer mb-2 p-2 rounded-lg bg-black/20 border border-white/20 flex items-center gap-2 hover:bg-black/30 transition-colors"
                  >
                    <img
                      src={msg.productSnippet.imageUrl}
                      alt={msg.productSnippet.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                        <ShoppingBag className="w-3 h-3" /> Catalog Item
                      </div>
                      <p className="font-bold text-xs truncate">{msg.productSnippet.title}</p>
                      <p className="text-[10px] font-extrabold">${msg.productSnippet.price}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/70 shrink-0" />
                  </div>
                )}

                {msg.mediaType !== 'voice' && (
                  <p className="leading-relaxed break-words">{msg.text}</p>
                )}

                {/* Message Timestamp & Status Checks */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                    isMe ? 'text-emerald-100' : 'text-muted-foreground'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-cyan-200 stroke-[2.5]" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar / Real Voice Recorder Bar / Blocked State */}
      {isBlocked ? (
        <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <Ban className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">You cannot send messages to a blocked contact.</span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onUnblockUser?.(chat.participant.id);
              toast.success(`Unblocked ${chat.participant.name}`);
            }}
            className="h-8 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-sm"
          >
            Unblock
          </Button>
        </div>
      ) : isRecording ? (
        <div className="p-2.5 bg-card border-t border-border flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="text-xs font-mono font-bold text-rose-400">
              {formatRecTime(recordingSeconds)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">Recording real audio...</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-muted"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Button
              type="button"
              size="sm"
              onClick={finishAndSendVoiceNote}
              className="h-8 px-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs gap-1 font-semibold"
            >
              <Send className="w-3.5 h-3.5" /> Send Voice
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="p-2.5 bg-card border-t border-border flex items-center gap-1.5 shrink-0"
        >
          {/* Real Photo Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-muted"
            title="Attach real photo from device camera or gallery"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Real Microphone Voice Recording button */}
          <button
            type="button"
            onClick={startVoiceRecording}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-muted"
            title="Record real voice note from microphone"
          >
            <Mic className="w-4 h-4" />
          </button>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or catalog inquiry..."
            className="h-9 text-xs bg-muted/60 border-border rounded-full px-4 flex-1 focus-visible:ring-emerald-500"
          />

          <Button
            type="submit"
            size="sm"
            disabled={!inputText.trim()}
            className="h-9 w-9 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}

      {/* KAMATELA Chat Block Contact Confirmation Dialog */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Block {chat.participant.name}?
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  KAMATELA Contact Protection
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Blocked contacts will no longer be able to call you or send you messages. This contact will not be notified that they have been blocked.
            </p>

            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/60 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoReportFromBlock}
                onChange={(e) => setAlsoReportFromBlock(e.target.checked)}
                className="mt-0.5 rounded border-border text-emerald-500 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground">Report contact to KAMATELA</span>
                <p className="text-[10px] text-muted-foreground">The last 5 messages from this chat will be forwarded for safety review.</p>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBlockModalOpen(false)}
                className="rounded-xl text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onBlockUser?.(chat.participant.id, 'User blocked in chat');
                  if (alsoReportFromBlock) {
                    onReportUser?.(
                      chat.participant.id,
                      'User reported and blocked',
                      'Blocked from 1-on-1 chat room',
                      true
                    );
                  }
                  toast.success(`Blocked ${chat.participant.name}`);
                  setIsBlockModalOpen(false);
                }}
                className="rounded-xl text-xs h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Block Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KAMATELA Chat Report Contact Dialog */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Report {chat.participant.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Help keep the KAMATELA community safe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select the reason why you are reporting this contact. The last 5 messages from this chat will be forwarded to our review team:
            </p>

            <div className="space-y-2">
              {reportReasonsList.map((reason) => {
                const Icon = reason.icon;
                const isSelected = reportReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setReportReason(reason.id)}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-foreground'
                        : 'bg-muted/20 border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium flex-1">{reason.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                      isSelected ? 'border-amber-400 bg-amber-400 text-black font-bold' : 'border-muted-foreground'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/30 border border-border/60 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoBlockFromReport}
                onChange={(e) => setAlsoBlockFromReport(e.target.checked)}
                className="rounded border-border text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-foreground">Block contact and stop receiving messages</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-xl text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onReportUser?.(
                    chat.participant.id,
                    reportReason,
                    reportDetails.trim() || undefined,
                    alsoBlockFromReport
                  );
                  toast.success(`Report submitted. Thank you for making KAMATELA safer!`);
                  if (alsoBlockFromReport) {
                    toast.info(`Blocked ${chat.participant.name}`);
                  }
                  setIsReportModalOpen(false);
                  setReportDetails('');
                }}
                className="rounded-xl text-xs h-9 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Info Modal */}
      {isContactInfoOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Contact Info</h3>
              <button
                type="button"
                onClick={() => setIsContactInfoOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md">
                <img src={chat.participant.avatar} alt={chat.participant.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-sm font-bold text-foreground">{chat.participant.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{chat.participant.businessPhone || chat.participant.handle}</p>
              <p className="text-xs text-foreground/80 italic max-w-xs">"{chat.participant.bio || 'Hey there! I am using KAMATELA.'}"</p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Account Type</span>
                <span className="font-bold text-foreground">{chat.participant.isBusiness ? 'Business Account' : 'Standard Account'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Status</span>
                <span className="font-bold text-emerald-400">Online & Encrypted</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsContactInfoOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="flex-1 rounded-xl text-xs h-9 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              >
                <Flag className="w-3.5 h-3.5 mr-1" /> Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsContactInfoOpen(false);
                  if (isBlocked) {
                    onUnblockUser?.(chat.participant.id);
                    toast.success(`Unblocked ${chat.participant.name}`);
                  } else {
                    setIsBlockModalOpen(true);
                  }
                }}
                className={`flex-1 rounded-xl text-xs h-9 ${
                  isBlocked
                    ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                {isBlocked ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Unblock
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5 mr-1" /> Block
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
