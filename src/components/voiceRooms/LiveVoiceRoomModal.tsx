import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Hand,
  LogOut,
  Users,
  Shield,
  Sparkles,
  Share2,
  Volume2,
  Radio,
  UserPlus,
  Crown,
  Music,
  Play,
  Pause,
  Square,
  Gift,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { VoiceRoom, User, VoiceRoomParticipant, AIMusicTrack, VirtualGift, GiftEvent } from '@/types/kamatela';
import { soundEffects } from '@/utils/audioEffects';
import { aiMusicSynth } from '@/utils/aiMusicSynth';
import { GiftTrayModal } from './GiftTrayModal';
import { CoinTopUpModal } from '@/components/wallet/CoinTopUpModal';
import { VoiceRoomGamesModal } from './VoiceRoomGamesModal';
import { Trophy } from 'lucide-react';

interface LiveVoiceRoomModalProps {
  room: VoiceRoom | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onToggleMute: (roomId: string, userId: string) => void;
  onRaiseHand: (roomId: string, userId: string) => void;
  onPromoteSpeaker: (roomId: string, userId: string) => void;
  onDemoteSpeaker: (roomId: string, userId: string) => void;
  musicTracks?: AIMusicTrack[];
  onDeductCoins?: (amount: number) => boolean;
  onAddCoins?: (amount: number, channel?: string, amountUsd?: number) => void;
}

export const LiveVoiceRoomModal: React.FC<LiveVoiceRoomModalProps> = ({
  room,
  currentUser,
  isOpen,
  onClose,
  onToggleMute,
  onRaiseHand,
  onPromoteSpeaker,
  onDemoteSpeaker,
  musicTracks,
  onDeductCoins,
  onAddCoins,
}) => {
  const [localMuted, setLocalMuted] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [realAudioLevel, setRealAudioLevel] = useState(0);
  const [broadcastingTrack, setBroadcastingTrack] = useState<AIMusicTrack | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isGiftTrayOpen, setIsGiftTrayOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
  const [activeGiftBurst, setActiveGiftBurst] = useState<GiftEvent | null>(null);
  const [stageEventBanners, setStageEventBanners] = useState<
    Array<{ id: string; text: string; icon: string }>
  >([]);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const myParticipant = room?.participants.find((p) => p.user.id === currentUser.id);
  const isHost = room?.host.id === currentUser.id || myParticipant?.role === 'host';
  const isSpeaker = isHost || myParticipant?.role === 'speaker';

  const handleShareRoom = async () => {
    if (!room) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${room.title}" on KAMATELA Voice Rooms!`,
          text: `Hey, I'm live in "${room.title}" on KAMATELA Super App. Tap to join the live audio stage!`,
          url: window.location.href,
        });
        toast.success('Room invitation shared via native share!');
        return;
      } catch {
        // dismissed
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Room invitation link copied to clipboard!');
  };

  const handleToggleBgm = (track: AIMusicTrack) => {
    if (isBgmPlaying && broadcastingTrack?.id === track.id) {
      aiMusicSynth.stop();
      setIsBgmPlaying(false);
      toast.info('Paused live background music broadcast');
    } else {
      aiMusicSynth.playTrack(track.id, track.genre, () => {
        setIsBgmPlaying(false);
      });
      setBroadcastingTrack(track);
      setIsBgmPlaying(true);
      toast.success(`Broadcasting "${track.title}" on stage!`);
    }
  };

  const handleStopBgm = () => {
    aiMusicSynth.stop();
    setIsBgmPlaying(false);
    setBroadcastingTrack(null);
    toast.info('Stopped background music broadcast');
  };

  const handleSendGift = (gift: VirtualGift, recipient: User) => {
    if (onDeductCoins) {
      const success = onDeductCoins(gift.coins);
      if (!success) {
        toast.error(`Need ${gift.coins} coins. Please top up your wallet!`);
        setIsTopUpOpen(true);
        return;
      }
    }
    soundEffects.playConnectedChime();
    const giftEvent: GiftEvent = {
      id: 'gift_' + Date.now(),
      sender: currentUser,
      recipient,
      gift,
      timestamp: 'Just now',
    };
    setActiveGiftBurst(giftEvent);
    setStageEventBanners((prev) => [
      {
        id: giftEvent.id,
        text: `${currentUser.name} sent ${gift.name} to ${recipient.name}!`,
        icon: gift.icon,
      },
      ...prev.slice(0, 2),
    ]);
    toast.success(`Sent ${gift.icon} ${gift.name} to ${recipient.name}! 🪙 -${gift.coins}`);

    setTimeout(() => {
      setActiveGiftBurst(null);
    }, 4500);
  };

  // Request real microphone stream for speakers/host
  useEffect(() => {
    if (!isOpen || !room) {
      cleanupMicrophone();
      return;
    }

    soundEffects.playConnectedChime();

    const initMicrophone = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            setRealAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        }
      } catch (err) {
        console.warn('Microphone permission or hardware not found in voice room:', err);
      }
    };

    if (isSpeaker) {
      initMicrophone();
    }

    return () => {
      cleanupMicrophone();
    };
  }, [isOpen, room?.id, isSpeaker]);

  const cleanupMicrophone = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleToggleMute = () => {
    if (!room) return;
    const nextMuted = !localMuted;
    setLocalMuted(nextMuted);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    onToggleMute(room.id, currentUser.id);
    toast.info(nextMuted ? 'Microphone muted' : 'Microphone is live!');
  };

  const handleRaiseHand = () => {
    if (!room) return;
    const nextHand = !hasRaisedHand;
    setHasRaisedHand(nextHand);
    onRaiseHand(room.id, currentUser.id);
    toast.success(nextHand ? 'Raised hand ✋ Host will see your request' : 'Lowered hand');
  };

  const handleLeave = () => {
    soundEffects.playHangupBeep();
    cleanupMicrophone();
    onClose();
    toast.info('Left the voice room');
  };

  if (!isOpen || !room) return null;

  const speakers = room.participants.filter((p) => p.role === 'host' || p.role === 'speaker');
  const listeners = room.participants.filter((p) => p.role === 'listener');

  const eligibleRecipients = [
    room.host,
    ...speakers.filter((s) => s.user.id !== room.host.id).map((s) => s.user),
  ].filter((u, index, self) => index === self.findIndex((t) => t.id === u.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[92vh] max-h-[700px] rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-border/80 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Top Room Header */}
        <div className="p-4 border-b border-white/10 shrink-0 z-10 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE STAGE
              </span>
              <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-white/5">
                {room.topic}
              </span>
            </div>
            <h2 className="text-base font-bold text-white truncate">{room.title}</h2>
            <p className="text-[11px] text-white/60 line-clamp-1">{room.description}</p>
          </div>

          <button
            type="button"
            onClick={handleShareRoom}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 shrink-0"
            title="Share Room"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Live Background Music Broadcast Banner */}
        {broadcastingTrack && (
          <div className="mx-4 mt-2 p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-purple-500/30">
                <img src={broadcastingTrack.coverUrl} alt={broadcastingTrack.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                    STAGE BGM
                  </span>
                  <span className="text-[9px] text-zinc-400">{broadcastingTrack.genre}</span>
                </div>
                <p className="text-xs font-bold text-white truncate">{broadcastingTrack.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isHost && (
                <>
                  <button
                    type="button"
                    onClick={() => handleToggleBgm(broadcastingTrack)}
                    className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center"
                    title={isBgmPlaying ? 'Pause BGM' : 'Play BGM'}
                  >
                    {isBgmPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopBgm}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center"
                    title="Stop BGM"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Host BGM Quick Selector (if not yet broadcasting) */}
        {isHost && !broadcastingTrack && musicTracks && musicTracks.length > 0 && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[11px] text-zinc-300 truncate">
                Stream AI BGM: <strong className="text-white">{musicTracks[0].title}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleToggleBgm(musicTracks[0])}
              className="px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shrink-0"
            >
              Broadcast
            </button>
          </div>
        )}

        {/* Stage Event Banners (Live Gift Feeds) */}
        {stageEventBanners.length > 0 && (
          <div className="mx-4 mt-2 space-y-1 z-20 pointer-events-none">
            {stageEventBanners.map((b) => (
              <div
                key={b.id}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/40 text-xs font-bold text-amber-200 flex items-center gap-2 shadow-lg backdrop-blur-md animate-in slide-in-from-left duration-300"
              >
                <span className="text-base">{b.icon}</span>
                <span className="truncate">{b.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Full-Stage Animated Virtual Gift Burst Overlay */}
        {activeGiftBurst && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 pointer-events-none animate-in zoom-in-75 fade-in duration-300">
            {/* Pulsing Aura */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500/30 via-pink-500/40 to-purple-600/40 blur-2xl animate-pulse" />

              {/* Floating Gift Icon */}
              <div className="text-7xl filter drop-shadow-2xl animate-bounce">
                {activeGiftBurst.gift.icon}
              </div>
            </div>

            {/* Gift Title & Coin Banner */}
            <div className="mt-4 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg">
                <Coins className="w-3.5 h-3.5 fill-current" />
                <span>+{activeGiftBurst.gift.coins} Coins Sent!</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-wide">
                {activeGiftBurst.gift.name}
              </h3>
            </div>

            {/* Sender & Recipient Badges */}
            <div className="mt-4 flex items-center gap-3 bg-zinc-900/90 border border-white/20 px-4 py-2 rounded-2xl shadow-xl">
              <div className="flex items-center gap-1.5">
                <img
                  src={activeGiftBurst.sender.avatar}
                  alt={activeGiftBurst.sender.name}
                  className="w-6 h-6 rounded-full object-cover border border-purple-400"
                />
                <span className="text-xs font-bold text-purple-300">
                  {activeGiftBurst.sender.name}
                </span>
              </div>

              <span className="text-amber-400 font-bold text-xs">➡️</span>

              <div className="flex items-center gap-1.5">
                <img
                  src={activeGiftBurst.recipient.avatar}
                  alt={activeGiftBurst.recipient.name}
                  className="w-6 h-6 rounded-full object-cover border border-pink-400"
                />
                <span className="text-xs font-bold text-pink-300">
                  {activeGiftBurst.recipient.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Room Participants Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10">
          {/* Speakers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Speakers on Stage ({speakers.length})
              </h3>
              {isSpeaker && !localMuted && (
                <span className="text-[10px] text-emerald-400 font-mono animate-pulse">
                  🎙️ Real Mic Live
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {speakers.map((p) => {
                const isMe = p.user.id === currentUser.id;
                const isSpeakingNow = isMe ? !localMuted && realAudioLevel > 15 : p.isSpeaking;

                return (
                  <div
                    key={p.user.id}
                    className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center relative group"
                  >
                    {/* Host crown badge */}
                    {p.role === 'host' && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}

                    {/* Avatar with speaking wave glow */}
                    <div className="relative mb-2">
                      <div
                        className={`w-14 h-14 rounded-full p-0.5 overflow-hidden transition-all duration-150 ${
                          isSpeakingNow
                            ? 'ring-4 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                            : 'ring-1 ring-white/20'
                        }`}
                      >
                        <img
                          src={p.user.avatar}
                          alt={p.user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      {/* Mute status badge */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow border border-black ${
                          isMe && localMuted
                            ? 'bg-rose-500 text-white'
                            : p.isMuted
                            ? 'bg-zinc-700 text-white/70'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isMe ? (
                          localMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />
                        ) : p.isMuted ? (
                          <MicOff className="w-3 h-3" />
                        ) : (
                          <Mic className="w-3 h-3" />
                        )}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-white truncate max-w-full">
                      {isMe ? 'You' : p.user.businessName || p.user.name}
                    </p>
                    <span className="text-[10px] text-white/50 capitalize mt-0.5">
                      {p.role}
                    </span>

                    {/* Host demote control */}
                    {isHost && !isMe && p.role === 'speaker' && (
                      <button
                        type="button"
                        onClick={() => onDemoteSpeaker(room.id, p.user.id)}
                        className="mt-1 text-[9px] text-white/40 hover:text-rose-400 underline"
                      >
                        Move to Audience
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Listeners Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Audience & Listeners ({listeners.length})
            </h3>

            {listeners.length === 0 ? (
              <p className="text-xs text-white/40 italic py-2">No listeners yet in audience.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2.5">
                {listeners.map((p) => {
                  const isMe = p.user.id === currentUser.id;

                  return (
                    <div
                      key={p.user.id}
                      className="flex flex-col items-center p-2 rounded-xl bg-white/5 text-center relative"
                    >
                      {/* Raised hand indicator */}
                      {(isMe ? hasRaisedHand : p.raisedHand) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] animate-bounce shadow">
                          ✋
                        </span>
                      )}

                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 mb-1">
                        <img
                          src={p.user.avatar}
                          alt={p.user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[11px] font-medium text-white/80 truncate max-w-full">
                        {isMe ? 'You' : p.user.name}
                      </p>

                      {/* Host promote button */}
                      {isHost && (
                        <button
                          type="button"
                          onClick={() => {
                            onPromoteSpeaker(room.id, p.user.id);
                            toast.success(`Invited ${p.user.name} to the speaker stage!`);
                          }}
                          className="mt-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[9px] font-bold"
                        >
                          + Stage
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* In-Room Bottom Action Bar */}
        <div className="p-3 bg-zinc-950/90 border-t border-white/10 flex items-center justify-between gap-2 shrink-0 z-20">
          {/* Leave Quietly */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLeave}
            className="h-10 px-3 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Leave Quietly
          </Button>

          <div className="flex items-center gap-2">
            {/* Stage Interactive Games Button */}
            <button
              type="button"
              onClick={() => setIsGamesModalOpen(true)}
              className="h-10 px-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
              title="Play Stage Trivia Quiz & Spin Lucky Wheel"
            >
              <Trophy className="w-4 h-4 fill-current" />
              <span>Games</span>
            </button>

            {/* Gift Button with Sender Coin Badge */}
            <button
              type="button"
              onClick={() => setIsGiftTrayOpen(true)}
              className="h-10 px-3.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
              title="Send Virtual Gift"
            >
              <Gift className="w-4 h-4" />
              <span>Gift</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-amber-300 font-mono text-[10px] flex items-center gap-0.5">
                🪙 {currentUser.coins ?? 500}
              </span>
            </button>

            {/* Raise Hand Button for Audience */}
            {!isSpeaker && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRaiseHand}
                className={`h-10 px-3.5 rounded-full text-xs font-semibold gap-1.5 border-white/20 ${
                  hasRaisedHand
                    ? 'bg-amber-500 text-black border-amber-500 font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Hand className="w-4 h-4" />
                {hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}
              </Button>
            )}

            {/* Microphone Toggle for Speakers & Host */}
            {isSpeaker && (
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  localMuted
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
                }`}
                title={localMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {localMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Gift Tray Modal */}
        <GiftTrayModal
          isOpen={isGiftTrayOpen}
          onClose={() => setIsGiftTrayOpen(false)}
          eligibleRecipients={eligibleRecipients}
          senderCoins={currentUser.coins ?? 500}
          onSendGift={handleSendGift}
          onOpenTopUp={() => setIsTopUpOpen(true)}
        />

        {/* Coin Top-Up Modal */}
        <CoinTopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          currentBalance={currentUser.coins ?? 500}
          onTopUp={(amount, channel, amountUsd) => {
            if (onAddCoins) {
              onAddCoins(amount, channel, amountUsd);
            }
          }}
        />

        {/* Stage Interactive Games Modal */}
        {room && (
          <VoiceRoomGamesModal
            isOpen={isGamesModalOpen}
            onClose={() => setIsGamesModalOpen(false)}
            roomTitle={room.title}
            onRewardCoins={(coins, gameName) => {
              if (onAddCoins) {
                onAddCoins(coins, 'In-App Game');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
