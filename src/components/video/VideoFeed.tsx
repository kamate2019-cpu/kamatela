import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Sparkles,
  Plane,
  Download,
  Trash2,
  HardDrive,
  CheckCircle2,
  WifiOff,
  Sliders,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { VideoItem, User, VideoDownloadQuality } from '@/types/kamatela';
import { VIDEO_QUALITY_OPTIONS } from '@/utils/offlineStorage';
import { VideoCard } from './VideoCard';
import { VideoQualityModal } from './VideoQualityModal';

interface VideoFeedProps {
  videos: VideoItem[];
  downloadedVideos?: VideoItem[];
  downloadQuality?: VideoDownloadQuality;
  onSelectDownloadQuality?: (quality: VideoDownloadQuality) => void;
  onToggleLike: (videoId: string) => void;
  onAddComment: (videoId: string, text: string) => void;
  onOpenUpload: () => void;
  onOpenBusinessProduct?: (product: NonNullable<VideoItem['linkedProduct']>, creator: User) => void;
  onOpenCreatorProfile?: (creator: User) => void;
  onDownloadVideoForFlight?: (video: VideoItem, quality?: VideoDownloadQuality) => Promise<any>;
  onRemoveDownloadedVideo?: (videoId: string) => Promise<any>;
  onBatchDownloadTopVideos?: (count?: number, quality?: VideoDownloadQuality) => Promise<any>;
  onClearAllFlightVideos?: () => Promise<any>;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videos,
  downloadedVideos = [],
  downloadQuality = '720p',
  onSelectDownloadQuality,
  onToggleLike,
  onAddComment,
  onOpenUpload,
  onOpenBusinessProduct,
  onOpenCreatorProfile,
  onDownloadVideoForFlight,
  onRemoveDownloadedVideo,
  onBatchDownloadTopVideos,
  onClearAllFlightVideos,
}) => {
  const [feedTab, setFeedTab] = useState<'foryou' | 'following' | 'flight'>('foryou');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
  const [flightResolutionFilter, setFlightResolutionFilter] = useState<'all' | '480p' | '720p' | '1080p'>('all');
  const [qualityTargetVideo, setQualityTargetVideo] = useState<VideoItem | null>(null);

  // Filter downloaded videos by selected resolution if inside flight tab
  const filteredFlightVideos =
    flightResolutionFilter === 'all'
      ? downloadedVideos
      : downloadedVideos.filter((v) => (v.downloadQuality || '720p') === flightResolutionFilter);

  // Active videos to display based on tab
  const activeVideos =
    feedTab === 'flight'
      ? filteredFlightVideos
      : feedTab === 'following'
      ? videos.slice(0, 3)
      : videos;

  const handleNext = () => {
    if (currentIndex < activeVideos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleToggleFlightSave = async (video: VideoItem) => {
    if (video.isDownloadedForFlight) {
      if (onRemoveDownloadedVideo) {
        await onRemoveDownloadedVideo(video.id);
        toast.info('Removed video from Flight Cache');
      }
    } else {
      if (onDownloadVideoForFlight) {
        await onDownloadVideoForFlight(video, downloadQuality);
        const qualityConfig = VIDEO_QUALITY_OPTIONS[downloadQuality];
        toast.success(
          `✈️ Saved in ${qualityConfig.badge} (${qualityConfig.estimatedMb})! Playable with zero connection.`
        );
      }
    }
  };

  const handleOpenIndividualQuality = (video: VideoItem) => {
    setQualityTargetVideo(video);
    setIsQualityModalOpen(true);
  };

  const handleBatchDownload = async () => {
    if (!onBatchDownloadTopVideos) return;
    setIsBatchDownloading(true);
    const qualityConfig = VIDEO_QUALITY_OPTIONS[downloadQuality];
    toast.info(`✈️ Packing top 5 videos in ${qualityConfig.badge} for Flight Mode...`);
    try {
      const saved = await onBatchDownloadTopVideos(5, downloadQuality);
      setIsBatchDownloading(false);
      const totalMb = ((saved.length * qualityConfig.estimatedBytes) / (1024 * 1024)).toFixed(1);
      toast.success(
        `✈️ Successfully packed ${saved.length} videos in ${qualityConfig.badge} (${totalMb} MB)!`
      );
    } catch {
      setIsBatchDownloading(false);
      toast.error('Failed to pack videos');
    }
  };

  const handleClearFlightVideos = async () => {
    if (onClearAllFlightVideos) {
      await onClearAllFlightVideos();
      toast.info('Cleared offline flight video cache');
    }
  };

  // Calculate cached storage size and resolution breakdown
  const totalFlightBytes = downloadedVideos.reduce(
    (acc, v) => acc + (v.fileSizeBytes || 7864320),
    0
  );
  const totalFlightMb = (totalFlightBytes / (1024 * 1024)).toFixed(1);

  const count480 = downloadedVideos.filter((v) => (v.downloadQuality || '720p') === '480p').length;
  const count720 = downloadedVideos.filter((v) => (v.downloadQuality || '720p') === '720p').length;
  const count1080 = downloadedVideos.filter((v) => (v.downloadQuality || '720p') === '1080p').length;

  const currentQualityConfig = VIDEO_QUALITY_OPTIONS[downloadQuality];
  const est5VideosMb = ((currentQualityConfig.estimatedBytes * 5) / (1024 * 1024)).toFixed(1);

  return (
    <div className="relative w-full max-w-md mx-auto py-1">
      {/* Top Filter Bar: For You | Following | Flight Mode + Quality Tier Switcher */}
      <div className="flex items-center justify-between gap-1.5 px-2 py-1.5 mb-2 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setFeedTab('foryou');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 ${
              feedTab === 'foryou'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            For You
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedTab('following');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 ${
              feedTab === 'following'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Following
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedTab('flight');
              setCurrentIndex(0);
            }}
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all shrink-0 ${
              feedTab === 'flight'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-sky-400 hover:text-sky-300'
            }`}
            title="Zero-Connectivity Flight Mode"
          >
            <Plane className="w-3.5 h-3.5" /> Flight ({downloadedVideos.length})
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quality Tier Selector Button */}
          <button
            type="button"
            onClick={() => {
              setQualityTargetVideo(null);
              setIsQualityModalOpen(true);
            }}
            className="h-7 px-2 text-[11px] font-bold rounded-xl border border-border/80 hover:border-sky-500/50 bg-background/50 hover:bg-sky-500/10 text-foreground flex items-center gap-1 transition-all"
            title={`Offline Video Quality: ${currentQualityConfig.label} (${currentQualityConfig.badge}) - ${currentQualityConfig.savingsVsUltra}`}
          >
            <Settings2 className="w-3 h-3 text-sky-400" />
            <span className="font-mono text-sky-400 font-extrabold">{currentQualityConfig.badge}</span>
            {downloadQuality === '480p' && (
              <span className="hidden sm:inline text-[10px] text-emerald-400 font-semibold">-78%</span>
            )}
          </button>

          {/* Batch Pack Action Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleBatchDownload}
            disabled={isBatchDownloading}
            className="h-7 px-2 text-[11px] font-bold border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 rounded-xl gap-1 shrink-0"
            title={`Download top 5 videos in ${currentQualityConfig.badge} (~${est5VideosMb} MB)`}
          >
            {isBatchDownloading ? (
              <span className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plane className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Pack 5 ({est5VideosMb}MB)</span>
            <span className="sm:hidden">Pack 5</span>
          </Button>
        </div>
      </div>

      {/* Flight Mode Header Information Bar when in Flight Tab */}
      {feedTab === 'flight' && (
        <div className="mb-2 p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between text-sky-300">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  Zero-Connectivity Flight Mode
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                    {totalFlightMb} MB Total
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Streaming locally from IndexedDB. Default quality: {currentQualityConfig.label} ({currentQualityConfig.badge}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQualityTargetVideo(null);
                  setIsQualityModalOpen(true);
                }}
                className="h-6 px-1.5 text-[10px] text-sky-300 hover:bg-sky-500/10 rounded-lg gap-1"
                title="Change default download quality"
              >
                <Settings2 className="w-3 h-3" /> Quality
              </Button>
              {downloadedVideos.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFlightVideos}
                  className="h-6 px-1.5 text-[10px] text-red-400 hover:bg-red-500/10 rounded-lg gap-1"
                  title="Clear all cached flight videos"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Resolution Filter Pills */}
          {downloadedVideos.length > 0 && (
            <div className="flex items-center gap-1 pt-1 border-t border-sky-500/20 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-muted-foreground font-semibold mr-1">Filter Res:</span>
              <button
                type="button"
                onClick={() => {
                  setFlightResolutionFilter('all');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  flightResolutionFilter === 'all'
                    ? 'bg-sky-500 text-white'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({downloadedVideos.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlightResolutionFilter('480p');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  flightResolutionFilter === '480p'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                480p ({count480})
                <span className="text-[8px] opacity-80">Saver</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlightResolutionFilter('720p');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  flightResolutionFilter === '720p'
                    ? 'bg-sky-500 text-white'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                720p ({count720})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlightResolutionFilter('1080p');
                  setCurrentIndex(0);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  flightResolutionFilter === '1080p'
                    ? 'bg-purple-500 text-white'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                1080p ({count1080})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty States */}
      {activeVideos.length === 0 ? (
        feedTab === 'flight' ? (
          <div className="flex flex-col items-center justify-center h-[520px] p-6 text-center rounded-3xl border border-dashed border-sky-500/30 bg-sky-500/5">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
              <Plane className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {flightResolutionFilter === 'all'
                ? 'No Videos Saved for Flight'
                : `No Videos Saved in ${flightResolutionFilter}`}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4 leading-relaxed">
              {flightResolutionFilter === 'all'
                ? `Pack videos at ${currentQualityConfig.label} (${currentQualityConfig.badge}, ${currentQualityConfig.estimatedMb}/vid) to watch with zero internet on flights.`
                : `Change the resolution filter or save videos in ${flightResolutionFilter}.`}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                onClick={handleBatchDownload}
                disabled={isBatchDownloading}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold gap-2 rounded-2xl h-10 shadow-lg shadow-sky-500/20"
              >
                {isBatchDownloading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plane className="w-4 h-4" />
                )}
                Pack Top 5 in {currentQualityConfig.badge} (~{est5VideosMb}MB)
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQualityTargetVideo(null);
                    setIsQualityModalOpen(true);
                  }}
                  className="flex-1 rounded-2xl h-9 text-xs"
                >
                  Change Quality Tier
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFeedTab('foryou');
                    setFlightResolutionFilter('all');
                  }}
                  className="flex-1 rounded-2xl h-9 text-xs"
                >
                  Back to Feed
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[520px] p-6 text-center">
            <Sparkles className="w-12 h-12 text-primary mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-foreground">No Stream Videos Yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
              Be the pioneer creator on KAMATELA! Upload your first video clip or product showcase.
            </p>
            <Button onClick={onOpenUpload} size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" /> Create First Video
            </Button>
          </div>
        )
      ) : (
        <>
          {/* Active Video Card */}
          <VideoCard
            key={activeVideos[currentIndex]?.id || 'active_vid'}
            video={activeVideos[currentIndex]}
            isActive={true}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
            onOpenBusinessProduct={onOpenBusinessProduct}
            onOpenCreatorProfile={onOpenCreatorProfile}
            onToggleFlightDownload={handleToggleFlightSave}
            onOpenQualityModal={handleOpenIndividualQuality}
          />

          {/* Up / Down Navigation Floater for Desktop & Quick Swiping */}
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden md:flex flex-col gap-2 z-30">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none shadow-md transition-all"
              title="Previous Video"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === activeVideos.length - 1}
              className="w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none shadow-md transition-all"
              title="Next Video"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Stream pagination pills */}
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {activeVideos.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? feedTab === 'flight'
                      ? 'w-6 bg-sky-500'
                      : 'w-6 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Quality Selection Modal */}
      <VideoQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => {
          setIsQualityModalOpen(false);
          setQualityTargetVideo(null);
        }}
        currentQuality={downloadQuality}
        onSelectQuality={(q) => {
          onSelectDownloadQuality?.(q);
        }}
        videoTitle={qualityTargetVideo?.caption}
        onConfirmDownload={
          qualityTargetVideo && onDownloadVideoForFlight
            ? async (q) => {
                await onDownloadVideoForFlight(qualityTargetVideo, q);
                const qualityConfig = VIDEO_QUALITY_OPTIONS[q];
                toast.success(
                  `✈️ Saved in ${qualityConfig.badge} (${qualityConfig.estimatedMb})!`
                );
              }
            : undefined
        }
      />
    </div>
  );
};


