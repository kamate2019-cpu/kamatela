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
import { Switch } from '@/components/ui/switch';
import { User, Store, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType } from '@/types/kamatela';

interface EditProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserType) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [isBusiness, setIsBusiness] = useState(user.isBusiness);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(user.businessCategory || 'Lifestyle & Creator');
  const [businessPhone, setBusinessPhone] = useState(user.businessPhone || '');
  const [businessEmail, setBusinessEmail] = useState(user.businessEmail || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      handle,
      bio,
      isBusiness,
      businessName: isBusiness ? businessName : undefined,
      businessCategory: isBusiness ? businessCategory : undefined,
      businessPhone: isBusiness ? businessPhone : undefined,
      businessEmail: isBusiness ? businessEmail : undefined,
    });
    toast.success('Profile details updated!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <User className="w-5 h-5 text-primary" /> Edit Profile & Business Account
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure your personal identity and enable business features on KAMATELA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3 pt-2">
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
            <Label className="text-xs">Bio / Status</Label>
            <Textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
                  <p className="text-[10px] text-muted-foreground">Unlock product catalogs and WhatsApp customer chat</p>
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
                    <Label className="text-[11px]">WhatsApp Phone</Label>
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
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
