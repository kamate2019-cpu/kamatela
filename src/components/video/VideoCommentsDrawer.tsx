import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Send, MessageCircle } from 'lucide-react';
import type { VideoComment } from '@/types/kamatela';

interface VideoCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: VideoComment[];
  commentsCount: number;
  onAddComment: (text: string) => void;
}

export const VideoCommentsDrawer: React.FC<VideoCommentsDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  commentsCount,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  const toggleCommentLike = (commentId: string) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[75vh] max-h-[85vh] rounded-t-2xl p-0 bg-card border-t border-border flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border/60 shrink-0">
          <SheetTitle className="text-center text-sm font-bold flex items-center justify-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-primary" />
            {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
          </SheetTitle>
          <SheetDescription className="sr-only">Video discussions and comments</SheetDescription>
        </SheetHeader>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-center">
              <MessageCircle className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
              <p className="text-sm">Be the first to comment!</p>
              <p className="text-xs text-muted-foreground/80">Share your thoughts on this video</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = !!commentLikes[comment.id];
              return (
                <div key={comment.id} className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{comment.userName}</span>
                      <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-foreground/90 mt-0.5 leading-relaxed break-words">{comment.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCommentLike(comment.id)}
                    className="flex flex-col items-center shrink-0 text-muted-foreground hover:text-rose-500 py-1"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="text-[10px] mt-0.5">{comment.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border/80 bg-background/80 flex items-center gap-2">
          <Input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 h-9 text-xs bg-muted/50 rounded-full px-4 border-border"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!commentInput.trim()}
            className="h-9 w-9 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
