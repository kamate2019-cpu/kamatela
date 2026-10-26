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
import { Plus, Tag, DollarSign, Image, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessProduct } from '@/types/kamatela';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<BusinessProduct, 'id' | 'businessId'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80'
  );
  const [features, setFeatures] = useState('Premium Quality, 1-Year Warranty, Fast Delivery');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const realImgUrl = URL.createObjectURL(file);
    setImageUrl(realImgUrl);
    toast.success('Loaded real photo from device!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      toast.error('Please specify title and price');
      return;
    }

    const featureList = features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    onAddProduct({
      title: title.trim(),
      description: description.trim() || 'Verified item on KAMATELA catalog.',
      price: parseFloat(price) || 0,
      currency: '$',
      category,
      imageUrl,
      inStock: true,
      features: featureList,
    });

    toast.success(`Product "${title}" added to your catalog!`);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Plus className="w-5 h-5 text-emerald-400" /> Add Product or Service
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            List items in your WhatsApp business catalog and link them in TikTok stream videos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {/* Real Photo upload picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImagePicked}
            className="hidden"
          />

          <div className="space-y-1">
            <Label className="text-xs">Product Image</Label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5 h-8"
              >
                <Camera className="w-3.5 h-3.5" /> Upload from Camera / Device
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Product or Service Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Studio Monitor"
              className="h-8 text-xs bg-background px-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Price (USD)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49"
                className="h-8 text-xs bg-background px-3"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 text-xs rounded-md bg-background border border-border px-2 text-foreground focus:outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Gourmet Food">Gourmet Food</option>
                <option value="Creator Gear">Creator Gear</option>
                <option value="Services">Services</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description for customers browsing your catalog..."
              className="text-xs resize-none bg-background px-3"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Key Features (comma-separated)</Label>
            <Input
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g. Waterproof, 2-Year Warranty, Organic"
              className="h-8 text-xs bg-background px-3"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Save to Catalog
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
