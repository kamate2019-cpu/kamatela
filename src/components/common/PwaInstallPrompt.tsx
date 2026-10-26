import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Check device platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS or mobile and not standalone, show prompt periodically if dismissed
    const dismissed = sessionStorage.getItem('kamatela_pwa_dismissed');
    if (!dismissed && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('kamatela_pwa_dismissed', 'true');
  };

  if (isStandalone) {
    return null; // App already runs in native standalone mode!
  }

  return (
    <>
      {showBanner && (
        <div className="fixed top-14 left-0 right-0 z-50 px-3 md:px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="mx-auto max-w-md bg-card/95 backdrop-blur-md border border-primary/40 rounded-xl p-3 shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm bg-background">
              <img src="/icons/icon-192.svg" alt="KAMATELA" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-foreground truncate">Install KAMATELA</span>
                <span className="text-[10px] bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded border border-primary/30">PWA</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {isIOS ? 'Add to Home Screen for full iOS experience' : 'Fast, offline super app for mobile'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                onClick={handleInstallClick}
              >
                {isIOS ? 'Install' : 'Install'}
              </Button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Dialog for iOS & desktop browsers */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Smartphone className="w-5 h-5 text-primary" />
              Install KAMATELA on {isIOS ? 'iOS (iPhone / iPad)' : 'Android / Desktop'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enjoy fullscreen TikTok feeds, instant WhatsApp chats, and fast shopping with zero app store downloads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-sm">
            {isIOS ? (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="text-xs">
                    Tap the <span className="font-semibold text-foreground inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 text-blue-400" /> Share</span> button at the bottom of Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-xs">
                    Scroll down and tap <span className="font-semibold text-foreground inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> Add to Home Screen</span>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="text-xs">
                    Tap <span className="font-semibold text-foreground">Add</span> in the top right. Launch KAMATELA directly from your iOS Home Screen!
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="text-xs">
                    Tap the browser menu <span className="font-semibold text-foreground">⋮ (three dots)</span> on Chrome, Samsung Internet, or Edge.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-xs">
                    Select <span className="font-semibold text-foreground inline-flex items-center gap-1"><Download className="w-3.5 h-3.5 text-primary" /> Install app</span> or <span className="font-semibold">Add to Home Screen</span>.
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowInstructions(false)}
                className="w-full text-xs font-semibold"
              >
                <Check className="w-4 h-4 mr-1.5" /> Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
