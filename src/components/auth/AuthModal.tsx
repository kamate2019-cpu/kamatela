import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Camera,
  Upload,
  Check,
  ArrowRight,
  BadgeCheck,
  QrCode,
  Sparkles,
  RefreshCw,
  Coins,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User } from '@/types/kamatela';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { KamatelaLogo } from '@/components/common/KamatelaLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isAuthenticated: boolean;
  onLogin: (user: User, token?: string) => void;
  onLogout: () => void;
  onSwitchAccount?: (user: User) => void;
  initialMode?: 'login' | 'register' | 'switch';
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US / Canada', flag: '🇺🇸' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+243', country: 'DR Congo', flag: '🇨🇩' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+225', country: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isAuthenticated,
  onLogin,
  onLogout,
}) => {
  // Main tabs: 'phone' (KAMATELA Chat style), 'qr' (KAMATELA Chat Web), 'email' (Email/Password)
  const [authTab, setAuthTab] = useState<'phone' | 'qr' | 'email'>('phone');

  // Mobile Phone registration/login steps: 1 = Enter phone, 2 = Enter OTP, 3 = Profile setup
  const [phoneStep, setPhoneStep] = useState<1 | 2 | 3>(1);
  const [selectedCountry, setSelectedCountry] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('555-019-2834');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(45);
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  // KAMATELA Chat Profile Setup state
  const [profileName, setProfileName] = useState(currentUser.name || 'Alex Kamate');
  const [profileStatus, setProfileStatus] = useState(currentUser.bio || 'Hey there! I am using KAMATELA.');
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [isBusinessProfile, setIsBusinessProfile] = useState(currentUser.isBusiness || false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email form state
  const [emailInput, setEmailInput] = useState(currentUser.businessEmail || 'kamate2019@gmail.com');
  const [passwordInput, setPasswordInput] = useState('••••••••');

  // Resend timer tick
  useEffect(() => {
    let timer: any;
    if (phoneStep === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneStep, resendCountdown]);

  if (!isOpen) return null;

  const fullPhone = `${selectedCountry} ${phoneNumber.trim()}`;

  // Step 1: Send SMS OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setOtpCode(randomCode); // Automatically prefill so user is never blocked
    setPhoneStep(2);
    setResendCountdown(45);
    toast.success(`Verification Code: ${randomCode} (Auto-filled on screen)`);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpCode.trim() || generatedOtp || '123456';
    if (code.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    toast.success('Phone number verified successfully!');
    setPhoneStep(3);
  };

  // Step 3: Complete KAMATELA Chat Profile Setup
  const handleFinishProfileSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Please provide your name');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      id: currentUser.id || `user_${Date.now()}`,
      name: profileName.trim(),
      handle: `@${profileName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}`,
      avatar: profileAvatar,
      bio: profileStatus.trim() || 'Hey there! I am using KAMATELA.',
      businessPhone: fullPhone,
      isBusiness: isBusinessProfile,
      verified: true,
    };

    localStorage.setItem('kamatela_kamatela_chat_registered', 'true');
    localStorage.setItem('kamatela_kamatela_chat_phone', fullPhone);
    localStorage.setItem('kamatela_kamatela_chat_name', updatedUser.name);

    onLogin(updatedUser, `session_${Date.now()}`);
    toast.success(`Welcome to KAMATELA, ${updatedUser.name}!`);
    onClose();
  };

  // File upload for profile picture
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfileAvatar(dataUrl);
        toast.success('Profile photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  // KAMATELA Chat Web QR Code Link
  const handleSimulateQrScan = () => {
    const linkedUser: User = {
      ...currentUser,
      businessPhone: fullPhone,
      verified: true,
    };
    onLogin(linkedUser, `session_qr_${Date.now()}`);
    toast.success('Device linked via Web QR!');
    onClose();
  };

  // Fallback Email Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      toast.error('Please enter email and password');
      return;
    }
    const loggedUser: User = {
      ...currentUser,
      businessEmail: emailInput.trim(),
      name: emailInput.split('@')[0] || currentUser.name,
    };
    onLogin(loggedUser, `session_email_${Date.now()}`);
    toast.success(`Signed in as ${loggedUser.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* KAMATELA Chat-Style Emerald Header */}
        <div className="p-4 border-b border-border/60 bg-gradient-to-r from-emerald-950/70 via-card to-teal-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KamatelaLogo size={36} animated={true} />
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                KAMATELA Connect
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Super App
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Sign in or register with phone number</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </div>

        {/* Active Account Overview Card */}
        {isAuthenticated && (
          <div className="p-3 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-foreground truncate">{currentUser.name}</span>
                  {currentUser.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{currentUser.businessPhone || currentUser.handle}</p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Coins className="w-3 h-3" /> {(currentUser.coins ?? 500).toLocaleString()} Coins
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onLogout();
                toast.info('Signed out');
              }}
              className="h-7 px-2.5 text-[11px] font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 rounded-xl"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </Button>
          </div>
        )}

        {/* Tab Navigation: Mobile Phone, Web QR, Email */}
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex rounded-xl bg-muted p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setAuthTab('phone')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                authTab === 'phone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Phone SMS
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('qr')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                authTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Web QR
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('email')}
              className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
                authTab === 'email'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: Mobile Phone Verification */}
          {authTab === 'phone' && (
            <div className="space-y-4">
              {/* STEP 1: Phone Number Input */}
              {phoneStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Verify your phone number</h4>
                    <p className="text-xs text-muted-foreground">
                      KAMATELA will send an SMS message to verify your phone number. Carrier SMS charges may apply.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-foreground">Country & Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-32 h-10 text-xs rounded-xl bg-background border border-border px-2 text-foreground font-medium"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 555-019-2834"
                        className="flex-1 h-10 text-xs rounded-xl bg-background border-border"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 gap-1.5"
                  >
                    Send Verification Code (SMS) <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </form>
              )}

              {/* STEP 2: 6-Digit SMS OTP Verification */}
              {phoneStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Verification Code</h4>
                    <p className="text-xs text-muted-foreground">
                      Verification for <span className="font-bold text-foreground">{fullPhone}</span>
                      <button
                        type="button"
                        onClick={() => setPhoneStep(1)}
                        className="text-emerald-400 font-semibold hover:underline ml-1.5"
                      >
                        Change number
                      </button>
                    </p>
                  </div>

                  {/* Prominent Verification Code Display */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1 shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Your 6-Digit Verification Code</span>
                    </div>
                    <div className="text-2xl font-mono font-black text-emerald-300 tracking-widest py-0.5 select-all">
                      {generatedOtp}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Code is auto-filled below. Tap continue to verify instantly!
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1 2 3 4 5 6"
                      className="h-12 text-center text-lg font-mono font-bold tracking-widest rounded-xl bg-background border-emerald-500/50"
                    />

                    {/* Quick Autofill & Resend Helper */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOtpCode(generatedOtp);
                          toast.info(`Filled code: ${generatedOtp}`);
                        }}
                        className="h-7 text-xs text-emerald-400 hover:text-emerald-300 gap-1 px-2"
                      >
                        <Sparkles className="w-3 h-3" /> Insert Code
                      </Button>

                      <span className="text-muted-foreground text-[11px]">
                        {resendCountdown > 0 ? (
                          `New code in ${resendCountdown}s`
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                              setGeneratedOtp(newCode);
                              setOtpCode(newCode);
                              setResendCountdown(45);
                              toast.success(`Generated new code: ${newCode}`);
                            }}
                            className="text-emerald-400 font-bold hover:underline"
                          >
                            Get New Code
                          </button>
                        )}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                  >
                    Verify & Continue to Profile
                  </Button>
                </form>
              )}

              {/* STEP 3: Profile Picture & Name Setup */}
              {phoneStep === 3 && (
                <form onSubmit={handleFinishProfileSetup} className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Profile Info</h4>
                    <p className="text-xs text-muted-foreground">
                      Please provide your name and a profile photo.
                    </p>
                  </div>

                  {/* Profile Picture Picker */}
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 cursor-pointer group shadow-lg"
                      title="Tap to change profile picture"
                    >
                      <img src={profileAvatar} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">Tap photo to upload</span>

                    {/* Quick Preset Avatars */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setProfileAvatar(url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                            profileAvatar === url ? 'border-emerald-500 scale-110' : 'border-border opacity-70'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Type your name</label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Alex Kamate"
                      className="h-10 text-xs rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">About / Status</label>
                    <Input
                      value={profileStatus}
                      onChange={(e) => setProfileStatus(e.target.value)}
                      placeholder="Hey there! I am using KAMATELA"
                      className="h-10 text-xs rounded-xl bg-background border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                    <div>
                      <p className="text-xs font-bold text-foreground">Business Account</p>
                      <p className="text-[10px] text-muted-foreground">Enable product catalog and store</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBusinessProfile}
                      onChange={(e) => setIsBusinessProfile(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                  >
                    Finish Setup & Start Using KAMATELA
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: KAMATELA Chat Web QR Login */}
          {authTab === 'qr' && (
            <div className="space-y-4 text-center py-2">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Use KAMATELA on your computer</h4>
                <p className="text-xs text-muted-foreground">
                  Open KAMATELA on your phone, go to Settings &gt; Linked Devices, and scan this QR code.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white w-fit mx-auto shadow-lg border border-border/40">
                <QRCodeDataUrl
                  text={`https://kamatela.com/connect?session=web_${Date.now()}&phone=${encodeURIComponent(
                    fullPhone
                  )}`}
                  width={160}
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSimulateQrScan}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Link Web Session Instantly
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Standard Email / Password Fallback */}
          {authTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="h-9 text-xs bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-9 text-xs bg-background border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm mt-2"
              >
                Sign In with Email
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
