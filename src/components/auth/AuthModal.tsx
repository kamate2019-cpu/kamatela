import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  UserCheck,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Layers,
  Radio,
  Music,
  Video,
  MessageSquare,
  Coins,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User } from '@/types/kamatela';
import { mockUsers, currentUser as defaultUser } from '@/services/kamatelaStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isAuthenticated: boolean;
  onLogin: (user: User, token?: string) => void;
  onLogout: () => void;
  onSwitchAccount: (user: User) => void;
  initialMode?: 'login' | 'register' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAuthenticated,
  onLogin,
  onLogout,
  onSwitchAccount,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>(initialMode);
  const [identifier, setIdentifier] = useState('kamate2019@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Alex Kamate');
  const [accountType, setAccountType] = useState<'creator' | 'business'>('creator');

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Available ready-to-use demo accounts for instant 1-tap switching
  const presetProfiles: { role: string; user: User; icon: string; description: string }[] = [
    {
      role: 'Creator & Entrepreneur',
      user: defaultUser,
      icon: '🚀',
      description: 'Default creator account with short video feed, wallet coins, and AI music.',
    },
    {
      role: 'Tech Reviewer & Nomad',
      user: mockUsers.sophia,
      icon: '📸',
      description: 'Consumer tech influencer with 89k followers and personal chat threads.',
    },
    {
      role: 'Food & Beverage Business',
      user: mockUsers.marcus,
      icon: '🌮',
      description: 'Artisanal business profile with product catalog, orders, and customer inquiries.',
    },
    {
      role: 'Verified Hi-Fi Audio Brand',
      user: mockUsers.zara,
      icon: '🎧',
      description: 'Luxe Audio Labs business profile with brand soundtrack and studio headphones.',
    },
    {
      role: 'Electronic DJ & Producer',
      user: mockUsers.elena,
      icon: '⚡',
      description: 'Live voice room host and Suno AI studio music producer.',
    },
  ];

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter an email or phone number');
      return;
    }
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    // Check if matches any existing user or create customized profile
    const matched = Object.values(mockUsers).find(
      (u) =>
        u.businessEmail?.toLowerCase() === identifier.toLowerCase() ||
        u.name.toLowerCase() === identifier.toLowerCase() ||
        u.handle.toLowerCase() === identifier.toLowerCase() ||
        u.businessPhone === identifier
    );

    const targetUser: User = matched || {
      ...defaultUser,
      id: `user_${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      handle: `@${identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    };

    onLogin(targetUser, `session_${Date.now()}`);
    toast.success(`Welcome back, ${targetUser.name}! Unified SSO active across all modules.`);
    onClose();
  };

  const handleManualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !identifier.trim() || !password.trim()) {
      toast.error('Please fill in all registration fields');
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: fullName.trim(),
      handle: `@${fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: accountType === 'business' ? 'Official Business on KAMATELA' : 'Creator on KAMATELA Super App',
      coins: 600,
      isBusiness: accountType === 'business',
      businessName: accountType === 'business' ? fullName.trim() : undefined,
      businessCategory: accountType === 'business' ? 'Retail & Services' : undefined,
      verified: true,
      followersCount: 100,
      followingCount: 15,
      likesCount: 500,
    };

    onLogin(newUser, `session_${Date.now()}`);
    toast.success(`Account created! Single login active for all 6 KAMATELA modules.`);
    onClose();
  };

  const handlePresetSelect = (presetUser: User) => {
    onSwitchAccount(presetUser);
    toast.success(`Switched to ${presetUser.name}. All tabs and features updated!`);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    toast.info('Logged out. Please log in or select a profile to continue.');
    setMode('switch');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between gap-3 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                Unified Authentication
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Single Sign-On
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Log in once to access all 6 modules with full persistent synchronization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Global Access Banner (Highlights 6 Core Modules) */}
        <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-400">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 1-Login Unlocks All Modules:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[9px]">
            <span title="Video Feed">Feed</span>•
            <span title="Chats & Calls">Chat</span>•
            <span title="Voice Rooms">Rooms</span>•
            <span title="Suno Studio">Music</span>•
            <span title="Wallet">Wallet</span>•
            <span title="Business">Hub</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex rounded-xl bg-muted p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                mode === 'login'
                  ? 'bg-card text-emerald-400 shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                mode === 'register'
                  ? 'bg-card text-emerald-400 shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('switch')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                mode === 'switch'
                  ? 'bg-card text-emerald-400 shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Demo Switch
            </button>
          </div>
        </div>

        {/* Active Account Overview Card */}
        <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400 shrink-0 shadow-sm">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground truncate">{currentUser.name}</span>
                {currentUser.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {currentUser.isBusiness && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                    BIZ
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.handle}</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Coins className="w-3 h-3" /> {(currentUser.coins ?? 500).toLocaleString()} Coins
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogoutClick}
            className="h-7 px-2.5 text-[11px] font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 rounded-xl"
            title="Log out of all modules"
          >
            <LogOut className="w-3 h-3" /> Log Out
          </Button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {mode === 'switch' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold px-1">
                Select an account to log in instantly across all modules:
              </p>
              <div className="space-y-2">
                {presetProfiles.map((item) => {
                  const isCurrent = item.user.id === currentUser.id;
                  return (
                    <div
                      key={item.user.id}
                      onClick={() => handlePresetSelect(item.user)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                          : 'bg-muted/40 border-border hover:bg-muted hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 text-xs">{item.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-foreground truncate">{item.user.name}</h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/80 shrink-0">
                              {item.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            🪙 {item.user.coins} Coins {item.user.isBusiness ? '• Verified Store' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePresetSelect(item.user)}
                            className="h-7 px-2.5 text-[11px] font-bold border border-border text-foreground hover:bg-muted rounded-xl"
                          >
                            Switch
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleManualLogin} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email or Phone Number
                </label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex@kamatela.io or +1 (555) 438-9201"
                  className="text-xs h-9 bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="text-xs h-9 bg-muted/50 border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 mt-2"
              >
                Log In with Universal SSO
              </Button>

              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                <p className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Persistent Session Guarantee
                </p>
                <p>
                  You will stay logged in across page reloads and tab navigation. Your offline chats, AI music,
                  and wallet remain synced automatically.
                </p>
              </div>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  Create one (Sign Up)
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleManualRegister} className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Display Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Taylor Swift or AfroBeats Hub"
                  className="text-xs h-9 bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email or Mobile Phone</label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. user@kamatela.com"
                  className="text-xs h-9 bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="text-xs h-9 bg-muted/50 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Account Profile Type</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAccountType('creator')}
                    className={`p-2 rounded-xl border text-left transition-colors ${
                      accountType === 'creator'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    🎨 Creator / Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`p-2 rounded-xl border text-left transition-colors ${
                      accountType === 'business'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    🏬 Business & Merchant
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 mt-2"
              >
                Create Account & Unlock All Modules
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  Log In (Sign In)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/80 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1-Login SSO Enabled
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
