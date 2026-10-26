import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { UserStory } from '@/types/kamatela';

interface StoryViewerModalProps {
  story: UserStory | null;
  isOpen: boolean;
  onClose: () => void;
  onReply?: (story: UserStory, text: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  isOpen,
  onClose,
  onReply,
}) => {
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!isOpen || !story) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, story, onClose]);

  if (!isOpen || !story) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply?.(story, replyText.trim());
    toast.success(`Replied to ${story.userName}'s status!`);
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-between">
        {/* Progress bar */}
        <div className="absolute top-2 left-3 right-3 z-30 flex gap-1">
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Header */}
        <div className="relative z-30 pt-5 px-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/50">
              <img src={story.userAvatar} alt={story.userName} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{story.userName}</p>
              <p className="text-[10px] text-white/70">{story.timestamp}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Media */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <img src={story.mediaUrl} alt={story.caption || 'Status'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        {/* Bottom Caption & Reply Bar */}
        <div className="relative z-30 p-4 space-y-3">
          {story.caption && (
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 text-center text-white text-xs font-medium max-w-[85%] mx-auto border border-white/10">
              {story.caption}
            </div>
          )}

          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to status..."
              className="h-9 text-xs bg-white/20 border-white/30 text-white placeholder:text-white/60 rounded-full px-4 backdrop-blur-md focus-visible:ring-emerald-400"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!replyText.trim()}
              className="h-9 w-9 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
