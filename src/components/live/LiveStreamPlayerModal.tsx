import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Gift,
  Volume2,
  VolumeX,
  Users,
  Radio,
  ShoppingBag,
  Send,
  Sparkles,
  Coins,
  Plus,
  Check,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { LiveStreamItem, User, VirtualGift } from '@/types/kamatela';
import { soundEffects } from '@/utils/audioEffects';
import { GiftTrayModal } from '@/components/voiceRooms/GiftTrayModal';
import { CoinTopUpModal } from '@/components/wallet/CoinTopUpModal';

interface LiveStreamPlayerModalProps {
  stream: LiveStreamItem | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onDeductCoins?: (amount: number, title?: string, channel?: any) => boolean;
  onAddCoins?: (amount: number, channel?: any, amountUsd?: number) => void;
  onOpenProduct?: (product: any, host: User) => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  color: string;
}

const SIMULATED_COMMENTS = [
  { user: 'Liam K.', text: 'The video stream quality is so smooth! 🔥' },
  { user: 'Sarah M.', text: 'Greetings from Nairobi! 🇰🇪✨' },
  { user: 'David O.', text: 'Love this live track! Dropping hearts ❤️' },
  { user: 'Chloe B.', text: 'Can you show the product features again please?' },
  { user: 'Amara Z.', text: 'Super app live streaming is next level! 🚀' },
  { user: 'Tariq H.', text: 'Sent you a Diamond gift host! Keep going! 💎' },
  { user: 'Fatima E.', text: 'Sounds incredible on my studio headphones!' },
  { user: 'KenyanPulse', text: 'This creator is always dropping fire content 🎶' },
];

export const LiveStreamPlayerModal: React.FC<LiveStreamPlayerModalProps> = ({
  stream,
  currentUser,
  isOpen,
  onClose,
  onDeductCoins,
  onAddCoins,
  onOpenProduct,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likesCount, setLikesCount] = useState(stream?.likesCount || 1200);
  const [viewerCount, setViewerCount] = useState(stream?.viewerCount || 950);
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; isMe?: boolean }>>([
    { id: '1', user: 'System', text: 'Welcome to the live stream! Be respectful and follow community guidelines.' },
    { id: '2', user: 'TechFan99', text: 'Let’s go! First time watching live on Kamatela 🙌' },
  ]);
  const [inputText, setInputText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [isGiftTrayOpen, setIsGiftTrayOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [giftBanner, setGiftBanner] = useState<{ icon: string; name: string; sender: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Sync likes and viewers on stream open
  useEffect(() => {
    if (stream) {
      setLikesCount(stream.likesCount || 1200);
      setViewerCount(stream.viewerCount || 950);
    }
  }, [stream]);

  // Periodic simulated live comments & natural viewer fluctuation
  useEffect(() => {
    if (!isOpen || !stream) return;

    const commentInterval = setInterval(() => {
      const randomMsg = SIMULATED_COMMENTS[Math.floor(Math.random() * SIMULATED_COMMENTS.length)];
      setComments((prev) => [
        ...prev.slice(-25),
        {
          id: 'sim_' + Date.now(),
          user: randomMsg.user,
          text: randomMsg.text,
        },
      ]);
    }, 3800);

    const viewerInterval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(10, prev + delta);
      });
    }, 4500);

    return () => {
      clearInterval(commentInterval);
      clearInterval(viewerInterval);
    };
  }, [isOpen, stream]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  if (!isOpen || !stream) return null;

  const handleTapScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    // Spawn floating heart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const heartId = Date.now() + Math.random();
    setFloatingHearts((prev) => [...prev, { id: heartId, x, y, color: randomColor }]);
    setLikesCount((prev) => prev + 1);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = {
      id: 'me_' + Date.now(),
      user: currentUser.name || 'You',
      text: inputText.trim(),
      isMe: true,
    };
    setComments((prev) => [...prev, newComment]);
    setInputText('');
  };

  const handleSendGift = (gift: VirtualGift) => {
    if (onDeductCoins) {
      const success = onDeductCoins(
        gift.coins,
        `Sent ${gift.name} to ${stream.host.name} on Live Stream`,
        'Live Voice Room'
      );
      if (!success) {
        setIsGiftTrayOpen(false);
        setIsTopUpOpen(true);
        toast.error(`Not enough coins! You need ${gift.coins} coins.`);
        return;
      }
    }

    soundEffects.playConnectedChime();
    setIsGiftTrayOpen(false);

    setGiftBanner({
      icon: gift.icon,
      name: gift.name,
      sender: currentUser.name,
    });

    toast.success(`Sent ${gift.name} (${gift.coins} coins) to ${stream.host.name}! 🎁`);

    setComments((prev) => [
      ...prev,
      {
        id: 'gift_' + Date.now(),
        user: currentUser.name,
        text: `Sent ${gift.name} ${gift.icon} (+${gift.coins} coins)`,
        isMe: true,
      },
    ]);

    setTimeout(() => {
      setGiftBanner(null);
    }, 4500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: stream.title,
          text: `Watch ${stream.host.name} LIVE now on KAMATELA Super App!`,
          url: window.location.href,
        });
        toast.success('Live stream shared!');
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Live stream link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-3 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full md:h-[92vh] md:max-h-[750px] md:rounded-3xl bg-black overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl">
        {/* Background Live Video / Visualizer */}
        <div
          className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center bg-zinc-950"
          onClick={handleTapScreen}
        >
          {stream.videoUrl ? (
            <video
              ref={videoRef}
              src={stream.videoUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-950 via-zinc-900 to-black p-6 text-center select-none">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl animate-pulse">
                  <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider animate-bounce">
                  LIVE
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white max-w-xs">{stream.title}</h3>
              <p className="text-xs text-white/60 mt-1">Live Audio & Video Broadcast in progress</p>
            </div>
          )}

          {/* Gradient Dimmer for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
        </div>

        {/* Floating Hearts Click Particles */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            style={{ left: h.x - 12, top: h.y - 12, color: h.color }}
            className="absolute pointer-events-none animate-in fade-in zoom-in-150 duration-700 ease-out z-40 transform -translate-y-12"
          >
            <Heart className="w-7 h-7 fill-current drop-shadow-md" />
          </div>
        ))}

        {/* Top Header: Host info, Viewers, Live Badge, Close */}
        <div className="relative z-30 p-3 pt-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 max-w-[70%]">
            <img
              src={stream.host.avatar}
              alt={stream.host.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-400 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate">{stream.host.name}</span>
                {stream.host.verified && <span className="text-emerald-400 text-[10px]">✓</span>}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/70">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{likesCount.toLocaleString()} likes</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowed(!isFollowed);
                toast.success(isFollowed ? 'Unfollowed' : `Following ${stream.host.name}!`);
              }}
              className={`h-6 px-2 text-[10px] font-bold rounded-full transition-all ${
                isFollowed
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isFollowed ? 'Following' : '+ Follow'}
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-lg animate-pulse">
              <Radio className="w-3 h-3" />
              <span>LIVE</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs border border-white/10">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Special Gift Flying Banner Overlay */}
        {giftBanner && (
          <div className="relative z-30 mx-4 my-2 p-2 rounded-2xl bg-gradient-to-r from-amber-500/30 via-pink-500/30 to-purple-600/30 border border-amber-400/50 backdrop-blur-md flex items-center gap-2 text-white animate-in slide-in-from-left duration-300">
            <span className="text-2xl animate-bounce">{giftBanner.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-200">
                {giftBanner.sender} sent <span className="text-white">{giftBanner.name}</span>!
              </p>
              <p className="text-[10px] text-white/70">Stage Gift Effect Activated 🚀</p>
            </div>
          </div>
        )}

        {/* Bottom Section: Chat overlay & Controls */}
        <div className="relative z-30 p-3 pb-4 space-y-2 mt-auto">
          {/* Pinned Live Shopping Product Banner (if available) */}
          {stream.linkedProduct && (
            <div
              onClick={() => onOpenProduct && onOpenProduct(stream.linkedProduct, stream.host)}
              className="p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-400/40 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-black/80 transition-all shadow-xl"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img src={stream.linkedProduct.imageUrl} alt={stream.linkedProduct.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-black uppercase">
                    Live Deal
                  </span>
                  <p className="text-xs font-bold text-white truncate">{stream.linkedProduct.title}</p>
                  <p className="text-xs font-extrabold text-emerald-400">
                    {stream.linkedProduct.currency}{stream.linkedProduct.price}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenProduct && stream.linkedProduct) {
                    onOpenProduct(stream.linkedProduct, stream.host);
                  }
                }}
                className="h-7 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[11px] gap-1 shrink-0"
              >
                <ShoppingBag className="w-3 h-3" /> Buy
              </Button>
            </div>
          )}

          {/* Scrolling Live Chat Feed */}
          <div className="h-36 overflow-y-auto space-y-1.5 text-xs pr-1 scrollbar-none mask-gradient">
            {comments.map((c) => (
              <div
                key={c.id}
                className="inline-block max-w-[85%] px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white"
              >
                <span className={`font-bold mr-1.5 ${c.isMe ? 'text-emerald-400' : 'text-purple-300'}`}>
                  {c.user}:
                </span>
                <span className="text-white/90">{c.text}</span>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          {/* Bottom Control Bar: Chat Input, Mute, Gift Tray, Share, Heart button */}
          <div className="flex items-center gap-2 pt-1">
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Say something live..."
                className="h-9 bg-black/60 border-white/20 text-white placeholder:text-white/50 text-xs rounded-full pl-3 pr-8 backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-1.5 w-6 h-6 rounded-full bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 shrink-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsGiftTrayOpen(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center hover:opacity-90 shadow-lg shrink-0 animate-pulse"
              title="Send Gift"
            >
              <Gift className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 shrink-0"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => handleTapScreen(e as unknown as React.MouseEvent<HTMLDivElement>)}
              className="w-9 h-9 rounded-full bg-pink-600/80 backdrop-blur-md border border-pink-400/40 text-white flex items-center justify-center hover:bg-pink-500 shrink-0"
              title="Like"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
            </button>
          </div>
        </div>

        {/* Gift Tray Modal */}
        <GiftTrayModal
          isOpen={isGiftTrayOpen}
          onClose={() => setIsGiftTrayOpen(false)}
          eligibleRecipients={[stream.host]}
          senderCoins={currentUser.coins || 500}
          onSendGift={(gift) => handleSendGift(gift)}
          onOpenTopUp={() => {
            setIsGiftTrayOpen(false);
            setIsTopUpOpen(true);
          }}
        />

        {/* Coin Top Up Modal */}
        <CoinTopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          currentBalance={currentUser.coins || 500}
          onTopUp={(added, channel, amountUsd) => {
            if (onAddCoins) onAddCoins(added, channel, amountUsd);
            setIsTopUpOpen(false);
            setIsGiftTrayOpen(true);
          }}
        />
      </div>
    </div>
  );
};
