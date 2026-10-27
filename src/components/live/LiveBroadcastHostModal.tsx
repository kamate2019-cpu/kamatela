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
import type { User, LiveStreamItem, LiveStreamCoHost } from '@/types/kamatela';
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
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Dual Live Co-Hosting State
  const [coHost, setCoHost] = useState<LiveStreamCoHost | null>(null);
  const [isCoHostDrawerOpen, setIsCoHostDrawerOpen] = useState(false);

  const ACTIVE_VIEWERS: User[] = [
    {
      id: 'v_elena',
      name: 'Elena Rostova',
      handle: '@elena_live',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Music creator & live enthusiast',
      isBusiness: false,
      followersCount: 1420,
      followingCount: 310,
      likesCount: 5200,
      verified: true,
    },
    {
      id: 'v_marcus',
      name: 'Marcus Vance',
      handle: '@marcus_v',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Beatmaker & tech streamer',
      isBusiness: false,
      followersCount: 890,
      followingCount: 420,
      likesCount: 3100,
    },
    {
      id: 'v_chloe',
      name: 'Chloe Bennett',
      handle: '@chloeb',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Digital artist & vocalist',
      isBusiness: false,
      followersCount: 2300,
      followingCount: 512,
      likesCount: 9400,
      verified: true,
    },
  ];

  const handleInviteCoHost = (guest: User) => {
    soundEffects.playConnectedChime();
    const newCoHost: LiveStreamCoHost = {
      user: guest,
      isMuted: false,
      isCameraOff: false,
      joinedAt: Date.now(),
    };
    setCoHost(newCoHost);
    setIsCoHostDrawerOpen(false);
    toast.success(`🎉 ${guest.name} joined as Co-Host! Screen switched to Dual Live view.`);
  };

  const handleDisconnectCoHost = () => {
    soundEffects.playHangupBeep();
    setCoHost(null);
    setIsCoHostDrawerOpen(false);
    toast.info('Co-host disconnected. Reverted to single broadcast view.');
  };

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

  const attachStreamToVideo = (stream: MediaStream | null) => {
    if (videoRef.current && stream) {
      try {
        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        videoRef.current.play().catch(() => {});
      } catch (err) {
        console.warn('attachStreamToVideo error:', err);
      }
    }
  };

  const setVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && mediaStreamRef.current) {
      try {
        if (el.srcObject !== mediaStreamRef.current) {
          el.srcObject = mediaStreamRef.current;
        }
        el.play().catch(() => {});
      } catch (err) {
        console.warn('setVideoRef error:', err);
      }
    }
  };

  // Re-attach video stream whenever layout/state renders new video elements
  useEffect(() => {
    if (hasCameraAccess && mediaStreamRef.current) {
      attachStreamToVideo(mediaStreamRef.current);
    }
  }, [hasCameraAccess, stage, coHost]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      let stream: MediaStream | null = null;
      // Step 1: Requested facing mode + audio
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });
      } catch (err1) {
        console.warn('Attempt 1 (video+audio) failed, trying video only:', err1);
        // Step 2: Video only with facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false,
          });
        } catch (err2) {
          console.warn('Attempt 2 (video facingMode) failed, trying generic video:', err2);
          // Step 3: Generic video device
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (stream) {
        mediaStreamRef.current = stream;
        setHasCameraAccess(true);
        setCameraError(null);
        attachStreamToVideo(stream);
        toast.success('Live Camera connected');
      } else {
        setHasCameraAccess(false);
      }
    } catch (err: any) {
      console.warn('Webcam/mic access unavailable, using avatar simulation mode:', err);
      setHasCameraAccess(false);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in browser settings.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Camera could not be activated.';
      setCameraError(msg);
      toast.info(msg);
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
    setHasCameraAccess(false);
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
        <div className="absolute inset-0 flex flex-col bg-black overflow-hidden">
          {stage === 'broadcasting' && coHost ? (
            /* Split-Screen Dual Live View for Host */
            <div className="relative w-full h-full flex flex-col">
              {/* TOP PANE: Host's Live Camera Feed */}
              <div className="relative flex-1 w-full bg-zinc-900 overflow-hidden border-b-2 border-emerald-500/40">
                {hasCameraAccess ? (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${beautyFilter ? 'brightness-105 contrast-105' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 via-zinc-900 to-black p-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg animate-pulse">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-white truncate">{currentUser.name} (Host)</span>
                  </div>
                )}
                <div className="absolute top-14 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">You</span>
                  <span className="text-emerald-400 text-[9px] font-black uppercase ml-1">HOST</span>
                </div>
              </div>

              {/* CENTER DIVIDER: Duo Live Badge */}
              <div className="relative z-20 flex items-center justify-center -my-3 pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 border border-white/20">
                  <Users className="w-3 h-3 animate-pulse" />
                  <span>DUO LIVE BROADCAST</span>
                </div>
              </div>

              {/* BOTTOM PANE: Co-Host Live Feed */}
              <div className="relative flex-1 w-full bg-zinc-950 overflow-hidden">
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-cyan-950/80 to-zinc-900 p-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg animate-pulse">
                    <img src={coHost.user.avatar} alt={coHost.user.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-white truncate max-w-[200px]">{coHost.user.name}</span>
                  <span className="text-[10px] text-cyan-300 font-medium">Guest Co-Host Live</span>
                </div>

                <div className="absolute top-4 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold">{coHost.user.name}</span>
                  <span className="text-cyan-400 text-[9px] font-black uppercase ml-1">CO-HOST</span>
                </div>
              </div>
            </div>
          ) : hasCameraAccess ? (
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${beautyFilter ? 'brightness-105 contrast-105' : ''}`}
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-950 via-zinc-900 to-black p-6 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl animate-pulse">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-lg">
                  <Radio className="w-4 h-4 animate-spin" />
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-emerald-400">Broadcaster Camera Stage</p>
              <p className="text-[11px] text-zinc-300 mt-1 max-w-xs">
                {cameraError || 'Camera permission pending or device not yet activated.'}
              </p>
              <Button
                type="button"
                onClick={startCamera}
                size="sm"
                className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full gap-1.5 shadow-lg px-4"
              >
                <Camera className="w-4 h-4" /> Turn On Camera
              </Button>
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

            {stage === 'broadcasting' && (
              <button
                type="button"
                onClick={() => setIsCoHostDrawerOpen(true)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all shadow-md ${
                  coHost
                    ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 animate-pulse'
                    : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
                }`}
                title="Manage Co-Host"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{coHost ? '1 Co-Host' : '+ Co-Host'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={hasCameraAccess ? stopCamera : startCamera}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                hasCameraAccess
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                  : 'bg-black/50 hover:bg-black/80 text-white border-white/20'
              }`}
              title={hasCameraAccess ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              <Camera className="w-4 h-4" />
            </button>

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

            {/* If Co-Host active, offer quick disconnect button */}
            {coHost && (
              <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 backdrop-blur-md flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={coHost.user.avatar}
                    alt={coHost.user.name}
                    className="w-7 h-7 rounded-full object-cover border border-cyan-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{coHost.user.name}</p>
                    <p className="text-[10px] text-cyan-300">Live on stage with you</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnectCoHost}
                  className="h-7 px-2.5 rounded-xl border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-bold"
                >
                  Disconnect
                </Button>
              </div>
            )}

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

        {/* Live Co-Host Management Modal */}
        {isCoHostDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/20 p-5 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Co-Host Studio</h3>
                    <p className="text-[11px] text-zinc-400">Dual Split-Screen Broadcasting</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCoHostDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {coHost ? (
                <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={coHost.user.avatar}
                      alt={coHost.user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{coHost.user.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 text-[9px] font-black uppercase">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Currently broadcasting split-screen</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDisconnectCoHost}
                    variant="destructive"
                    className="w-full h-9 rounded-xl text-xs font-bold gap-1.5"
                  >
                    Disconnect Co-Host
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Active Viewers in Room</span>
                    <span className="text-[11px] text-emerald-400">{ACTIVE_VIEWERS.length} Available</span>
                  </div>

                  <div className="space-y-2">
                    {ACTIVE_VIEWERS.map((viewer) => (
                      <div
                        key={viewer.id}
                        className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={viewer.avatar}
                            alt={viewer.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{viewer.name}</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Watching Live
                            </p>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleInviteCoHost(viewer)}
                          className="h-8 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-[11px] shadow-md"
                        >
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                    Invited guests will appear alongside you in a synchronized dual video layout.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
