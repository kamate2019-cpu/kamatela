import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  History,
  RotateCw,
  ArrowUpRight,
  Gift,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { WalletTransaction } from '@/types/kamatela';

interface CoinTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  transactions?: WalletTransaction[];
  onTopUp: (amount: number, channel?: string, amountUsd?: number) => void;
}

type PaymentChannel = 'M-Pesa' | 'MTN MoMo' | 'Orange Money' | 'Card';

export const CoinTopUpModal: React.FC<CoinTopUpModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  transactions = [],
  onTopUp,
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [selectedPack, setSelectedPack] = useState<number>(500);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('M-Pesa');
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const packages = [
    {
      coins: 100,
      priceUsd: 0.99,
      priceText: '$0.99',
      badge: 'Starter',
      bonus: '+0 Bonus',
      popular: false,
      color: 'border-zinc-700 bg-zinc-900/60',
    },
    {
      coins: 500,
      priceUsd: 4.99,
      priceText: '$4.99',
      badge: 'Popular Tier',
      bonus: '+50 Bonus Coins',
      popular: true,
      color: 'border-amber-500/50 bg-amber-500/10',
    },
    {
      coins: 1000,
      priceUsd: 8.99,
      priceText: '$8.99',
      badge: 'Best Value',
      bonus: '+150 Bonus Coins',
      popular: false,
      color: 'border-purple-500/50 bg-purple-500/10',
    },
    {
      coins: 2500,
      priceUsd: 19.99,
      priceText: '$19.99',
      badge: 'Creator Pro',
      bonus: '+400 Bonus Coins',
      popular: false,
      color: 'border-cyan-500/50 bg-cyan-500/10',
    },
  ];

  const channels: { id: PaymentChannel; name: string; icon: string; desc: string; badgeColor: string }[] = [
    {
      id: 'M-Pesa',
      name: 'M-Pesa Express',
      icon: '🟢',
      desc: 'Instant Safaricom / Vodacom STK Push',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'MTN MoMo',
      name: 'MTN Mobile Money',
      icon: '🟡',
      desc: 'Direct MoMo USSD Prompt & Pin',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    {
      id: 'Orange Money',
      name: 'Orange Money',
      icon: '🟠',
      desc: 'Orange Web & Token Payment',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    {
      id: 'Card',
      name: 'Credit / Debit Card',
      icon: '💳',
      desc: 'Visa, Mastercard & UnionPay',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  ];

  const handleConfirmRecharge = () => {
    setIsProcessing(true);
    const chosenPack = packages.find((p) => p.coins === selectedPack) || packages[1];

    toast.info(`Sending ${selectedChannel} payment request...`);

    setTimeout(() => {
      setIsProcessing(false);
      onTopUp(chosenPack.coins, selectedChannel, chosenPack.priceUsd);
      toast.success(
        `🎉 ${selectedChannel} payment verified! Added +${chosenPack.coins} KAMATELA Coins!`
      );
      setActiveTab('history');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-purple-500/30 p-5 space-y-4 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">KAMATELA Coin Wallet</h3>
              <p className="text-[10px] text-zinc-400">Multi-Channel Mobile Money & Banking</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Top Up vs Transaction History */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'topup'
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Top Up Coins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-black shadow-lg font-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Transaction Ledger ({transactions.length})
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-zinc-900 border border-amber-500/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Available Balance
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {currentBalance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-400/80">Coins</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🪙
          </div>
        </div>

        {/* TAB 1: TOP UP COINS */}
        {activeTab === 'topup' && (
          <div className="space-y-4">
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-white/80">Select Payment Provider</p>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((ch) => {
                  const isChosen = selectedChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 ${
                        isChosen
                          ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400'
                          : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg">{ch.icon}</span>
                        {isChosen && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{ch.name}</h4>
                        <p className="text-[9px] text-zinc-400 line-clamp-1">{ch.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Account Input */}
            <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 space-y-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                {selectedChannel === 'Card' ? (
                  <>
                    <CreditCard className="w-3 h-3 text-cyan-400" /> Card Details
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3 h-3 text-emerald-400" /> {selectedChannel} Mobile Number
                  </>
                )}
              </label>

              {selectedChannel === 'Card' ? (
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number"
                  className="bg-black/40 border-white/20 text-white font-mono text-xs rounded-xl h-9"
                />
              ) : (
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="bg-black/40 border-white/20 text-white font-mono text-xs rounded-xl h-9"
                />
              )}
              <p className="text-[9px] text-zinc-400">
                {selectedChannel === 'Card'
                  ? 'Encrypted card processing with 3D Secure verification'
                  : 'A direct push prompt will be sent to your mobile phone to authorize'}
              </p>
            </div>

            {/* Coin Packages Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-white/80">Choose Package Amount</p>
              <div className="grid grid-cols-2 gap-2">
                {packages.map((pkg) => {
                  const isSelected = selectedPack === pkg.coins;
                  return (
                    <div
                      key={pkg.coins}
                      onClick={() => setSelectedPack(pkg.coins)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400'
                          : pkg.color
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          +{pkg.coins}
                        </span>
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {pkg.priceText}
                        </span>
                      </div>
                      <p className="text-[9px] text-amber-200 font-medium">{pkg.bonus}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Recharge Button */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Mobile Sandbox Simulation — Zero real charge</span>
              </div>

              <Button
                onClick={handleConfirmRecharge}
                disabled={isProcessing}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:opacity-90 text-black font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin" /> Verifying {selectedChannel}...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 fill-current" /> Pay with {selectedChannel} (+{selectedPack} Coins)
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Past Wallet Activity</span>
              <span>{transactions.length} Records</span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No past transactions found.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const isPositive = tx.coins > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                            tx.type === 'topup'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : tx.type === 'game_reward'
                              ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                              : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          }`}
                        >
                          {tx.type === 'topup' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : tx.type === 'game_reward' ? (
                            <Trophy className="w-4 h-4" />
                          ) : (
                            <Gift className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white truncate">{tx.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                            <span className="font-mono text-zinc-500">{tx.referenceId}</span>
                            <span>•</span>
                            <span>{tx.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`font-black font-mono text-sm ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? `+${tx.coins}` : `${tx.coins}`} 🪙
                        </p>
                        <span className="text-[9px] text-zinc-500 font-semibold uppercase">
                          {tx.channel || 'Wallet'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => setActiveTab('topup')}
              className="w-full rounded-2xl border border-white/60 text-white hover:bg-white/10 mt-2"
            >
              + Top Up More Coins
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
