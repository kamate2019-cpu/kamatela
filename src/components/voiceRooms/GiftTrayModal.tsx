import React, { useState } from 'react';
import { Gift, Coins, Plus, Sparkles, X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User, VirtualGift } from '@/types/kamatela';

export const GIFT_TIERS: VirtualGift[] = [
  {
    id: 'gift_rose',
    name: 'Red Rose',
    coins: 10,
    icon: '🌹',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40',
    animationType: 'rose',
  },
  {
    id: 'gift_coffee',
    name: 'Kola Coffee',
    coins: 25,
    icon: '☕',
    color: 'from-amber-600/20 to-orange-500/20 border-amber-600/40',
    animationType: 'coffee',
  },
  {
    id: 'gift_mic',
    name: 'Golden Mic',
    coins: 50,
    icon: '🎤',
    color: 'from-yellow-500/20 to-amber-400/20 border-yellow-500/40',
    animationType: 'mic',
  },
  {
    id: 'gift_lion',
    name: 'Safari Lion',
    coins: 100,
    icon: '🦁',
    color: 'from-amber-500/20 to-red-500/20 border-amber-500/50',
    animationType: 'lion',
  },
  {
    id: 'gift_car',
    name: 'Supercar',
    coins: 250,
    icon: '🏎️',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40',
    animationType: 'car',
  },
  {
    id: 'gift_crown',
    name: 'Diamond Crown',
    coins: 500,
    icon: '👑',
    color: 'from-purple-500/30 via-pink-500/20 to-amber-500/30 border-purple-400/60',
    animationType: 'crown',
  },
];

interface GiftTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleRecipients: User[];
  senderCoins: number;
  onSendGift: (gift: VirtualGift, recipient: User) => void;
  onOpenTopUp: () => void;
}

export const GiftTrayModal: React.FC<GiftTrayModalProps> = ({
  isOpen,
  onClose,
  eligibleRecipients,
  senderCoins,
  onSendGift,
  onOpenTopUp,
}) => {
  const [selectedGift, setSelectedGift] = useState<VirtualGift>(GIFT_TIERS[0]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(() => {
    return eligibleRecipients[0]?.id || '';
  });

  if (!isOpen) return null;

  const activeRecipient =
    eligibleRecipients.find((r) => r.id === selectedRecipientId) || eligibleRecipients[0];

  const handleSend = () => {
    if (!activeRecipient) {
      toast.error('Please choose a speaker or host on stage to receive the gift!');
      return;
    }

    if (senderCoins < selectedGift.coins) {
      toast.error(`Insufficient coins! You need ${selectedGift.coins} coins for ${selectedGift.name}.`);
      onOpenTopUp();
      return;
    }

    onSendGift(selectedGift, activeRecipient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3 animate-in fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl text-white">
        {/* Header with Coin Balance & Top Up button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Virtual Gifts</h3>
              <p className="text-[10px] text-zinc-400">Tip Stage Speakers & Host</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTopUp}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono">{senderCoins}</span>
              <Plus className="w-3 h-3 text-amber-300" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recipient Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-zinc-300">
            Gift Recipient (Speakers & Host on Stage)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {eligibleRecipients.map((rec) => {
              const isSelected = activeRecipient?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecipientId(rec.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer shrink-0 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <img
                    src={rec.avatar}
                    alt={rec.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-xs font-bold truncate max-w-[90px]">{rec.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Gift Grid (6 tiers) */}
        <div className="grid grid-cols-3 gap-2.5">
          {GIFT_TIERS.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <div
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/10 scale-102'
                    : `bg-gradient-to-b ${gift.color} hover:border-white/40`
                }`}
              >
                <span className="text-3xl mb-1 filter drop-shadow">{gift.icon}</span>
                <span className="text-xs font-bold text-white truncate max-w-full">
                  {gift.name}
                </span>
                <span className="mt-1 flex items-center gap-0.5 text-[10px] font-extrabold text-amber-400">
                  🪙 {gift.coins}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Send Action */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-zinc-400">Cost: </span>
            <span className="font-extrabold text-amber-400 font-mono">
              {selectedGift.coins} Coins
            </span>
          </div>

          <Button
            onClick={handleSend}
            disabled={!activeRecipient}
            className="flex-1 max-w-[200px] h-9 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
          >
            Send {selectedGift.name} ✨
          </Button>
        </div>
      </div>
    </div>
  );
};
