import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  VideoOff,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Disc,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User, CallLog } from '@/types/kamatela';
import { soundEffects } from '@/utils/audioEffects';

interface CallOverlayModalProps {
  user: User | null;
  isVideo: boolean;
  isOpen: boolean;
  onClose: (completedDuration?: number) => void;
  onLogCall?: (log: Omit<CallLog, 'id'>) => void;
  onSaveCallMemo?: (memo: {
    partnerName: string;
    callType: 'voice' | 'video';
    durationSeconds: number;
    audioUrl?: string;
  }) => void;
}

export const CallOverlayModal: React.FC<CallOverlayModalProps> = ({
  user,
  isVideo: initialIsVideo,
  isOpen,
  onClose,
  onLogCall,
  onSaveCallMemo,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialIsVideo);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwappedView, setIsSwappedView] = useState(false);
  const [hasActiveVideoTrack, setHasActiveVideoTrack] = useState(false);
  const [statusText, setStatusText] = useState('Calling...');
  const [isConnected, setIsConnected] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for live voice bar

  // In-call audio recording memo state
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);
  const [recordMemoSeconds, setRecordMemoSeconds] = useState(0);
  const recordIntervalRef = useRef<number | null>(null);
  const memoDurationRef = useRef(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const durationRef = useRef(0);

  // Sync isVideo state on prop changes
  useEffect(() => {
    setIsVideoEnabled(initialIsVideo);
  }, [initialIsVideo]);

  // Keep local video element synced with mediaStream
  const attachStreamToVideo = () => {
    if (localVideoRef.current && mediaStreamRef.current) {
      if (localVideoRef.current.srcObject !== mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
      localVideoRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (isVideoEnabled) {
      attachStreamToVideo();
    }
  }, [isVideoEnabled, hasActiveVideoTrack, facingMode]);

  // Helper to start or switch camera track dynamically
  const startOrUpdateCamera = async (newFacing: 'user' | 'environment') => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Camera access not supported by browser.');
        return;
      }

      // Stop existing video tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          if (mediaStreamRef.current) {
            mediaStreamRef.current.removeTrack(track);
          }
        });
      }

      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: newFacing },
        },
      });

      const newVideoTrack = videoStream.getVideoTracks()[0];
      if (newVideoTrack) {
        if (!mediaStreamRef.current) {
          mediaStreamRef.current = videoStream;
        } else {
          mediaStreamRef.current.addTrack(newVideoTrack);
        }
        setHasActiveVideoTrack(true);
        setFacingMode(newFacing);
        setPermissionError(null);
        attachStreamToVideo();
      }
    } catch (err: unknown) {
      console.warn('Camera switch error:', err);
      const errObj = err as { name?: string; message?: string };
      if (errObj.name === 'NotAllowedError') {
        setPermissionError('Camera permission was denied. Tap browser settings to allow camera.');
      } else {
        setPermissionError('No physical webcam detected. Active simulated camera view loaded.');
      }
    }
  };

  // Flip front/rear camera
  const handleFlipCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    toast.info(`Switching to ${nextFacing === 'user' ? 'Front' : 'Rear'} Camera...`);
    await startOrUpdateCamera(nextFacing);
    toast.success(`Active: ${nextFacing === 'user' ? 'Selfie (Front)' : 'Main (Rear)'} Camera`);
  };

  // Handle calling setup and real MediaStream acquisition
  useEffect(() => {
    if (!isOpen || !user) {
      cleanupMedia();
      return;
    }

    setCallDuration(0);
    durationRef.current = 0;
    setStatusText('Ringing...');
    setIsConnected(false);
    setPermissionError(null);

    // Ensure audio hardware is unlocked and start audible dual-tone ringback
    soundEffects.unlock().then(() => {
      soundEffects.startRingtone();
    });

    // Request real Camera & Microphone access
    const initRealMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // If video call requested, start camera directly
          if (initialIsVideo) {
            await startOrUpdateCamera('user');
          }

          // Also acquire audio stream
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];

          if (audioTrack) {
            if (!mediaStreamRef.current) {
              mediaStreamRef.current = audioStream;
            } else {
              mediaStreamRef.current.addTrack(audioTrack);
            }

            // Setup real AudioAnalyser for live volume visualizer
            try {
              const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;

              const source = audioCtx.createMediaStreamSource(mediaStreamRef.current);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);
              analyserRef.current = analyser;

              const bufferLength = analyser.frequencyBinCount;
              const dataArray = new Uint8Array(bufferLength);

              const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / bufferLength;
                setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animFrameRef.current = requestAnimationFrame(updateVolume);
              };
              updateVolume();
            } catch (audioErr) {
              console.warn('Audio analyzer skipped:', audioErr);
            }
          }
        }
      } catch (err: unknown) {
        console.warn('Real camera/mic access failed or permission denied:', err);
        const errObj = err as { name?: string; message?: string };
        if (errObj.name === 'NotAllowedError') {
          setPermissionError('Camera/Mic permission was denied. Tap browser permissions to allow.');
        } else {
          setPermissionError('No physical camera/mic detected. Simulated video feed active.');
        }
      }
    };

    initRealMedia();

    // Call duration timer - only increments when connected
    const interval = setInterval(() => {
      setCallDuration((prev) => {
        if (!durationRef.current && durationRef.current === 0) return 0;
        const next = prev + 1;
        durationRef.current = next;
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      soundEffects.stopRingtone();
      cleanupMedia();
    };
  }, [isOpen, user, initialIsVideo]);

  const cleanupMedia = () => {
    soundEffects.stopRingtone();

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

  const handleAnswerCall = () => {
    soundEffects.stopRingtone();
    soundEffects.playConnectedChime();
    setStatusText('Connected');
    setIsConnected(true);
    setCallDuration(1);
    durationRef.current = 1;
    toast.success('Call connected');
  };

  const handleEndCall = () => {
    soundEffects.playHangupBeep();
    const finalDuration = durationRef.current;

    // If recording memo was active, save it upon ending call
    if (isRecordingMemo && memoDurationRef.current > 0 && onSaveCallMemo && user) {
      onSaveCallMemo({
        partnerName: user.businessName || user.name,
        callType: isVideoEnabled ? 'video' : 'voice',
        durationSeconds: memoDurationRef.current,
        audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
      });
      toast.success(`Voice memo (${memoDurationRef.current}s) saved to chat thread!`);
    }

    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    setIsRecordingMemo(false);

    // Log call record
    if (user && onLogCall) {
      onLogCall({
        partnerId: user.id,
        partnerName: user.businessName || user.name,
        partnerAvatar: user.avatar,
        type: isVideoEnabled ? 'video' : 'voice',
        direction: 'outgoing',
        status: isConnected ? 'completed' : 'missed',
        durationSeconds: isConnected ? finalDuration : 0,
        timestamp: 'Just now',
      });
    }

    cleanupMedia();
    onClose(finalDuration);
    toast.success(isConnected ? `Call ended (${formatTime(finalDuration)})` : 'Call ended');
  };

  const toggleRecordMemo = () => {
    if (!isConnected) {
      toast.info('Answer call first to record memo');
      return;
    }

    if (isRecordingMemo) {
      // Stop recording
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      const dur = memoDurationRef.current;
      setIsRecordingMemo(false);

      if (onSaveCallMemo && user && dur > 0) {
        onSaveCallMemo({
          partnerName: user.businessName || user.name,
          callType: isVideoEnabled ? 'video' : 'voice',
          durationSeconds: dur,
          audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
        });
        toast.success(`🎙️ Call recording memo (${dur}s) saved to chat thread!`);
      }
    } else {
      // Start recording
      setIsRecordingMemo(true);
      setRecordMemoSeconds(0);
      memoDurationRef.current = 0;
      toast.info('🔴 In-Call Audio Memo recording started...');

      recordIntervalRef.current = window.setInterval(() => {
        setRecordMemoSeconds((prev) => {
          const next = prev + 1;
          memoDurationRef.current = next;
          return next;
        });
      }, 1000);
    }
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = isMuted; // inverted because state hasn't updated yet
      });
    }
    setIsMuted(!isMuted);
    toast.info(!isMuted ? 'Microphone muted' : 'Microphone unmuted');
  };

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((t) => {
          t.enabled = false;
        });
      }
      setIsVideoEnabled(false);
      setHasActiveVideoTrack(false);
      toast.info('Camera turned off (Privacy mode)');
    } else {
      setIsVideoEnabled(true);
      const existingVideoTracks = mediaStreamRef.current?.getVideoTracks() || [];
      if (existingVideoTracks.length > 0) {
        existingVideoTracks.forEach((t) => {
          t.enabled = true;
        });
        setHasActiveVideoTrack(true);
        setTimeout(attachStreamToVideo, 50);
        toast.success('Camera turned on');
      } else {
        await startOrUpdateCamera(facingMode);
        toast.success('Camera activated');
      }
    }
  };

  if (!isOpen || !user) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-[600px] rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-border/60 p-5 flex flex-col justify-between items-center text-white relative shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full text-center pt-3 z-20 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            KAMATELA HD {isVideoEnabled ? 'Video' : 'Voice'} Call
          </div>

          <h2 className="text-xl font-bold truncate px-2">{user.businessName || user.name}</h2>
          <p className="text-xs text-white/70">
            {isConnected ? (
              <span className="text-emerald-400 font-mono font-bold">{formatTime(callDuration)}</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold animate-pulse">
                <span className="text-sm animate-bounce">🔔</span> Ringing phone... (Audio Tone Playing)
              </span>
            )}
          </p>

          {/* If dialing, manual Answer action (No automatic answer) */}
          {!isConnected && (
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleAnswerCall}
                className="px-3.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-lg flex items-center gap-1.5 active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" /> Answer Call (Simulate Pickup)
              </button>
            </div>
          )}

          {permissionError && (
            <div className="mt-1 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-200 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="truncate">{permissionError}</span>
            </div>
          )}
        </div>

        {/* Live Video Display or Avatar Visualizer */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-center my-3 z-10">
          {isVideoEnabled ? (
            <div className="relative w-full h-full max-h-[340px] rounded-2xl overflow-hidden bg-zinc-950 border border-white/20 shadow-2xl flex items-center justify-center select-none">
              {/* MAIN VIDEO FEED: Remote Partner OR User Camera (if swapped) */}
              {!isSwappedView ? (
                /* Remote Partner Feed */
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  {/* Partner Live Calling Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Partner Live Status Top Bar */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white/90">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> HD 720p 60fps
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-white/80 font-mono text-[9px] backdrop-blur-md">
                      📶 24ms
                    </span>
                  </div>

                  {/* Partner Name at Bottom Left */}
                  <div className="absolute bottom-3 left-3 text-left">
                    <p className="text-xs font-bold text-white drop-shadow-md">
                      {user.businessName || user.name}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium">Remote Camera Active</p>
                  </div>
                </div>
              ) : (
                /* User Camera Full Feed (When Swapped) */
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 backdrop-blur-md">
                      Self Camera ({facingMode === 'user' ? 'Front' : 'Rear'})
                    </span>
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="px-2 py-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20 flex items-center gap-1"
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" /> Flip
                    </button>
                  </div>
                </div>
              )}

              {/* PICTURE-IN-PICTURE (PiP) WINDOW */}
              <div
                onClick={() => setIsSwappedView(!isSwappedView)}
                className="absolute bottom-3 right-3 w-28 sm:w-32 h-40 rounded-xl bg-black/85 border-2 border-emerald-400/80 overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-transform z-20 group"
                title="Click to swap video view"
              >
                {!isSwappedView ? (
                  /* Self Camera in PiP */
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
                    />

                    {/* PiP Overlay Controls */}
                    <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                      {facingMode === 'user' ? 'Front' : 'Rear'}
                    </div>

                    {/* Flip Camera Action in PiP */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlipCamera();
                      }}
                      className="absolute top-1 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-emerald-600 text-white flex items-center justify-center border border-white/20 transition-colors shadow-md"
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-300" />
                    </button>

                    <div className="absolute bottom-1 left-0 right-0 text-center">
                      <span className="text-[8px] bg-black/70 text-white/80 px-1 py-0.2 rounded font-medium">
                        Tap to swap
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Remote Partner in PiP */
                  <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover filter brightness-90"
                    />
                    <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white/90">
                      Partner
                    </div>
                    <div className="absolute bottom-1 left-0 right-0 text-center">
                      <span className="text-[8px] bg-black/70 text-white/80 px-1 py-0.2 rounded font-medium">
                        Tap to swap
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-400/50 shadow-2xl p-1 bg-zinc-800 transition-transform duration-100"
                  style={{
                    transform: `scale(${1 + (audioLevel / 100) * 0.12})`,
                  }}
                >
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                </div>
                {isConnected && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-[10px]">
                    🎙️
                  </span>
                )}
              </div>

              {/* Real Live Mic Audio Level Visualizer */}
              {isConnected && (
                <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[10px] text-muted-foreground mr-1">Mic Level:</span>
                  {[20, 45, 80, 60, 30].map((baseline, i) => {
                    const dynamicHeight = Math.max(4, Math.round((baseline / 100) * (audioLevel * 0.25 + 8)));
                    return (
                      <div
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* In-Call Controls */}
        <div className="w-full flex items-center justify-around z-20 pb-2">
          {/* Mute Mic toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Record Call Audio Memo toggle */}
          {isConnected && (
            <button
              type="button"
              onClick={toggleRecordMemo}
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${
                isRecordingMemo
                  ? 'bg-rose-600 text-white shadow-lg animate-pulse ring-2 ring-rose-400'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isRecordingMemo ? 'Stop & Save Audio Memo to Chat' : 'Record Audio Memo to Chat'}
            >
              <Disc className={`w-5 h-5 ${isRecordingMemo ? 'animate-spin' : ''}`} />
              <span className="text-[8px] font-bold mt-0.5">
                {isRecordingMemo ? `${recordMemoSeconds}s` : 'Memo'}
              </span>
            </button>
          )}

          {/* Flip Camera button (Shown when video is active) */}
          {isVideoEnabled && (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
              title="Flip Front/Rear Camera"
            >
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </button>
          )}

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Camera Video Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isVideoEnabled
                ? 'bg-zinc-800 text-muted-foreground hover:bg-zinc-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
