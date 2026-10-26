import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, MessageCircle, Check, Star, ShieldCheck, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessProduct, User } from '@/types/kamatela';

interface ProductDetailModalProps {
  product: BusinessProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onInquireWhatsApp: (product: BusinessProduct) => void;
  businessUser?: User;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onInquireWhatsApp,
  businessUser,
}) => {
  if (!isOpen || !product) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on KAMATELA Business Catalog!`,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border p-0 overflow-hidden">
        {/* Product Image Banner */}
        <div className="relative w-full h-56 bg-muted overflow-hidden">
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/80 text-foreground backdrop-blur-md border border-border text-[10px]">
              {product.category}
            </Badge>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/70"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Content */}
        <div className="p-4 space-y-3">
          <DialogHeader className="text-left">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl font-black text-emerald-400">
                {product.currency}{product.price}
              </span>
              <span className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3" /> In Stock & Verified
              </span>
            </div>
            <DialogTitle className="text-base font-bold text-foreground mt-1">
              {product.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          {/* Features pills */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-foreground">Specifications:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.features.map((feat) => (
                  <span
                    key={feat}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Business Seller info snippet */}
          {businessUser && (
            <div className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                  <img src={businessUser.avatar} alt={businessUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {businessUser.businessName || businessUser.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{businessUser.businessCategory}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {businessUser.businessRating || '4.9'}
              </div>
            </div>
          )}

          {/* WhatsApp Direct Action */}
          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onInquireWhatsApp(product);
                onClose();
              }}
              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:flex-1 gap-1.5 shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> Message Seller on WhatsApp
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
