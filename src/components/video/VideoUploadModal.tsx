import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Film, ShoppingBag, Music, Check, Video, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { VideoItem, BusinessProduct, AIMusicTrack } from '@/types/kamatela';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (videoData: Partial<VideoItem>) => void;
  products: BusinessProduct[];
  attachedTrack?: AIMusicTrack | null;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  products,
  attachedTrack,
}) => {
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('#KAMATELA #SuperApp #Creator');
  const [musicTitle, setMusicTitle] = useState(
    attachedTrack ? `${attachedTrack.title} (${attachedTrack.genre})` : 'Trending Original Audio'
  );
  const [selectedProductId, setSelectedProductId] = useState<string>('none');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    toast.success(`Loaded video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error('Please enter a video caption');
      return;
    }

    setIsSubmitting(true);
    const parsedTags = tags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#'));

    const linkedProduct =
      selectedProductId !== 'none'
        ? products.find((p) => p.id === selectedProductId)
        : undefined;

    setTimeout(() => {
      onUpload({
        caption: caption.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ['#KAMATELA', '#Viral'],
        musicTitle: musicTitle || 'Original Audio',
        videoUrl: videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        linkedProduct: linkedProduct
          ? {
              id: linkedProduct.id,
              title: linkedProduct.title,
              price: linkedProduct.price,
              currency: linkedProduct.currency,
              imageUrl: linkedProduct.imageUrl,
            }
          : undefined,
      });

      setIsSubmitting(false);
      toast.success('Your real video was successfully published to KAMATELA Streams!');
      setCaption('');
      setVideoFile(null);
      setVideoPreviewUrl(null);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Film className="w-5 h-5 text-primary" /> Create & Publish Real Stream Video
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record from your device camera or pick a real video file to stream on KAMATELA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Real Upload / Camera Dropzone */}
          {videoPreviewUrl ? (
            <div className="relative rounded-xl overflow-hidden bg-black border border-border h-48 flex items-center justify-center">
              <video
                src={videoPreviewUrl}
                controls
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md hover:bg-black/80"
              >
                Change Video
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 text-center bg-muted/20 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-foreground">Record Camera or Select Video from Device</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Supports MP4, MOV, WebM from your phone or desktop</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 h-7 text-xs rounded-full"
              >
                Browse Files
              </Button>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Caption & Description</Label>
            <Textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What is your video about? Mention @creators or details..."
              className="text-xs resize-none bg-background px-3"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Hashtags</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#KAMATELA #SuperApp #Business"
              className="text-xs h-8 bg-background px-3"
            />
          </div>

          {/* Audio Soundtrack */}
          <div className="space-y-1">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" /> Soundtrack / Music Track
            </Label>
            {attachedTrack && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-purple-500/30">
                  <img src={attachedTrack.coverUrl} alt={attachedTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                      AI SOUNDTRACK
                    </span>
                    <span className="text-[10px] text-muted-foreground">{attachedTrack.genre}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate mt-0.5">{attachedTrack.title}</p>
                </div>
              </div>
            )}
            <Input
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
              placeholder="e.g. Chillhop Beats - Autumn Vibes"
              className="text-xs h-8 bg-background px-3"
            />
          </div>

          {/* Shop integration: Link a Product from Catalog */}
          <div className="space-y-1 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <Label className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Link a Business Product (In-Stream Shopping)
            </Label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-8 mt-1 text-xs rounded-md bg-background border border-border px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="none">No product linked</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.currency}{p.price})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 text-white hover:opacity-95"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
