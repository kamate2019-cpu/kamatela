import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Radio,
  Camera,
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Users,
  Coins,
  Heart,
  Share2,
  Sliders,
  CheckCircle2,
  StopCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User, LiveStreamItem } from '@/types/kamatela';
import { soundEffects } from '@/utils/audioEffects';

interface LiveBroadcastHostModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onStartStream: (stream: LiveStreamItem) => void;
}

export const LiveBroadcastHostModal: React.FC<LiveBroadcastHostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onStartStream,
}) => {
  const [stage, setStage] = useState<'setup' | 'broadcasting' | 'summary'>('setup');
  const [streamTitle, setStreamTitle] = useState(
    `${currentUser.name}'s Live Stream ⚡ Join the vibe!`
  );
  const [category, setCategory] = useState<LiveStreamItem['category']>('Music');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState(false);
  const [beautyFilter, setBeautyFilter] = useState(true);

  // Live broadcast running state
  const [viewers, setViewers] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start/Stop camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStage('setup');
      setDurationSeconds(0);
      setViewers(0);
      setCoinsEarned(0);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Duration timer & simulated audience when broadcasting
  useEffect(() => {
    if (stage === 'broadcasting') {
      setViewers(18);
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);

        // Periodically adjust viewers & simulate gifts/likes
        if (Math.random() > 0.4) {
          setViewers((v) => Math.max(10, v + Math.floor(Math.random() * 5) - 2));
          setLikesCount((l) => l + Math.floor(Math.random() * 8) + 1);
        }

        if (Math.random() > 0.85) {
          const gifts = [20, 50, 100];
          const giftVal = gifts[Math.floor(Math.random() * gifts.length)];
          setCoinsEarned((c) => c + giftVal);
          toast.success(`🎁 Viewer sent you a gift (+${giftVal} coins)!`);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  const startCamera = async () => {
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });
        mediaStreamRef.current = stream;
        setHasCameraAccess(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setHasCameraAccess(false);
      }
    } catch (err) {
      console.warn('Webcam/mic access unavailable, using avatar simulation mode:', err);
      setHasCameraAccess(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
    toast.info(next ? 'Microphone muted' : 'Microphone unmuted');
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleStartBroadcast = () => {
    soundEffects.playConnectedChime();
    setStage('broadcasting');

    const newStream: LiveStreamItem = {
      id: 'live_' + Date.now(),
      title: streamTitle.trim() || `${currentUser.name} Live Stream`,
      host: currentUser,
      viewerCount: 25,
      category,
      thumbnailUrl: currentUser.avatar,
      isLive: true,
      startedAt: 'Just now',
      likesCount: 50,
      tags: [`#${category}`, '#KAMATELA', '#LiveNow'],
    };

    onStartStream(newStream);
    toast.success('🔴 You are now LIVE! Followers are being notified.');
  };

  const handleEndBroadcast = () => {
    soundEffects.playHangupBeep();
    setStage('summary');
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-3 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full md:h-[92vh] md:max-h-[750px] md:rounded-3xl bg-zinc-950 overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl text-white">
        {/* Main Video Viewfinder / Avatar Stage */}
        <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
          {hasCameraAccess ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${beautyFilter ? 'brightness-105 contrast-105' : ''}`}
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 via-zinc-900 to-black p-6 text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl animate-pulse">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg">
                  <Radio className="w-4 h-4 animate-spin" />
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-emerald-400">Interactive Studio Stage Active</p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                (Camera preview simulated if camera permission is pending)
              </p>
            </div>
          )}

          {/* Dimmer Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Top Header Controls */}
        <div className="relative z-30 p-3 pt-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {stage === 'broadcasting' ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-lg">
                <Radio className="w-3.5 h-3.5" /> LIVE
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/10">
                Setup Broadcast
              </div>
            )}

            {stage === 'broadcasting' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{viewers} viewers</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasCameraAccess && (
              <button
                type="button"
                onClick={handleFlipCamera}
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleMic}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content depending on Stage */}
        {stage === 'setup' && (
          <div className="relative z-30 p-4 pb-6 space-y-4 mt-auto bg-black/70 backdrop-blur-xl rounded-t-3xl border-t border-white/10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Broadcast Title
              </label>
              <Input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="What is your live stream about?"
                className="h-10 bg-white/10 border-white/20 text-white text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white">Stream Category</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['Music', 'Shopping', 'Lifestyle', 'Tech', 'Gaming', 'Talk'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      category === cat
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Studio Beauty Filter
              </span>
              <button
                type="button"
                onClick={() => setBeautyFilter(!beautyFilter)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  beautyFilter ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    beautyFilter ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <Button
              onClick={handleStartBroadcast}
              className="w-full h-11 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-2xl shadow-xl gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" /> Go Live Now
            </Button>
          </div>
        )}

        {stage === 'broadcasting' && (
          <div className="relative z-30 p-4 pb-6 space-y-4 mt-auto">
            {/* Live Stats Bar */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Duration</p>
                <p className="text-sm font-black text-white">{formatDuration(durationSeconds)}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Likes</p>
                <p className="text-sm font-black text-pink-400 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-current" /> {likesCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Coins</p>
                <p className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                  <Coins className="w-3 h-3 fill-current" /> +{coinsEarned}
                </p>
              </div>
            </div>

            <Button
              onClick={handleEndBroadcast}
              variant="destructive"
              className="w-full h-10 font-bold text-xs rounded-xl shadow-lg gap-2 bg-red-600/90 hover:bg-red-700"
            >
              <StopCircle className="w-4 h-4" /> End Live Broadcast
            </Button>
          </div>
        )}

        {stage === 'summary' && (
          <div className="relative z-30 m-auto p-6 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 text-center space-y-4 max-w-xs shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Broadcast Ended</h3>
              <p className="text-xs text-zinc-400 mt-1">Here is how your stream performed:</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400">Total Duration:</span>
                <p className="font-bold text-white">{formatDuration(durationSeconds)}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">Peak Viewers:</span>
                <p className="font-bold text-white">{Math.max(viewers, 28)}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">Hearts Received:</span>
                <p className="font-bold text-pink-400">{likesCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">Gift Earnings:</span>
                <p className="font-bold text-amber-400">+{coinsEarned} Coins</p>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Close Studio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
