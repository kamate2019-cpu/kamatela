import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '@/utils/audioEffects';
import type { User } from '@/types/kamatela';

interface IncomingCallModalProps {
  isOpen: boolean;
  caller: User | null;
  callType: 'voice' | 'video';
  onAccept: (callType: 'voice' | 'video') => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  caller,
  callType,
  onAccept,
  onDecline,
}) => {
  const [isMutedRingtone, setIsMutedRingtone] = useState(false);
  const [sliderPos, setSliderPos] = useState(0); // -100 to 100 for swipe gesture

  useEffect(() => {
    if (!isOpen || !caller) {
      soundEffects.stopRingtone();
      return;
    }

    // Play ringing tone
    soundEffects.unlock().then(() => {
      soundEffects.startRingtone();
    });

    return () => {
      soundEffects.stopRingtone();
    };
  }, [isOpen, caller]);

  if (!isOpen || !caller) return null;

  const handleAccept = () => {
    soundEffects.stopRingtone();
    soundEffects.playConnectedChime();
    onAccept(callType);
  };

  const handleDecline = () => {
    soundEffects.stopRingtone();
    soundEffects.playHangupBeep();
    onDecline();
  };

  const toggleRingtoneMute = () => {
    if (isMutedRingtone) {
      soundEffects.startRingtone();
      setIsMutedRingtone(false);
    } else {
      soundEffects.stopRingtone();
      setIsMutedRingtone(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 animate-in fade-in duration-300">
      <div className="w-full max-w-sm h-[620px] rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-emerald-500/30 p-6 flex flex-col justify-between items-center text-white relative shadow-2xl overflow-hidden">
        {/* Pulsating Neon Glow Rings */}
        <div className="absolute top-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute top-28 w-44 h-44 rounded-full border border-emerald-500/30 animate-ping opacity-25 pointer-events-none" />
        <div className="absolute top-24 w-52 h-52 rounded-full border border-emerald-400/20 animate-pulse pointer-events-none" />

        {/* Top Header & Mute Ringer button */}
        <div className="w-full flex items-center justify-between z-10 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            {callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            Incoming WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call
          </div>

          <button
            type="button"
            onClick={toggleRingtoneMute}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title={isMutedRingtone ? 'Unmute Ringtone' : 'Mute Ringtone'}
          >
            {isMutedRingtone ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Caller Avatar & Info */}
        <div className="flex flex-col items-center gap-4 z-10 my-auto text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-400/80 shadow-2xl p-1 bg-zinc-800 animate-bounce duration-1000">
              <img
                src={caller.avatar}
                alt={caller.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-xs shadow-lg animate-pulse">
              🔔
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              {caller.businessName || caller.name}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified KAMATELA Caller
            </p>
            <p className="text-[11px] text-white/60">
              {caller.isBusiness ? `${caller.businessCategory || 'Merchant'} • Super App Partner` : caller.handle}
            </p>
          </div>
        </div>

        {/* Swipe-to-Answer / Decline Interactive Slider */}
        <div className="w-full z-10 space-y-4 pb-4">
          {/* Interactive Swipe Track */}
          <div className="relative w-full h-16 rounded-full bg-zinc-900/90 border border-white/20 p-1 flex items-center justify-between shadow-inner overflow-hidden select-none">
            {/* Left Decline Zone */}
            <div className="flex items-center pl-4 gap-1 text-xs font-bold text-rose-400/80">
              <PhoneOff className="w-4 h-4" />
              <span>Decline</span>
            </div>

            {/* Center Hint */}
            <div className="text-[11px] text-white/50 font-medium">
              Swipe Left / Right
            </div>

            {/* Right Accept Zone */}
            <div className="flex items-center pr-4 gap-1 text-xs font-bold text-emerald-400/80">
              <span>Answer</span>
              <Phone className="w-4 h-4" />
            </div>

            {/* Draggable Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-transform"
              style={{
                transform: `translateX(calc(-50% + ${sliderPos}px))`,
                backgroundColor: sliderPos < -30 ? '#ef4444' : sliderPos > 30 ? '#10b981' : '#8b5cf6',
              }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const delta = moveEvent.clientX - startX;
                  const clamped = Math.max(-110, Math.min(110, delta));
                  setSliderPos(clamped);
                  if (clamped <= -90) {
                    window.removeEventListener('mousemove', onMouseMove);
                    handleDecline();
                  } else if (clamped >= 90) {
                    window.removeEventListener('mousemove', onMouseMove);
                    handleAccept();
                  }
                };
                const onMouseUp = () => {
                  setSliderPos(0);
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const onTouchMove = (moveEvent: TouchEvent) => {
                  const delta = moveEvent.touches[0].clientX - startX;
                  const clamped = Math.max(-110, Math.min(110, delta));
                  setSliderPos(clamped);
                  if (clamped <= -90) {
                    handleDecline();
                  } else if (clamped >= 90) {
                    handleAccept();
                  }
                };
                const onTouchEnd = () => {
                  setSliderPos(0);
                };
                e.target.addEventListener('touchmove', onTouchMove as unknown as EventListener);
                e.target.addEventListener('touchend', onTouchEnd as unknown as EventListener);
              }}
            >
              {sliderPos < -30 ? (
                <PhoneOff className="w-6 h-6 animate-pulse" />
              ) : sliderPos > 30 ? (
                <Phone className="w-6 h-6 animate-bounce" />
              ) : (
                <span className="text-xl">📞</span>
              )}
            </div>
          </div>

          {/* Quick Tap Buttons (Alternative to swipe for accessibility) */}
          <div className="flex items-center justify-around px-4">
            <button
              type="button"
              onClick={handleDecline}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/40">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-rose-300">Decline</span>
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 animate-pulse">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-300">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
