import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { UserStory } from '@/types/kamatela';

interface StoriesBarProps {
  stories: UserStory[];
  onSelectStory: (story: UserStory) => void;
  onAddStory: (mediaUrl: string, caption?: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  onAddStory,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddClick = () => {
    // Quick demo add story
    const samplePhotos = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    ];
    const picked = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    onAddStory(picked, 'Updated my WhatsApp status on KAMATELA ✨');
    toast.success('Your 24-hour Status has been posted!');
  };

  const myStory = stories.find((s) => s.userId === 'user_me');
  const otherStories = stories.filter((s) => s.userId !== 'user_me');

  return (
    <div className="w-full bg-card/60 backdrop-blur-sm border-b border-border/80 px-3 py-2.5">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {/* My Status */}
        <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={handleAddClick}>
          <div className="relative">
            <div className="w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-emerald-400 overflow-hidden bg-muted">
              <img
                src={myStory?.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="My Status"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-background shadow-sm">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[10px] font-medium text-foreground truncate max-w-[60px]">
            My Status
          </span>
        </div>

        {/* Other Stories */}
        {otherStories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={`w-14 h-14 rounded-full p-[2.5px] ${
                story.isViewed
                  ? 'border-2 border-muted-foreground/30'
                  : 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400'
              } overflow-hidden`}
            >
              <div className="w-full h-full rounded-full border border-background overflow-hidden bg-muted">
                <img src={story.userAvatar} alt={story.userName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-foreground/90 truncate max-w-[62px]">
              {story.userName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
