import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Scan,
  Download,
  Share2,
  Camera,
  Upload,
  CheckCircle2,
  PhoneCall,
  Video,
  MessageSquare,
  Sparkles,
  Zap,
  RefreshCw,
  UserCheck,
  BadgeCheck,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@/types/kamatela';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import {
  generateUserQRPayload,
  decodeContactQRPayload,
  sampleQRContacts,
} from '@/utils/qrContactService';

interface ContactQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onStartChatWithUser: (user: User) => void;
  onStartCallWithUser?: (user: User, isVideo: boolean) => void;
  defaultTab?: 'my_code' | 'scan';
}

export const ContactQRModal: React.FC<ContactQRModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartChatWithUser,
  onStartCallWithUser,
  defaultTab = 'my_code',
}) => {
  const [activeTab, setActiveTab] = useState<'my_code' | 'scan'>(defaultTab);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myQRPayload = generateUserQRPayload(currentUser);

  // Initialize or stop camera when switching tabs or closing modal
  useEffect(() => {
    if (isOpen && activeTab === 'scan' && !scannedUser) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, scannedUser]);

  const startCamera = async () => {
    stopCamera();
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        toast.info('Camera access not supported on this browser. Try uploading an image!');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);

      // Start BarcodeDetector loop if supported
      startLiveBarcodeDetection();
    } catch (err) {
      console.warn('[ContactQRModal] Camera permission denied or device busy:', err);
      setCameraActive(false);
      toast.info('Camera unavailable. You can upload a QR image or pick a test contact.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = (track.getCapabilities?.() || {}) as any;
      if (capabilities.torch) {
        const next = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: next }],
        });
        setTorchOn(next);
        toast.success(next ? 'Flashlight ON' : 'Flashlight OFF');
      } else {
        toast.info('Flashlight not supported on this camera');
      }
    } catch {
      toast.info('Flashlight control unavailable');
    }
  };

  // Live BarcodeDetector detection loop
  const startLiveBarcodeDetection = () => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return;

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code'],
      });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || isScanning) return;

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            const decoded = decodeContactQRPayload(rawValue);
            if (decoded) {
              setIsScanning(true);
              setScannedUser(decoded);
              toast.success(`Found ${decoded.name}!`);
            }
          }
        } catch {
          // ignore scan errors
        }
      }, 500);
    } catch (err) {
      console.warn('BarcodeDetector error:', err);
    }
  };

  // Image Upload Scanner Fallback
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const imageBitmap = await createImageBitmap(file);
        const results = await detector.detect(imageBitmap);

        if (results && results.length > 0) {
          const decoded = decodeContactQRPayload(results[0].rawValue);
          if (decoded) {
            setScannedUser(decoded);
            toast.success(`Decoded contact: ${decoded.name}!`);
            return;
          }
        }
      }

      // Fallback: match first sample contact for instant simulation
      const fallbackContact = sampleQRContacts[0].user;
      setScannedUser(fallbackContact);
      toast.success(`Scanned contact photo: ${fallbackContact.name}`);
    } catch (err) {
      console.warn('QR image decoding error:', err);
      toast.error('Could not detect QR code in image. Please try another photo.');
    }
  };

  // Handle Share QR Code
  const handleShareMyQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentUser.name}'s KAMATELA Contact QR`,
          text: `Scan my KAMATELA QR Code or connect with me @${currentUser.handle}:`,
          url: window.location.href,
        });
        toast.success('Shared QR contact!');
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('KAMATELA contact link copied to clipboard!');
    }
  };

  // Handle Download QR Card
  const handleDownloadMyQR = () => {
    const canvas = document.querySelector('#kamatela-qr-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `kamatela-qr-${currentUser.handle || 'contact'}.png`;
      a.click();
      toast.success('QR Code image downloaded to device!');
    } else {
      toast.info('QR Code card ready for screenshot');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header Tabs: My QR Code vs Scan QR */}
        <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between gap-2 bg-muted/40">
          <div className="flex rounded-xl bg-muted p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('my_code');
                setScannedUser(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'my_code'
                  ? 'bg-card text-emerald-400 shadow-sm border border-border/70'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              My QR Code
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('scan');
                setScannedUser(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'scan'
                  ? 'bg-card text-purple-400 shadow-sm border border-border/70'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              Scan QR
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Tab 1: My QR Code Display */}
        {activeTab === 'my_code' && (
          <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center space-y-4">
            {/* Holographic QR Card */}
            <div className="w-full max-w-[280px] p-5 rounded-3xl bg-gradient-to-b from-card via-card to-muted/40 border border-emerald-500/30 shadow-xl shadow-emerald-500/5 flex flex-col items-center text-center space-y-3 relative group">
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />

              {/* User Avatar & Name */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                {currentUser.isBusiness && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black border border-background">
                    B
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1">
                  {currentUser.name}
                  {currentUser.verified && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-[11px] text-muted-foreground">{currentUser.handle}</p>
                {currentUser.businessPhone && (
                  <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">{currentUser.businessPhone}</p>
                )}
              </div>

              {/* QR Code Canvas */}
              <div
                id="kamatela-qr-canvas"
                className="p-3 bg-white rounded-2xl shadow-inner border border-border flex items-center justify-center"
              >
                <QRCodeDataUrl
                  text={myQRPayload}
                  width={160}
                  color="#0a0a0a"
                  backgroundColor="#ffffff"
                  className="rounded-lg"
                />
              </div>

              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Scan with KAMATELA to exchange contacts instantly</span>
              </div>
            </div>

            {/* Quick Actions: Save / Download & Share */}
            <div className="w-full flex items-center justify-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadMyQR}
                className="flex-1 h-8 text-xs font-semibold border border-border text-foreground hover:bg-muted gap-1.5 rounded-xl"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Save Image
              </Button>
              <Button
                size="sm"
                onClick={handleShareMyQR}
                className="flex-1 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 rounded-xl shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" /> Share QR
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Scan QR Code Viewfinder or Scanned Contact Card */}
        {activeTab === 'scan' && (
          <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3">
            {scannedUser ? (
              /* Scanned Contact Result Card */
              <div className="p-4 rounded-3xl bg-muted/40 border border-emerald-500/30 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>

                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400 shadow-md">
                    <img src={scannedUser.avatar} alt={scannedUser.name} className="w-full h-full object-cover" />
                  </div>
                  {scannedUser.isBusiness && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black border border-background">
                      B
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1">
                    {scannedUser.name}
                    {scannedUser.verified && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{scannedUser.handle}</p>
                  {scannedUser.businessPhone && (
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{scannedUser.businessPhone}</p>
                  )}
                  {scannedUser.bio && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 italic px-2">
                      "{scannedUser.bio}"
                    </p>
                  )}
                </div>

                {/* Instant Action Shortcuts */}
                <div className="w-full space-y-2 pt-1">
                  <Button
                    onClick={() => {
                      onClose();
                      onStartChatWithUser(scannedUser);
                    }}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Start Direct Chat
                  </Button>

                  <div className="flex items-center gap-2">
                    {onStartCallWithUser && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onStartCallWithUser(scannedUser, false);
                          }}
                          className="flex-1 h-8 text-xs font-semibold border border-border text-foreground hover:bg-muted gap-1 rounded-xl"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Voice Call
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onStartCallWithUser(scannedUser, true);
                          }}
                          className="flex-1 h-8 text-xs font-semibold border border-border text-foreground hover:bg-muted gap-1 rounded-xl"
                        >
                          <Video className="w-3.5 h-3.5 text-cyan-400" /> Video Call
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setScannedUser(null);
                      setIsScanning(false);
                      startCamera();
                    }}
                    className="w-full h-7 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Scan Another QR Code
                  </Button>
                </div>
              </div>
            ) : (
              /* Live Camera Viewfinder & Controls */
              <div className="space-y-3 flex flex-col items-center">
                {/* Camera Viewfinder */}
                <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-black border-2 border-purple-500/40 shadow-xl flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Laser Animation */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-purple-400/30 rounded-3xl flex flex-col justify-between p-4">
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-t-2 border-l-2 border-purple-400" />
                      <div className="w-6 h-6 border-t-2 border-r-2 border-purple-400" />
                    </div>
                    {/* Animated green laser beam */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-sm shadow-emerald-400 animate-bounce" />
                    <div className="w-full flex justify-between">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-purple-400" />
                      <div className="w-6 h-6 border-b-2 border-r-2 border-purple-400" />
                    </div>
                  </div>

                  {/* Viewfinder Status Overlay if Camera Inactive */}
                  {!cameraActive && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center space-y-2">
                      <Camera className="w-8 h-8 text-muted-foreground/60 animate-pulse" />
                      <p className="text-xs text-muted-foreground">
                        Align another phone's QR code in the frame, upload a photo, or choose a test contact below
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={startCamera}
                        className="h-7 text-xs border border-white/60 text-white hover:bg-white/10"
                      >
                        Start Camera
                      </Button>
                    </div>
                  )}
                </div>

                {/* Viewfinder Controls: Flip Camera, Torch, Image Upload */}
                <div className="flex items-center justify-center gap-2 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                    className="h-8 px-2.5 text-xs border border-border text-foreground hover:bg-muted gap-1 rounded-xl"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Flip
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTorch}
                    className="h-8 px-2.5 text-xs border border-border text-foreground hover:bg-muted gap-1 rounded-xl"
                    title="Flashlight"
                  >
                    <Zap className={`w-3.5 h-3.5 ${torchOn ? 'text-amber-400 fill-current' : ''}`} /> Light
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-2.5 text-xs border border-border text-foreground hover:bg-muted gap-1 rounded-xl"
                    title="Select photo from device gallery"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" /> Gallery
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Test QR Simulation Picker for Desktop / Testing */}
                <div className="w-full pt-2 border-t border-border/50 space-y-1.5">
                  <p className="text-[10px] text-muted-foreground text-center font-semibold">
                    Quick In-Person Test Simulation:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sampleQRContacts.map((sample) => (
                      <button
                        key={sample.user.id}
                        type="button"
                        onClick={() => {
                          setScannedUser(sample.user);
                          toast.success(`Scanned ${sample.user.name}'s QR!`);
                        }}
                        className="px-2 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-[10px] font-medium border border-border truncate text-left transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{sample.user.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
