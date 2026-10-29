import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  ShoppingBag,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  Plus,
  Plane
} from 'lucide-react';
import { toast } from 'sonner';
import type { VideoItem, User } from '@/types/kamatela';
import { VideoCommentsDrawer } from './VideoCommentsDrawer';

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onToggleLike: (videoId: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  onOpenBusinessProduct?: (product: NonNullable<VideoItem['linkedProduct']>, creator: User) => void;
  onOpenCreatorProfile?: (creator: User) => void;
  onToggleFlightDownload?: (video: VideoItem) => void;
  onOpenQualityModal?: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  onToggleLike,
  onAddComment,
  onOpenBusinessProduct,
  onOpenCreatorProfile,
  onToggleFlightDownload,
  onOpenQualityModal,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDoubleTap = () => {
    if (!video.isLiked) {
      onToggleLike(video.id);
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `KAMATELA Video by ${video.creator.name}`,
          text: video.caption,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Video link copied to clipboard!');
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    toast.success(!isSaved ? 'Saved to Favorites' : 'Removed from Favorites');
  };

  const handleFlightDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFlightDownload) {
      setIsDownloading(true);
      await onToggleFlightDownload(video);
      setIsDownloading(false);
    } else {
      toast.success(
        video.isDownloadedForFlight
          ? 'Video already saved for offline flight mode'
          : '✈️ Saved video for offline flight mode!'
      );
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowed(true);
    toast.success(`Following ${video.creator.name}`);
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-8.5rem)] md:h-[680px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none"
      onDoubleClick={handleDoubleTap}
      onClick={togglePlay}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.posterUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
      />

      {/* Play/Pause subtle indicator overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Double tap heart animation */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
          <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
        </div>
      )}

      {/* Top Controls: Sound & Brand */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
            For You
          </span>
          {video.isDownloadedForFlight && (
            <span className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-sky-500 text-white flex items-center gap-1 shadow-md border border-sky-400">
              <Plane className="w-3 h-3" />
              <span>{video.downloadQuality || '720p'}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleMute}
          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Right Sidebar: Interaction Buttons */}
      <div
        className="absolute right-2.5 bottom-16 z-20 flex flex-col items-center gap-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Avatar & Follow Plus */}
        <div className="relative mb-2">
          <button
            type="button"
            onClick={() => onOpenCreatorProfile?.(video.creator)}
            className="w-11 h-11 rounded-full p-0.5 border-2 border-white overflow-hidden bg-background active:scale-95 transition-transform block"
          >
            <img src={video.creator.avatar} alt={video.creator.name} className="w-full h-full object-cover rounded-full" />
          </button>
          {!isFollowed && (
            <button
              type="button"
              onClick={handleFollow}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md active:scale-90"
              title="Follow creator"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => onToggleLike(video.id)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Like video"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                video.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 shadow-sm">
            {video.likesCount > 1000 ? `${(video.likesCount / 1000).toFixed(1)}k` : video.likesCount}
          </span>
        </div>

        {/* Comments Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsCommentsOpen(true)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Open comments"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 shadow-sm">
            {video.commentsCount}
          </span>
        </div>

        {/* Bookmark / Save Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleSave}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Save video"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 shadow-sm">Save</span>
        </div>

        {/* Flight Mode / Offline Zero-Connectivity Download */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleFlightDownload}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenQualityModal?.(video);
            }}
            disabled={isDownloading}
            className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-all ${
              video.isDownloadedForFlight
                ? 'bg-sky-500 text-white ring-2 ring-sky-400 shadow-lg shadow-sky-500/30'
                : 'bg-black/40 hover:bg-black/60'
            }`}
            aria-label="Save for Flight Mode"
            title={
              video.isDownloadedForFlight
                ? `Saved in ${video.downloadQuality || '720p'} for Flight Mode`
                : 'Save for Flight Mode'
            }
          >
            {isDownloading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : video.isDownloadedForFlight ? (
              <Plane className="w-5 h-5 fill-white" />
            ) : (
              <Plane className="w-5 h-5" />
            )}
          </button>
          <span className="text-[10px] font-bold text-white mt-1 shadow-sm flex items-center gap-0.5">
            {video.isDownloadedForFlight ? (
              <span className="bg-sky-500/90 px-1 py-0.2 rounded text-[9px] font-mono font-bold">
                {video.downloadQuality || '720p'}
              </span>
            ) : (
              'Flight'
            )}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Share video"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-bold text-white mt-1 shadow-sm">Share</span>
        </div>

        {/* Music Disc animation */}
        <div className="w-10 h-10 rounded-full bg-black/60 border-2 border-white/40 flex items-center justify-center text-white animate-spin [animation-duration:5s]">
          <Music className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Bottom Info: Creator, Caption, Linked Product */}
      <div
        className="absolute left-3 right-16 bottom-3 z-10 flex flex-col gap-2 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Linked Business Product Badge */}
        {video.linkedProduct && (
          <div
            onClick={() => onOpenBusinessProduct?.(video.linkedProduct!, video.creator)}
            className="cursor-pointer bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md rounded-xl p-2 flex items-center gap-2.5 text-white shadow-xl hover:opacity-95 transition-opacity max-w-[280px]"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/20 shrink-0">
              <img src={video.linkedProduct.imageUrl} alt={video.linkedProduct.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-amber-200" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100">Featured In Catalog</span>
              </div>
              <p className="text-xs font-semibold truncate leading-tight">{video.linkedProduct.title}</p>
              <p className="text-[11px] font-extrabold text-amber-200">
                {video.linkedProduct.currency}{video.linkedProduct.price} <span className="text-[9px] font-normal underline ml-1">Inquire on KAMATELA</span>
              </p>
            </div>
          </div>
        )}

        {/* Creator Name & Handle */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onOpenCreatorProfile?.(video.creator)}
        >
          <span className="font-bold text-white text-sm drop-shadow-md">
            {video.creator.name}
          </span>
          <span className="text-xs text-white/80 drop-shadow-md">
            {video.creator.handle}
          </span>
          {video.creator.verified && (
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-[9px]">
              ✓
            </span>
          )}
        </div>

        {/* Caption & Tags */}
        <p className="text-xs text-white/95 leading-snug line-clamp-2 drop-shadow-md">
          {video.caption}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span key={tag} className="text-[11px] font-semibold text-cyan-300 drop-shadow-md">
              {tag}
            </span>
          ))}
        </div>

        {/* Audio Track marquee */}
        <div className="flex items-center gap-2 text-white/90 text-xs mt-0.5">
          <Music className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="truncate text-[11px] text-white/80">
            {video.musicTitle} • {video.musicAuthor}
          </span>
        </div>
      </div>

      {/* Comments Drawer */}
      <VideoCommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={video.comments}
        commentsCount={video.commentsCount}
        onAddComment={(text) => onAddComment(video.id, text)}
      />
    </div>
  );
};
