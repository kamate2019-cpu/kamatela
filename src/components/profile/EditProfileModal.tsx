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
import { Switch } from '@/components/ui/switch';
import { User, Store, Camera, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType } from '@/types/kamatela';

interface EditProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserType) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [avatar, setAvatar] = useState(user.avatar);
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [isBusiness, setIsBusiness] = useState(user.isBusiness);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(user.businessCategory || 'Lifestyle & Creator');
  const [businessPhone, setBusinessPhone] = useState(user.businessPhone || '');
  const [businessEmail, setBusinessEmail] = useState(user.businessEmail || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
        toast.success('Profile photo uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      avatar,
      name,
      handle,
      bio,
      isBusiness,
      businessName: isBusiness ? businessName : undefined,
      businessCategory: isBusiness ? businessCategory : undefined,
      businessPhone: isBusiness ? businessPhone : undefined,
      businessEmail: isBusiness ? businessEmail : undefined,
    });
    toast.success('Profile & photo updated!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <User className="w-5 h-5 text-primary" /> Edit Profile & Photo
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your profile picture, personal identity, and business details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3.5 pt-2">
          {/* Profile Picture Upload & Avatar Picker */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5">
            <Label className="text-xs font-semibold block">Profile Picture</Label>

            <div className="flex items-center gap-3">
              {/* Avatar Preview */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 shadow">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 rounded-xl"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Image URL
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">JPG, PNG or WEBP up to 5MB</p>
              </div>
            </div>

            {showUrlInput && (
              <Input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-8 text-xs bg-background"
              />
            )}

            {/* Quick Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-medium">Or choose a preset avatar:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                      avatar === url ? 'border-emerald-500 scale-105 shadow-sm' : 'border-border/60 opacity-80'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {avatar === url && (
                      <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs bg-background px-3"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Username Handle</Label>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="h-8 text-xs bg-background px-3"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">About / Status / Bio</Label>
            <Textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Hey there! I am using KAMATELA"
              className="text-xs resize-none bg-background px-3"
            />
          </div>

          {/* Business Mode Switcher */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-foreground">Business Account Mode</p>
                  <p className="text-[10px] text-muted-foreground">Unlock product catalogs and Direct customer chat</p>
                </div>
              </div>
              <Switch checked={isBusiness} onCheckedChange={setIsBusiness} />
            </div>

            {isBusiness && (
              <div className="space-y-2 pt-2 border-t border-amber-500/20">
                <div className="space-y-1">
                  <Label className="text-[11px]">Business Name</Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Tech Studio"
                    className="h-8 text-xs bg-background px-3"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Category</Label>
                  <Input
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    placeholder="e.g. Fashion, Electronics, Food"
                    className="h-8 text-xs bg-background px-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Mobile Phone</Label>
                    <Input
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-8 text-xs bg-background px-3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Email</Label>
                    <Input
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="support@brand.com"
                      className="h-8 text-xs bg-background px-3"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Save Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
