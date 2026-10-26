import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, HardDrive, Sparkles, Plane, ShieldCheck } from 'lucide-react';
import type { VideoDownloadQuality } from '@/types/kamatela';
import { VIDEO_QUALITY_OPTIONS } from '@/utils/offlineStorage';

interface VideoQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuality: VideoDownloadQuality;
  onSelectQuality: (quality: VideoDownloadQuality) => void;
  videoTitle?: string;
  isBatchMode?: boolean;
  onConfirmDownload?: (quality: VideoDownloadQuality) => void;
}

export const VideoQualityModal: React.FC<VideoQualityModalProps> = ({
  isOpen,
  onClose,
  currentQuality,
  onSelectQuality,
  videoTitle,
  isBatchMode = false,
  onConfirmDownload,
}) => {
  const [selected, setSelected] = React.useState<VideoDownloadQuality>(currentQuality);

  React.useEffect(() => {
    setSelected(currentQuality);
  }, [currentQuality, isOpen]);

  const handleApply = () => {
    onSelectQuality(selected);
    if (onConfirmDownload) {
      onConfirmDownload(selected);
    }
    onClose();
  };

  const options = Object.values(VIDEO_QUALITY_OPTIONS);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md p-5 rounded-3xl bg-card border-border/80">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                {isBatchMode ? 'Flight Pack Video Quality' : 'Download Quality Selection'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isBatchMode
                  ? 'Select resolution to save device storage space before flight'
                  : videoTitle
                  ? `Choose quality for "${videoTitle.slice(0, 30)}..."`
                  : 'Optimize device storage space for offline flight playback'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quality Tiers List */}
        <div className="space-y-2.5 my-3">
          {options.map((opt) => {
            const isChosen = selected === opt.tier;
            return (
              <div
                key={opt.tier}
                onClick={() => setSelected(opt.tier)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChosen
                    ? 'border-sky-500 bg-sky-500/10 shadow-sm ring-1 ring-sky-500/40'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center transition-all ${
                      isChosen
                        ? 'border-sky-500 bg-sky-500 text-white'
                        : 'border-muted-foreground/40'
                    }`}
                  >
                    {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">
                        {opt.label} ({opt.badge})
                      </span>
                      {opt.tier === '480p' && (
                        <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold px-1.5">
                          {opt.savingsVsUltra}
                        </Badge>
                      )}
                      {opt.tier === '720p' && (
                        <Badge variant="outline" className="text-[10px] h-5 border-sky-500/40 bg-sky-500/15 text-sky-400 font-bold px-1.5">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {opt.recommendedFor}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/80">
                      Res: {opt.resolution} • Approx: {opt.estimatedMb} per video
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-black text-foreground block">
                    {opt.estimatedMb}
                  </span>
                  {opt.tier !== '1080p' && (
                    <span className="text-[10px] font-bold text-emerald-400">
                      {opt.savingsVsUltra}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Storage Summary Callout */}
        <div className="p-3 rounded-2xl bg-muted/30 border border-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              {isBatchMode
                ? `Pack 5 videos estimate: ~${(
                    (VIDEO_QUALITY_OPTIONS[selected].estimatedBytes * 5) /
                    (1024 * 1024)
                  ).toFixed(1)} MB`
                : `Single video estimated size: ${VIDEO_QUALITY_OPTIONS[selected].estimatedMb}`}
            </span>
          </div>
          {selected === '480p' && (
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Saves ~59 MB (5 vids)
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl h-9 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="rounded-xl h-9 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white gap-1.5 shadow-md shadow-sky-500/20"
          >
            <Check className="w-3.5 h-3.5" />
            {onConfirmDownload ? 'Download in ' + selected : 'Set Default to ' + selected}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
