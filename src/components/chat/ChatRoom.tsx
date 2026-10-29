import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  CheckCheck,
  Check,
  ShoppingBag,
  ExternalLink,
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
  CornerUpLeft,
  Star,
  Copy,
  Smile,
  FileText,
  MapPin,
  DollarSign,
  Download,
  PhoneCall,
  Clock,
  ShieldCheck,
  Search,
  Calendar,
  ChevronUp,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { ChatConversation, User as KamatelaUser, ChatMessage } from '@/types/kamatela';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { AttachmentModal } from './AttachmentModal';
import { ChatInfoDrawer } from './ChatInfoDrawer';
import { soundEffects } from '@/utils/audioEffects';
import { aiMusicSynth } from '@/utils/aiMusicSynth';

interface ChatRoomProps {
  chat: ChatConversation;
  currentUserId: string;
  onBack: () => void;
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
  onStartCall: (user: KamatelaUser, isVideo: boolean) => void;
  onSimulateIncomingCall?: (caller: KamatelaUser, isVideo: boolean) => void;
  onOpenProductDetail?: (productId: string) => void;
  isBlocked?: boolean;
  onBlockUser?: (userId: string, reason?: string) => void;
  onUnblockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string, details?: string, shouldBlock?: boolean) => void;
  onReactToMessage?: (chatId: string, messageId: string, emoji: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string, forEveryone: boolean) => void;
  onToggleStarMessage?: (chatId: string, messageId: string) => void;
  onSetDisappearingTimer?: (chatId: string, timer: 'off' | '24h' | '7d' | '90d') => void;
  onClearChatHistory?: (chatId: string) => void;
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
  onReactToMessage,
  onDeleteMessage,
  onToggleStarMessage,
  onSetDisappearingTimer,
  onClearChatHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // Search by keyword and date state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [onlyShowMatches, setOnlyShowMatches] = useState(false);

  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

  // Message Quoting / Reply state
  const [replyingMessage, setReplyingMessage] = useState<ChatMessage | null>(null);

  // Active message actions popup
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);

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
    if (!isSearchOpen) {
      scrollToBottom();
    }
  }, [chat.messages, isSearchOpen]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Filter messages based on searchKeyword and dateFilter
  const matchedMessages = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    return chat.messages.filter((msg) => {
      // 1. Text / Keyword filter
      if (kw) {
        const textMatch = msg.text.toLowerCase().includes(kw);
        const docMatch = msg.documentSnippet?.fileName.toLowerCase().includes(kw);
        const locMatch =
          msg.locationSnippet?.title.toLowerCase().includes(kw) ||
          msg.locationSnippet?.address.toLowerCase().includes(kw);
        const contactMatch = msg.contactCard?.name.toLowerCase().includes(kw);
        const songMatch = msg.songSnippet?.title.toLowerCase().includes(kw);
        const momoMatch = msg.momoTransfer?.txId.toLowerCase().includes(kw);

        if (!textMatch && !docMatch && !locMatch && !contactMatch && !songMatch && !momoMatch) {
          return false;
        }
      }

      // 2. Date filter
      if (dateFilter === 'today') {
        const isToday =
          msg.date === todayStr ||
          (!msg.timestamp.toLowerCase().includes('yesterday') &&
            !msg.timestamp.includes('/') &&
            !msg.timestamp.includes('-') &&
            (msg.timestamp.includes('AM') || msg.timestamp.includes('PM')));
        if (!isToday) return false;
      } else if (dateFilter === 'yesterday') {
        const isYesterday = msg.timestamp.toLowerCase().includes('yesterday');
        if (!isYesterday) return false;
      } else if (dateFilter === 'week') {
        // Within the current week / mock recent
        const isNotOld = !msg.timestamp.includes('2025');
        if (!isNotOld) return false;
      } else if (dateFilter === 'custom' && customDate) {
        const isCustom = msg.date === customDate || msg.timestamp.includes(customDate);
        if (!isCustom) return false;
      }

      return true;
    });
  }, [chat.messages, searchKeyword, dateFilter, customDate]);

  // Reset match index if matches change
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchKeyword, dateFilter, customDate]);

  // Jump to active match
  const scrollToMatch = (index: number) => {
    if (matchedMessages.length === 0) return;
    const target = matchedMessages[index];
    if (target) {
      const el = document.getElementById(`msg-${target.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleNextMatch = () => {
    if (matchedMessages.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchedMessages.length;
    setCurrentMatchIndex(nextIdx);
    scrollToMatch(nextIdx);
  };

  const handlePrevMatch = () => {
    if (matchedMessages.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchedMessages.length) % matchedMessages.length;
    setCurrentMatchIndex(prevIdx);
    scrollToMatch(prevIdx);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchKeyword('');
    setDateFilter('all');
    setCustomDate('');
    setOnlyShowMatches(false);
    setCurrentMatchIndex(0);
  };

  // Helper to highlight matching text in message bubble
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-400 text-black px-0.5 rounded font-bold shadow-xs">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundEffects.playSentPop();

    const extraSnippet: Parameters<typeof onSendMessage>[4] = {};
    if (replyingMessage) {
      extraSnippet.replyTo = {
        id: replyingMessage.id,
        senderName: replyingMessage.senderId === currentUserId ? 'You' : chat.participant.name,
        text: replyingMessage.text,
        mediaType: replyingMessage.mediaType,
      };
    }

    onSendMessage(chat.id, inputText.trim(), undefined, undefined, extraSnippet);
    setInputText('');
    setReplyingMessage(null);
  };

  // Photo picked from camera or gallery
  const handlePhotoPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const realImageUrl = URL.createObjectURL(file);
    soundEffects.playSentPop();
    onSendMessage(chat.id, file.name, 'image', realImageUrl);
    toast.success('Photo sent from device!');
    e.target.value = '';
  };

  // Voice Recording with live timer and MediaRecorder
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
      console.warn('Microphone permission fallback:', err);
      // Simulated voice note recording fallback
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      toast.info('Recording voice note...');
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
          realAudioUrl,
          {
            voiceNote: {
              durationSeconds: Math.max(1, recordingSeconds),
              waveform: [35, 60, 85, 40, 75, 90, 55, 70, 95, 45, 80, 60, 30, 20],
            },
          }
        );
        toast.success('Voice note sent!');
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      recorder.stop();
    } else {
      soundEffects.playSentPop();
      onSendMessage(
        chat.id,
        `Voice note (${Math.max(1, recordingSeconds)}s)`,
        'voice',
        undefined,
        {
          voiceNote: {
            durationSeconds: Math.max(1, recordingSeconds),
            waveform: [35, 60, 85, 40, 75, 90, 55, 70, 95, 45, 80, 60, 30, 20],
          },
        }
      );
      toast.success('Voice note sent!');
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const messagesToDisplay = onlyShowMatches ? matchedMessages : chat.messages;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[680px] max-w-md md:max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-xl overflow-hidden relative">
      {/* Hidden file input for camera/photo picker */}
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

          <button
            type="button"
            onClick={() => setIsContactInfoOpen(true)}
            className="flex items-center gap-2 min-w-0 text-left hover:opacity-85 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0 relative">
              <img src={chat.participant.avatar} alt={chat.participant.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-background" />
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
                <span>Online</span>
                {chat.disappearingTimer && chat.disappearingTimer !== 'off' && (
                  <span className="text-muted-foreground flex items-center gap-0.5 ml-1">
                    • <Clock className="w-2.5 h-2.5" /> {chat.disappearingTimer}
                  </span>
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Audio, Video, Search, and Overflow Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* In-Chat Keyword Search Toggle Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (isSearchOpen) {
                handleCloseSearch();
              } else {
                setIsSearchOpen(true);
              }
            }}
            className={`h-8 w-8 p-0 rounded-full transition-colors ${
              isSearchOpen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-foreground hover:text-emerald-500'
            }`}
            title="Search messages by keyword and date"
          >
            <Search className="w-4 h-4" />
          </Button>

          {onSimulateIncomingCall && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSimulateIncomingCall(chat.participant, false)}
              className="h-8 px-2 text-[10px] font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center gap-1"
              title="Simulate receiving an incoming call"
            >
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Incoming</span>
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
            title={isBlocked ? 'Contact is blocked' : 'Voice Call'}
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
            title={isBlocked ? 'Contact is blocked' : 'Video Call'}
          >
            <Video className="w-4 h-4" />
          </Button>

          {/* Three-dot Overflow Menu */}
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
                  <span>Contact Info & Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-muted/70 text-foreground transition-colors"
                >
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Search in Chat</span>
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
                    onClearChatHistory?.(chat.id);
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

      {/* Docked In-Chat Search Bar for Keyword & Date Filtering */}
      {isSearchOpen && (
        <div className="bg-muted/95 backdrop-blur-md px-3 py-2 border-b border-border flex flex-col gap-2 shrink-0 animate-in slide-in-from-top-2 duration-200 z-10 shadow-md">
          {/* Main search input line */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search messages by keyword..."
                className="h-8 text-xs pl-8 pr-7 bg-background rounded-full border-border focus-visible:ring-emerald-500"
                autoFocus
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="w-5 h-5 rounded-full absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Match Counter and Next/Prev Navigation */}
            {matchedMessages.length > 0 ? (
              <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border shrink-0">
                <span className="font-semibold text-emerald-400 mr-1">
                  {currentMatchIndex + 1}/{matchedMessages.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrevMatch}
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                  title="Previous match"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                  title="Next match"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (searchKeyword || dateFilter !== 'all') ? (
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full shrink-0 font-medium">
                0 matches
              </span>
            ) : null}

            {/* Close Search */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCloseSearch}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-full"
            >
              Done
            </Button>
          </div>

          {/* Date Filtering Options */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
              <Calendar className="w-3 h-3 text-emerald-400" /> Filter:
            </span>

            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'This Week' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDateFilter(item.id as typeof dateFilter);
                  setCustomDate('');
                }}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors shrink-0 text-[10px] ${
                  dateFilter === item.id && !customDate
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Custom Date Picker */}
            <div className="relative shrink-0 flex items-center">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilter('custom');
                }}
                className={`text-[10px] h-6 px-2 rounded-full border bg-card text-foreground cursor-pointer ${
                  customDate ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-border'
                }`}
              />
              {customDate && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomDate('');
                    setDateFilter('all');
                  }}
                  className="ml-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter View Toggle: show all with highlight vs show matches only */}
            <button
              type="button"
              onClick={() => setOnlyShowMatches(!onlyShowMatches)}
              className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-colors ${
                onlyShowMatches
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
              title="Toggle between showing matches only or whole conversation with highlights"
            >
              {onlyShowMatches ? 'Matches Only' : 'All Messages'}
            </button>
          </div>
        </div>
      )}

      {/* Blocked Warning Banner */}
      {isBlocked && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-3 py-2 flex items-center justify-between text-xs text-rose-400 shrink-0">
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

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] bg-background/50"
        onClick={() => setActiveMessageMenuId(null)}
      >
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
            🔒 Real-time end-to-end encrypted messaging & voice notes
          </span>
        </div>

        {/* Empty state when filtering */}
        {onlyShowMatches && messagesToDisplay.length === 0 && (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No matching messages</p>
            <p className="text-[11px] text-muted-foreground">
              No messages found matching "{searchKeyword}" with selected date filter.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchKeyword('');
                setDateFilter('all');
                setCustomDate('');
                setOnlyShowMatches(false);
              }}
              className="text-xs rounded-full"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {messagesToDisplay.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const isMenuOpenForThis = activeMessageMenuId === msg.id;
          const isCurrentActiveMatch =
            isSearchOpen &&
            matchedMessages.length > 0 &&
            matchedMessages[currentMatchIndex]?.id === msg.id;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                isMe ? 'ml-auto' : 'mr-auto'
              } group relative transition-all duration-300`}
            >
              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm relative transition-all ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-card border border-border text-foreground rounded-tl-none'
                } ${
                  isCurrentActiveMatch
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background scale-[1.02] shadow-lg shadow-amber-500/20'
                    : ''
                }`}
              >
                {/* Quoted Message preview if reply */}
                {msg.replyTo && (
                  <div
                    className={`mb-1.5 p-1.5 rounded-lg border-l-4 text-[10px] ${
                      isMe
                        ? 'bg-black/20 border-emerald-300 text-white/90'
                        : 'bg-muted/80 border-emerald-500 text-foreground/80'
                    }`}
                  >
                    <p className="font-bold text-emerald-400">{msg.replyTo.senderName}</p>
                    <p className="truncate italic">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* 1. Photo Attachment preview */}
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <div className="w-56 h-40 rounded-xl overflow-hidden mb-1.5 bg-black/20">
                    <img src={msg.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* 2. Voice Note player */}
                {msg.mediaType === 'voice' && (
                  <VoiceNotePlayer
                    audioUrl={msg.voiceNote?.audioUrl || msg.mediaUrl}
                    isMe={isMe}
                    label={msg.text}
                    waveform={msg.voiceNote?.waveform}
                    durationSeconds={msg.voiceNote?.durationSeconds}
                  />
                )}

                {/* 3. Document / PDF Card */}
                {msg.mediaType === 'document' && msg.documentSnippet && (
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 mb-1 ${
                    isMe ? 'bg-black/20 border-white/20' : 'bg-secondary/60 border-border'
                  }`}>
                    <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate">
                        {renderHighlightedText(msg.documentSnippet.fileName, searchKeyword)}
                      </p>
                      <p className="text-[10px] opacity-80">{msg.documentSnippet.fileSize} • {msg.documentSnippet.fileType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Downloading ${msg.documentSnippet?.fileName}`)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 4. Location Pin Card */}
                {msg.mediaType === 'location' && msg.locationSnippet && (
                  <div className={`p-2 rounded-xl border mb-1 flex flex-col gap-1.5 min-w-[200px] ${
                    isMe ? 'bg-black/20 border-white/20' : 'bg-secondary/60 border-border'
                  }`}>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <MapPin className="w-4 h-4 fill-emerald-400/20" />
                      <span>{renderHighlightedText(msg.locationSnippet.title, searchKeyword)}</span>
                    </div>
                    <p className="text-[11px] opacity-85 leading-snug">
                      {renderHighlightedText(msg.locationSnippet.address, searchKeyword)}
                    </p>
                    <div className="h-20 w-full rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-300">
                      GPS: {msg.locationSnippet.lat.toFixed(4)}, {msg.locationSnippet.lng.toFixed(4)}
                    </div>
                  </div>
                )}

                {/* 5. Contact Card */}
                {msg.mediaType === 'contact' && msg.contactCard && (
                  <div className={`p-2.5 rounded-xl border mb-1 flex items-center justify-between gap-3 min-w-[210px] ${
                    isMe ? 'bg-black/20 border-white/20' : 'bg-secondary/60 border-border'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {msg.contactCard.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">
                          {renderHighlightedText(msg.contactCard.name, searchKeyword)}
                        </p>
                        <p className="text-[10px] font-mono opacity-80 truncate">{msg.contactCard.phone}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Saved contact: ${msg.contactCard?.name}`)}
                      className="h-7 px-2 text-[10px] rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold"
                    >
                      Message
                    </Button>
                  </div>
                )}

                {/* 6. MoMo Money Transfer Card */}
                {msg.mediaType === 'momo' && msg.momoTransfer && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-600/20 border border-yellow-500/40 mb-1 flex flex-col gap-1 min-w-[210px]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-yellow-400">
                        <DollarSign className="w-3.5 h-3.5" /> MoMo Cash Transfer
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-yellow-500/30 text-yellow-300 text-[9px] font-bold">
                        {msg.momoTransfer.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-foreground">
                      {msg.momoTransfer.currency} {msg.momoTransfer.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground">
                      Ref: {renderHighlightedText(msg.momoTransfer.txId, searchKeyword)}
                    </p>
                  </div>
                )}

                {/* 7. Call Recording Memo Card */}
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
                  </div>
                )}

                {/* 8. AI Song Card */}
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
                        {renderHighlightedText(msg.songSnippet.title, searchKeyword)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 9. Product Snippet */}
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
                      <p className="font-bold text-xs truncate">
                        {renderHighlightedText(msg.productSnippet.title, searchKeyword)}
                      </p>
                      <p className="text-[10px] font-extrabold">${msg.productSnippet.price}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/70 shrink-0" />
                  </div>
                )}

                {/* Text Content */}
                {msg.mediaType !== 'voice' && !msg.isDeleted && (
                  <p className="leading-relaxed break-words">
                    {renderHighlightedText(msg.text, searchKeyword)}
                  </p>
                )}
                {msg.isDeleted && (
                  <p className="italic text-muted-foreground flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> {msg.text}
                  </p>
                )}

                {/* Message Timestamp & Status Checks */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                    isMe ? 'text-emerald-100' : 'text-muted-foreground'
                  }`}
                >
                  {msg.isStarred && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                  <span>{msg.timestamp}</span>

                  {/* Delivery Status Checks */}
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" /></span>
                      ) : msg.status === 'delivered' ? (
                        <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-emerald-200" /></span>
                      ) : (
                        <span title="Sent"><Check className="w-3.5 h-3.5 text-emerald-200" /></span>
                      )}
                    </span>
                  )}
                </div>

                {/* Reaction Badges Docked underneath */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-0.5 bg-card border border-border shadow-md rounded-full px-1.5 py-0.5 text-[10px]">
                    {msg.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReactToMessage?.(chat.id, msg.id, r.emoji);
                        }}
                        className="flex items-center gap-0.5 hover:scale-110 transition-transform"
                      >
                        <span>{r.emoji}</span>
                        {r.count > 1 && <span className="text-[8px] font-bold text-muted-foreground">{r.count}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Message Action Trigger Toolbar on Hover */}
              <div
                className={`flex items-center gap-1 mt-1 transition-opacity ${
                  isMenuOpenForThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {/* Emoji Reactions Quick Bar */}
                <div className="flex items-center gap-0.5 bg-card/90 backdrop-blur-sm border border-border rounded-full px-1.5 py-0.5 shadow-sm">
                  {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReactToMessage?.(chat.id, msg.id, emoji);
                      }}
                      className="hover:scale-125 text-xs transition-transform px-0.5"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Reply Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingMessage(msg);
                  }}
                  className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
                  title="Reply"
                >
                  <CornerUpLeft className="w-3 h-3" />
                </button>

                {/* Star Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarMessage?.(chat.id, msg.id);
                    toast.success(msg.isStarred ? 'Unstarred' : 'Starred message');
                  }}
                  className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-amber-400 shadow-sm"
                  title="Star message"
                >
                  <Star className={`w-3 h-3 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                {/* Copy Text Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(msg.text);
                    toast.success('Copied to clipboard');
                  }}
                  className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
                  title="Copy"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete Button */}
                {isMe && !msg.isDeleted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this message for everyone?')) {
                        onDeleteMessage?.(chat.id, msg.id, true);
                        toast.success('Message deleted for everyone');
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-red-400 shadow-sm"
                    title="Delete for everyone"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quoted Message Preview Docked Above Input */}
      {replyingMessage && (
        <div className="px-3 py-2 bg-muted/90 border-t border-border flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-2 min-w-0 border-l-4 border-emerald-500 pl-2">
            <CornerUpLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-400">
                Replying to {replyingMessage.senderId === currentUserId ? 'yourself' : chat.participant.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{replyingMessage.text}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingMessage(null)}
            className="w-6 h-6 rounded-full hover:bg-card flex items-center justify-center text-muted-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Bar / Voice Recorder Bar / Blocked State */}
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

            {/* Live animated recording waveform */}
            <div className="flex items-center gap-0.5 h-4 ml-1">
              {[40, 80, 50, 100, 60, 90, 70, 45, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${(h / 100) * 16}px`,
                    animationDuration: '600ms',
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">Recording audio note...</span>
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
          {/* Rich Attachments Menu Trigger (Paperclip) */}
          <button
            type="button"
            onClick={() => setIsAttachmentModalOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-muted transition-colors"
            title="Attach photo, document, location, or MoMo payment"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Quick Camera / Photo trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-muted transition-colors"
            title="Take photo from camera"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Input text box */}
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or catalog inquiry..."
            className="h-9 text-xs bg-muted/60 border-border rounded-full px-4 flex-1 focus-visible:ring-emerald-500"
          />

          {/* If text is entered, show Send; otherwise show Microphone button for 1-tap voice note! */}
          {inputText.trim() ? (
            <Button
              type="submit"
              size="sm"
              className="h-9 w-9 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={startVoiceRecording}
              className="h-9 w-9 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-500/20"
              title="Record voice note"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
        </form>
      )}

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSendImage={() => fileInputRef.current?.click()}
        onSendDocument={(fileName, fileSize) => {
          onSendMessage(chat.id, fileName, 'document', undefined, {
            documentSnippet: {
              fileName,
              fileSize,
              fileType: 'PDF Document',
            },
          });
          toast.success('Document shared!');
        }}
        onSendLocation={(title, address, lat, lng) => {
          onSendMessage(chat.id, title, 'location', undefined, {
            locationSnippet: {
              title,
              address,
              lat,
              lng,
            },
          });
          toast.success('Location pin shared!');
        }}
        onSendContact={(name, phone) => {
          onSendMessage(chat.id, `Contact: ${name}`, 'contact', undefined, {
            contactCard: {
              name,
              phone,
            },
          });
          toast.success('Contact card shared!');
        }}
        onSendMoMo={(amount, currency, note) => {
          const txId = 'MOMO-' + Math.floor(10000 + Math.random() * 90000);
          onSendMessage(chat.id, `Sent ${currency} ${amount.toLocaleString()}`, 'momo', undefined, {
            momoTransfer: {
              amount,
              currency,
              status: 'completed',
              txId,
            },
          });
          toast.success(`MoMo transfer of ${currency} ${amount.toLocaleString()} sent!`);
        }}
      />

      {/* Contact Info & Media Drawer */}
      <ChatInfoDrawer
        chat={chat}
        isOpen={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        onSetDisappearingTimer={(timer) => onSetDisappearingTimer?.(chat.id, timer)}
        onClearHistory={() => onClearChatHistory?.(chat.id)}
        onBlockUser={() => setIsBlockModalOpen(true)}
        onStartCall={(isVideo) => onStartCall(chat.participant, isVideo)}
      />

      {/* Block Contact Confirmation Dialog */}
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

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBlockModalOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onBlockUser?.(chat.participant.id);
                  setIsBlockModalOpen(false);
                  toast.success(`Blocked ${chat.participant.name}`);
                }}
                className="rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Block Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Contact Dialog */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Report {chat.participant.name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Help keep KAMATELA safe
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Select Reason</label>
              <div className="space-y-1.5">
                {reportReasonsList.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReportReason(r.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-colors ${
                        reportReason === r.id
                          ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-bold'
                          : 'bg-secondary/40 border-border text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onReportUser?.(chat.participant.id, reportReason, reportDetails, alsoBlockFromReport);
                  setIsReportModalOpen(false);
                  toast.success('Report submitted. Thank you for protecting KAMATELA community.');
                }}
                className="rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
