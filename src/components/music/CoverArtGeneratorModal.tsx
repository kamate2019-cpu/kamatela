import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { AIMusicTrack } from '@/types/kamatela';

interface CoverArtGeneratorModalProps {
  track: AIMusicTrack | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCover: (trackId: string, newCoverUrl: string) => void;
}

export const CoverArtGeneratorModal: React.FC<CoverArtGeneratorModalProps> = ({
  track,
  isOpen,
  onClose,
  onUpdateCover,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Afrofuturism');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const STYLES = [
    {
      id: 'Afrofuturism',
      label: '🚀 Afrofuturism',
      desc: 'Golden neon patterns, regal African motifs, cosmic nebula',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'Cyberpunk',
      label: '⚡ Cyberpunk Neon',
      desc: 'Glowing violet skyline, synthwave retro grid, holograms',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'Vinyl',
      label: '📀 Vintage Vinyl',
      desc: '70s textured record sleeve, analog grain, bold typography',
      url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'Minimalist',
      label: '🧊 Minimalist 3D',
      desc: 'Clean pastel geometric shapes, studio lighting, matte textures',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'Anime',
      label: '🎨 Anime Pop',
      desc: 'Dynamic Japanese animation art, vibrant colors, expressive lines',
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const handleGenerateCover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const matchingStyle = STYLES.find((s) => s.id === selectedStyle);
    const chosenUrl = matchingStyle?.url || STYLES[0].url;

    setTimeout(() => {
      setPreviewUrl(chosenUrl);
      setIsGenerating(false);
      toast.success('Generated new high-res AI Cover Art!');
    }, 1200);
  };

  const handleApplyCover = () => {
    if (!previewUrl) return;
    onUpdateCover(track.id, previewUrl);
    toast.success('Applied new cover art to track across KAMATELA!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-5 space-y-4 shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Cover Art Studio</h3>
              <p className="text-[10px] text-muted-foreground">For "{track.title}"</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Current vs Generated Preview */}
        <div className="flex items-center justify-center gap-4 py-1">
          <div className="text-center space-y-1">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border bg-muted shadow-inner">
              <img
                src={previewUrl || track.coverUrl}
                alt="Artwork Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {previewUrl ? '✨ AI Generated' : 'Current Artwork'}
            </p>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerateCover} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Art Concept Prompt (Optional)</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g. Glowing golden lion with headphones listening to ${track.genre}...`}
              className="text-xs h-9 bg-background px-3"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Visual Style Preset</Label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedStyle === style.id
                      ? 'bg-purple-500/15 border-purple-500 text-purple-400 font-bold shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-semibold">{style.label}</p>
                  <p className="text-[9px] line-clamp-1 opacity-75">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating Cover Art...
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" /> Generate AI Cover Art
              </>
            )}
          </Button>
        </form>

        {/* Apply Action */}
        {previewUrl && (
          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewUrl(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyCover}
              className="h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Apply Artwork to Track
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
