import React, { useState } from 'react';
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
import { Radio, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CreateVoiceRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (title: string, topic: string, description: string) => void;
}

export const CreateVoiceRoomModal: React.FC<CreateVoiceRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Tech & Startups');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a room title');
      return;
    }

    onCreateRoom(
      title.trim(),
      topic,
      description.trim() || 'Join the live conversation on KAMATELA Voice Rooms!'
    );

    toast.success('Your live voice room is now live!');
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" /> Start a Group Voice Room
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Host a live Clubhouse & Twitter Spaces audio room for your community or business followers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Room Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Creator Monetization in 2026 🎙️"
              className="text-xs h-9 bg-background px-3"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Topic / Category</Label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-9 text-xs rounded-md bg-background border border-border px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Tech & Startups">Tech & Startups</option>
              <option value="Business & Sales">Business & Sales</option>
              <option value="Creators & Video">Creators & Video</option>
              <option value="Music & Vibes">Music & Vibes</option>
              <option value="Casual & Hanging Out">Casual & Hanging Out</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Description (Optional)</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be discussing? Invite speakers to raise their hand..."
              className="text-xs resize-none bg-background px-3"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" /> Go Live
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
