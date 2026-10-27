import React, { useState, useEffect } from 'react';
import { Sparkles, Bell, PlusCircle, Smartphone, BadgeCheck, Wifi, WifiOff, Signal, LogIn, UserPlus, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { KamatelaLogo } from './KamatelaLogo';
import type { TabType, User } from '@/types/kamatela';
import { networkService } from '@/utils/networkService';

interface AppHeaderProps {
  activeTab: TabType;
  currentUser: User;
  onOpenUpload: () => void;
  onOpenPwaGuide: () => void;
  onOpenTopUp?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register' | 'switch') => void;
  onOpenNetworkMonitor?: () => void;
  onOpenGoLive?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  currentUser,
  onOpenUpload,
  onOpenPwaGuide,
  onOpenTopUp,
  onOpenAuthModal,
  onOpenNetworkMonitor,
  onOpenGoLive,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [netInfo, setNetInfo] = useState(() => networkService.getNetworkInfo());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetInfo(networkService.getNetworkInfo());
      toast.success('🌐 Online: Local & Cloud Storage Synchronized');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetInfo(networkService.getNetworkInfo());
      toast.info('📦 Offline: Serving cached chats & downloaded music');
    };

    const interval = setInterval(() => {
      setNetInfo(networkService.getNetworkInfo());
    }, 3000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'feed':
        return 'KAMATELA Streams';
      case 'chats':
        return 'Chats & Rooms';
      case 'studio':
        return 'AI Music Studio';
      case 'business':
        return 'Business Hub';
      case 'profile':
        return 'Account & Studio';
      default:
        return 'KAMATELA';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="max-w-md md:max-w-4xl mx-auto px-3 md:px-6 h-14 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <KamatelaLogo size={34} animated={true} />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-wider bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                KAMATELA
              </span>
              {currentUser.isBusiness && (
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <BadgeCheck className="w-2.5 h-2.5 mr-0.5 text-amber-400" /> BIZ
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline-block">
                {getTabTitle()}
              </span>
              {/* Cross-Network & Offline indicator button */}
              <button
                type="button"
                onClick={onOpenNetworkMonitor}
                className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse hover:bg-amber-500/30'
                }`}
                title="Cross-Network Diagnostics & Data Saver - Click to configure"
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {netInfo.type.toUpperCase()} • {netInfo.latencyMs}ms
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5" />
                    <span>Offline Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Coin Balance Chip */}
          <button
            type="button"
            onClick={onOpenTopUp}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
            title="KAMATELA Coin Wallet - Click to Top Up"
          >
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black font-mono">
              {(currentUser.coins ?? 500).toLocaleString()}
            </span>
          </button>

          {/* Live Streaming Quick Action Button */}
          {onOpenGoLive && (
            <Button
              size="sm"
              onClick={onOpenGoLive}
              className="h-8 px-2 md:px-2.5 text-xs font-bold rounded-full bg-red-600 hover:bg-red-500 text-white gap-1 shadow-sm"
              title="Watch Live Streams or Go Live"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">LIVE</span>
            </Button>
          )}

          {/* Post / Upload Video Action */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenUpload}
            className="h-8 px-2 md:px-3 text-xs gap-1.5 border border-primary/30 text-primary hover:bg-primary/10 rounded-full"
            title="Create & Post Video"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-medium">Post</span>
          </Button>

          {/* PWA Install Guide Action */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenPwaGuide}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            title="Install Mobile PWA"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </Button>

          {/* Notifications button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Notification info
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </Button>

          {/* Visible Sign In & Sign Up Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenAuthModal?.('login')}
              className="h-8 px-2.5 text-xs font-semibold rounded-full border-border/80 hover:bg-muted hover:text-foreground"
              title="Sign in to your KAMATELA account"
            >
              <LogIn className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Sign In</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenAuthModal?.('register')}
              className="h-8 px-3 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
              title="Create a new KAMATELA account"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              <span>Sign Up</span>
            </Button>
          </div>

          {/* User Avatar Account Trigger */}
          <button
            type="button"
            onClick={() => onOpenAuthModal?.('login')}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-muted/60 transition-all border border-border/70 hover:border-emerald-500/50"
            title="My Account - Profile & Settings"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-muted">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-background shadow-sm" />
            </div>
            <span className="hidden xl:inline text-[11px] font-bold text-foreground truncate max-w-[80px] pl-0.5 pr-1.5">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
