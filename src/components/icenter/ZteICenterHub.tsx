import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Film,
  Music,
  Wallet,
  Radio,
  ShoppingBag,
  Sparkles,
  Zap,
  HardDrive,
  Activity,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  LogOut,
  QrCode,
  Users,
  Wifi,
  Trash2,
  Lock,
  ArrowRight,
  Gamepad2,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, TabType } from '@/types/kamatela';

interface ZteICenterHubProps {
  currentUser: User;
  unreadChatsCount: number;
  coins: number;
  downloadedVideosCount: number;
  downloadedTracksCount: number;
  voiceRoomsCount: number;
  productsCount: number;
  liveStreamsCount: number;
  onNavigateTab: (tab: TabType) => void;
  onOpenChat: (chatId?: string) => void;
  onOpenUploadVideo: () => void;
  onOpenBroadcastModal: () => void;
  onOpenTopUpModal: () => void;
  onOpenNetworkModal: () => void;
  onOpenAuthModal: () => void;
  onCleanCache?: () => void;
}

export const ZteICenterHub: React.FC<ZteICenterHubProps> = ({
  currentUser,
  unreadChatsCount,
  coins,
  downloadedVideosCount,
  downloadedTracksCount,
  voiceRoomsCount,
  productsCount,
  liveStreamsCount,
  onNavigateTab,
  onOpenChat,
  onOpenUploadVideo,
  onOpenBroadcastModal,
  onOpenTopUpModal,
  onOpenNetworkModal,
  onOpenAuthModal,
  onCleanCache,
}) => {
  const [healthScore, setHealthScore] = useState(98);
  const [isScanning, setIsScanning] = useState(false);
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);

  const registeredPhone =
    localStorage.getItem('kamatela_whatsapp_phone') ||
    currentUser.businessPhone ||
    '+225 07 01 23 45 67';
  const isWhatsAppVerified =
    localStorage.getItem('kamatela_whatsapp_registered') === 'true';

  const handleQuickOptimize = () => {
    setIsScanning(true);
    toast.loading('ZTE iCenter: Scanning & optimizing memory...');
    setTimeout(() => {
      setIsScanning(false);
      setHealthScore(100);
      if (onCleanCache) onCleanCache();
      toast.dismiss();
      toast.success('ZTE iCenter: System 100% Optimized! RAM & Cache freed.');
    }, 1200);
  };

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-4 pb-20">
      {/* ZTE iCenter Main Dashboard Header */}
      <div className="hud-panel p-4 space-y-4 relative overflow-hidden border-border/80 bg-card">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-black text-sm tracking-wider">
              ZTE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest uppercase text-foreground">
                  iCenter Smart Hub
                </span>
                <span className="text-[10px] px-1 py-0.2 bg-primary/20 text-primary font-mono font-bold">
                  v2.6.4
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                KAMATELA SuperApp Integrated Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNetworkModal}
              className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 hud-press"
            >
              <Wifi className="w-3 h-3 animate-pulse" />
              <span>24ms</span>
            </button>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-2 py-1 border border-border/60 bg-secondary/50 hud-press"
            >
              <Smartphone className="w-3 h-3 text-primary" />
              <span className="hidden sm:inline">Account</span>
            </button>
          </div>
        </div>

        {/* Hero Health Gauge / Optimizer Widget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-1">
          <div className="flex items-center gap-3 sm:col-span-2">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center border-2 border-primary bg-primary/10">
              <span className="text-xl font-black font-mono text-primary hud-metric">
                {healthScore}
                <span className="text-xs font-normal">%</span>
              </span>
              <div className="absolute inset-0 border border-primary/40 animate-ping pointer-events-none opacity-20" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Device & App Guard
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                End-to-End Encryption • PWA Offline Ready • Anti-Tracking Active
              </p>
              <p className="text-[10px] font-mono text-primary/80">
                Storage Cached: {downloadedVideosCount} Videos • {downloadedTracksCount} Tracks
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:items-end">
            <Button
              type="button"
              onClick={handleQuickOptimize}
              disabled={isScanning}
              className="w-full sm:w-auto h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-none shadow-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Optimizing...' : '1-Tap Boost & Clean'}</span>
            </Button>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Data Saver:</span>
              <button
                type="button"
                onClick={() => {
                  setDataSaverEnabled(!dataSaverEnabled);
                  toast.info(`Data Saver ${!dataSaverEnabled ? 'Enabled' : 'Disabled'}`);
                }}
                className={`font-mono font-bold px-1.5 py-0.5 text-[9px] border ${
                  dataSaverEnabled
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {dataSaverEnabled ? 'ON (720p Cap)' : 'OFF (Max)'}
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Verified Status Bar */}
        <div className="flex items-center justify-between p-2 bg-emerald-950/30 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-emerald-400">WhatsApp Engine:</span>
            <span className="font-mono text-foreground text-[11px]">
              {isWhatsAppVerified ? registeredPhone : 'Phone Verification Needed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('chats')}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              {isWhatsAppVerified ? 'Open Chats' : 'Verify Phone'}
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>

      {/* ZTE iCenter Feature Modules Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>KAMATELA Integrated Tools ({isWhatsAppVerified ? 'Connected' : 'Ready'})</span>
          </h3>
          <span className="text-[10px] text-muted-foreground font-mono">
            {coins} Coins Available
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Tile 1: WhatsApp Chats & Calls */}
          <div
            onClick={() => onNavigateTab('chats')}
            className="hud-panel p-3 cursor-pointer hover:border-emerald-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                {unreadChatsCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2">
                    {unreadChatsCount} New
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-emerald-400 transition-colors">
                WhatsApp Chats
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Encrypted messages, voice notes & status stories
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
              <span>Enter Chats</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 2: Live Streams & Co-Host */}
          <div
            onClick={() => onNavigateTab('feed')}
            className="hud-panel p-3 cursor-pointer hover:border-primary transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-primary/10 border border-primary/40 text-primary flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 animate-pulse">
                  LIVE ({liveStreamsCount})
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                Streams & Co-Host
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                50/50 dual split-screen streaming & video feeds
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-primary font-semibold">
              <span>Watch Streams</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 3: AI Music Studio */}
          <div
            onClick={() => onNavigateTab('studio')}
            className="hud-panel p-3 cursor-pointer hover:border-purple-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-purple-400">Stems AI</span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-purple-400 transition-colors">
                AI Music Studio
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Lyrics synthesizer, stem separation & offline tracks
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-purple-400 font-semibold">
              <span>Open Studio</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 4: Wallet & Mobile Money */}
          <div
            onClick={onOpenTopUpModal}
            className="hud-panel p-3 cursor-pointer hover:border-yellow-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-yellow-400">
                  {coins} Coins
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-yellow-400 transition-colors">
                Wallet & MoMo
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                M-Pesa, MTN MoMo, Orange & Card instant top-up
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-yellow-400 font-semibold">
              <span>Top Up / Pay</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 5: Voice Rooms & Audio Stages */}
          <div
            onClick={() => {
              onNavigateTab('chats');
              toast.info('Opening Voice Rooms inside Communications Center');
            }}
            className="hud-panel p-3 cursor-pointer hover:border-cyan-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  {voiceRoomsCount} Active
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-cyan-400 transition-colors">
                Voice Rooms
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Multi-participant stages, trivia quiz & speaker lounge
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-cyan-400 font-semibold">
              <span>Join Stage</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 6: Creator Marketplace */}
          <div
            onClick={() => onNavigateTab('business')}
            className="hud-panel p-3 cursor-pointer hover:border-amber-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {productsCount} Items
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-amber-400 transition-colors">
                Marketplace
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Business directory, catalogs & official brand tracks
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 7: Flight Mode Offline Videos */}
          <div
            onClick={() => {
              onNavigateTab('feed');
              toast.info('Tap "Flight Mode" in the top bar of Streams to view cached videos');
            }}
            className="hud-panel p-3 cursor-pointer hover:border-blue-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-blue-400">
                  {downloadedVideosCount} Saved
                </span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-blue-400 transition-colors">
                Offline Flight Media
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Saved 480p/720p/1080p videos for flights & low-network
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-blue-400 font-semibold">
              <span>View Saved</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 8: ZTE Device Security & Permissions */}
          <div
            onClick={onOpenNetworkModal}
            className="hud-panel p-3 cursor-pointer hover:border-emerald-500 transition-all space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Protected</span>
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2 group-hover:text-emerald-400 transition-colors">
                ZTE Security Guard
              </h4>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                Camera, Mic, Contacts permissions & storage cleanup
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
              <span>Check Status</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Utility Actions / Telemetry Row */}
      <div className="hud-panel p-3 border-border/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onOpenBroadcastModal}
            className="h-8 text-[11px] font-bold bg-primary text-primary-foreground rounded-none gap-1 px-3 shadow-none"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Go Live Broadcast</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenUploadVideo}
            className="h-8 text-[11px] font-bold rounded-none gap-1 px-3 border-border"
          >
            <Film className="w-3.5 h-3.5 text-primary" />
            <span>Post Video</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="px-2.5 py-1 border border-border hover:text-foreground text-[11px] font-medium"
          >
            Settings & Linked Accounts
          </button>
        </div>
      </div>
    </div>
  );
};
