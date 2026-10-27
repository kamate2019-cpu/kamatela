import React, { useState } from 'react';
import {
  Grid,
  Heart,
  Bookmark,
  Store,
  Settings,
  Share2,
  Smartphone,
  ShieldCheck,
  Edit3,
  BadgeCheck,
  Play,
  Package,
  QrCode,
  KeyRound,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, VideoItem, BusinessProduct, WalletTransaction, VideoDownloadQuality } from '@/types/kamatela';
import { VIDEO_QUALITY_OPTIONS } from '@/utils/offlineStorage';
import { VideoQualityModal } from '@/components/video/VideoQualityModal';
import { EditProfileModal } from './EditProfileModal';
import { ContactQRModal } from '@/components/chat/ContactQRModal';

import { CoinTopUpModal } from '@/components/wallet/CoinTopUpModal';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  videos: VideoItem[];
  downloadedVideos?: VideoItem[];
  downloadQuality?: VideoDownloadQuality;
  onSelectDownloadQuality?: (quality: VideoDownloadQuality) => void;
  products: BusinessProduct[];
  transactions?: WalletTransaction[];
  onOpenPwaGuide: () => void;
  onOpenAuthModal?: () => void;
  onSelectVideo?: (video: VideoItem) => void;
  onSelectProduct?: (product: BusinessProduct) => void;
  onAddCoins?: (amount: number, channel?: string, amountUsd?: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  videos,
  downloadedVideos = [],
  downloadQuality = '720p',
  onSelectDownloadQuality,
  products,
  transactions = [],
  onOpenPwaGuide,
  onOpenAuthModal,
  onSelectVideo,
  onSelectProduct,
  onAddCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'flight' | 'catalog'>('videos');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);

  const qualityConfig = VIDEO_QUALITY_OPTIONS[downloadQuality];

  const myVideos = videos.filter((v) => v.creator.id === user.id || v.creator.id === 'user_me');
  const likedVideos = videos.filter((v) => v.isLiked);
  const myProducts = products.filter((p) => p.businessId === user.id || p.businessId === 'user_me');

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name} on KAMATELA`,
          text: user.bio,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Profile URL copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-4">
      {/* Profile Header (KAMATELA unified format) */}
      <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with Status ring & Camera edit trigger */}
          <div
            className="relative cursor-pointer group"
            onClick={() => setIsEditOpen(true)}
            title="Click to edit profile picture"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-cyan-400 to-purple-500 overflow-hidden shadow-lg">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-background relative bg-muted">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback to placeholder if url fails
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
              </div>
            </div>
            {user.verified && (
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xs font-black border-2 border-background shadow-md">
                ✓
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {user.businessName || user.name}
              </h2>
              {user.isBusiness && (
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit mx-auto sm:mx-0">
                  <BadgeCheck className="w-3 h-3 mr-1 text-amber-400" /> Business Profile
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground font-mono">{user.handle}</p>
            <p className="text-xs text-foreground/90 max-w-md leading-relaxed">{user.bio}</p>

            {user.isBusiness && user.businessCategory && (
              <p className="text-[11px] text-emerald-400 font-semibold pt-0.5">
                🏷️ {user.businessCategory} {user.businessPhone ? `• ${user.businessPhone}` : ''}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            {onOpenAuthModal && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenAuthModal}
                className="text-xs font-bold gap-1 rounded-full h-8 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                title="Single Sign-On / Switch Account"
              >
                <KeyRound className="w-3.5 h-3.5" /> SSO / Switch
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsQROpen(true)}
              className="text-xs font-bold gap-1 rounded-full h-8 border border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
              title="My Contact QR Code"
            >
              <QrCode className="w-3.5 h-3.5" /> My QR
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="text-xs gap-1.5 rounded-full h-8"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShareProfile}
              className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 divide-x divide-border pt-3 border-t border-border/70 text-center">
          <div>
            <span className="font-extrabold text-sm md:text-base text-foreground block">
              {(user.followersCount / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Followers
            </span>
          </div>
          <div>
            <span className="font-extrabold text-sm md:text-base text-foreground block">
              {user.followingCount}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Following
            </span>
          </div>
          <div>
            <span className="font-extrabold text-sm md:text-base text-foreground block">
              {(user.likesCount / 1000).toFixed(1)}k
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Likes
            </span>
          </div>
        </div>

        {/* Virtual Coin Wallet Banner */}
        <div className="rounded-xl p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-purple-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
              🪙
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                KAMATELA Coin Wallet
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-400 font-mono">
                  {(user.coins ?? 500).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Coins</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsTopUpOpen(true)}
            className="h-7 px-3.5 text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-full shadow-md shadow-amber-500/20"
          >
            + Top Up
          </Button>
        </div>

        {/* PWA & Mobile Installation Banner Promo */}
        <div className="rounded-xl p-3 bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-purple-500/15 border border-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">KAMATELA Mobile Super App</p>
              <p className="text-[10px] text-muted-foreground">Install on your home screen for quick offline access</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onOpenPwaGuide}
            className="h-7 px-3 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shrink-0"
          >
            How to Install
          </Button>
        </div>

        {/* Offline Video Download Quality Settings Banner */}
        <div className="rounded-xl p-3 bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-purple-500/15 border border-sky-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-foreground">Offline Flight Video Quality</p>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-extrabold">
                  {qualityConfig.badge}
                </span>
                {downloadQuality === '480p' && (
                  <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    -78% Space
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {qualityConfig.label} ({qualityConfig.estimatedMb}/vid) • {qualityConfig.recommendedFor}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsQualityModalOpen(true)}
            className="h-7 px-3 text-[11px] font-bold border-sky-500/40 text-sky-400 hover:bg-sky-500/10 rounded-full shrink-0"
          >
            Change
          </Button>
        </div>
      </div>

      {/* Tabs: My Videos, Liked, Catalog */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-6 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'videos'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="w-4 h-4" /> My Videos ({myVideos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'liked'
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart className="w-4 h-4" /> Liked ({likedVideos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flight')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'flight'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            title="Zero-Connectivity Flight Mode Cache"
          >
            <Plane className="w-4 h-4 text-sky-400" /> Flight ({downloadedVideos.length})
          </button>

          {user.isBusiness && (
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'catalog'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4" /> My Catalog ({myProducts.length})
            </button>
          )}
        </div>

        {/* Video Grid Content */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {myVideos.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                <p className="text-xs">No videos posted yet. Tap '+' at the bottom to publish one!</p>
              </div>
            ) : (
              myVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo?.(video)}
                  className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img src={video.posterUrl} alt={video.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white text-white opacity-80" />
                  </div>
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
                    <Heart className="w-3 h-3 fill-white" /> {video.likesCount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Liked Videos Grid */}
        {activeTab === 'liked' && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {likedVideos.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                <p className="text-xs">No liked videos yet.</p>
              </div>
            ) : (
              likedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo?.(video)}
                  className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img src={video.posterUrl} alt={video.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white text-white opacity-80" />
                  </div>
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {video.likesCount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Flight Videos Grid */}
        {activeTab === 'flight' && (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {downloadedVideos.length === 0 ? (
              <div className="col-span-3 py-12 text-center text-muted-foreground">
                <Plane className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-foreground">No videos cached for flight mode</p>
                <p className="text-[11px] mt-1">Tap 'Flight' on any video in the feed to save it for offline watching.</p>
              </div>
            ) : (
              downloadedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo?.(video)}
                  className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group cursor-pointer border border-sky-500/30"
                >
                  <img src={video.posterUrl} alt={video.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white text-white opacity-90" />
                  </div>
                  <div className="absolute top-1 right-1 bg-sky-500 text-white rounded-md px-1 py-0.5 text-[9px] font-bold flex items-center gap-0.5 shadow">
                    <Plane className="w-2.5 h-2.5" /> {video.downloadQuality || '720p'}
                  </div>
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white/90 rounded px-1 text-[8px] font-mono">
                    {((video.fileSizeBytes || 7864320) / (1024 * 1024)).toFixed(1)}M
                  </div>
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> {video.likesCount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Catalog Items Grid */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {myProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p className="text-xs">Your business catalog is empty. Add products from Business Hub.</p>
              </div>
            ) : (
              myProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct?.(prod)}
                  className="bg-card rounded-xl border border-border overflow-hidden p-2.5 flex flex-col justify-between cursor-pointer hover:border-primary/50"
                >
                  <img src={prod.imageUrl} alt={prod.title} className="w-full aspect-square rounded-lg object-cover bg-muted mb-2" />
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">{prod.title}</h4>
                  <p className="text-xs font-black text-emerald-400 mt-1">${prod.price}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={onUpdateUser}
      />

      {/* Coin Top Up Modal */}
      <CoinTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={user.coins ?? 500}
        transactions={transactions}
        onTopUp={(amount, channel, amountUsd) => {
          if (onAddCoins) {
            onAddCoins(amount, channel, amountUsd);
          }
        }}
      />

      {/* Personal Contact QR Code & Scanner Modal */}
      <ContactQRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        currentUser={user}
        defaultTab="my_code"
        onStartChatWithUser={() => {
          setIsQROpen(false);
          toast.success('Ready to chat!');
        }}
      />

      {/* Offline Video Quality Modal */}
      <VideoQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        currentQuality={downloadQuality}
        onSelectQuality={(q) => onSelectDownloadQuality?.(q)}
      />
    </div>
  );
};
