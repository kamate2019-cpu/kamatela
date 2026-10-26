import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Signal,
  Gauge,
  RefreshCw,
  Layers,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Sliders,
  Send,
  Zap,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  networkService,
  type NetworkInfo,
  type NetworkType,
  type SyncQueueItem,
} from '@/utils/networkService';

interface NetworkMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNetworkChange?: () => void;
}

export const NetworkMonitorModal: React.FC<NetworkMonitorModalProps> = ({
  isOpen,
  onClose,
  onNetworkChange,
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(networkService.getNetworkInfo());
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [dataSaver, setDataSaver] = useState(networkService.isDataSaverEnabled());
  const [simulatedMode, setSimulatedMode] = useState<NetworkType | 'auto'>(
    networkService.getSimulatedNetwork()
  );
  const [queue, setQueue] = useState<SyncQueueItem[]>(networkService.getSyncQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const refresh = () => {
      setNetworkInfo(networkService.getNetworkInfo());
      setQueue(networkService.getSyncQueue());
    };

    refresh();
    const interval = setInterval(refresh, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsTestingPing(true);
    const latency = await networkService.testLatency();
    setNetworkInfo((prev) => ({ ...prev, latencyMs: latency }));
    setIsTestingPing(false);
    toast.success(`Ping response: ${latency}ms latency`);
  };

  const handleToggleDataSaver = () => {
    const nextVal = !dataSaver;
    setDataSaver(nextVal);
    networkService.setDataSaverEnabled(nextVal);
    toast.success(
      nextVal
        ? 'Data Saver enabled! Lower bitrate & compressed media active.'
        : 'Full Quality streaming restored.'
    );
  };

  const handleSetSimulated = (mode: NetworkType | 'auto') => {
    setSimulatedMode(mode);
    networkService.setSimulatedNetwork(mode);
    setNetworkInfo(networkService.getNetworkInfo());
    onNetworkChange?.();
    toast.info(`Network profile set to: ${mode.toUpperCase()}`);
  };

  const handleFlushQueue = async () => {
    setIsSyncing(true);
    const result = await networkService.flushSyncQueue();
    setIsSyncing(false);
    setQueue(networkService.getSyncQueue());
    if (result.processed > 0) {
      toast.success(`Synchronized ${result.processed} queued actions across network!`);
    } else {
      toast.info('All actions are already synchronized.');
    }
  };

  const getLatencyBadge = (latency: number) => {
    if (latency <= 50) {
      return <span className="text-emerald-400 font-bold font-mono">🟢 Excellent ({latency}ms)</span>;
    }
    if (latency <= 150) {
      return <span className="text-cyan-400 font-bold font-mono">🟡 Good ({latency}ms)</span>;
    }
    if (latency <= 300) {
      return <span className="text-amber-400 font-bold font-mono">🟠 Fair ({latency}ms)</span>;
    }
    return <span className="text-red-400 font-bold font-mono">🔴 Slow / Offline ({latency}ms)</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between gap-3 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Signal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                Network & SSO Continuity
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Cross-Network
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Seamless operation across Wi-Fi, 5G, 4G, 3G, and Offline mode
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

        {/* Real-time Status Card */}
        <div className="p-4 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {networkInfo.isOnline ? (
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-amber-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {networkInfo.isOnline ? `Active Network: ${networkInfo.type}` : 'Offline Mode (Local Cache)'}
              </span>
            </div>
            <div className="text-xs">{getLatencyBadge(networkInfo.latencyMs)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Bandwidth</span>
              <span className="font-bold font-mono text-foreground">
                {networkInfo.downlinkSpeedMbps > 0 ? `~${networkInfo.downlinkSpeedMbps} Mbps` : 'Offline Cache'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Cross-Tab Sync</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleTestPing}
            disabled={isTestingPing}
            className="w-full h-8 text-xs font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
            {isTestingPing ? 'Measuring Real Latency...' : 'Test Real-Time Network Ping'}
          </Button>
        </div>

        {/* Body Options */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Data Saver Mode Toggle */}
          <div className="p-3 rounded-2xl border border-border bg-muted/30 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-foreground">Adaptive Data Saver</h4>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Optimizes video feeds and compresses audio payloads for weak 3G/4G cellular networks.
              </p>
            </div>
            <Button
              size="sm"
              variant={dataSaver ? 'default' : 'outline'}
              onClick={handleToggleDataSaver}
              className={`h-7 px-3 text-xs font-bold rounded-xl ${
                dataSaver
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'border-border text-foreground'
              }`}
            >
              {dataSaver ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {/* Cross-Network Background Sync Queue / Outbox */}
          <div className="p-3 rounded-2xl border border-border bg-muted/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-foreground">Offline Outbox & Sync Queue</h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {queue.filter((q) => q.status === 'pending').length} pending
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Messages and actions generated while offline or switching networks are securely cached and auto-dispatched upon reconnect.
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFlushQueue}
              disabled={isSyncing}
              className="w-full h-8 text-xs font-bold border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-xl gap-1.5"
            >
              <Send className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Synchronizing...' : 'Flush & Force Sync Now'}
            </Button>
          </div>

          {/* Zero-Connectivity Flight Mode Cache */}
          <div className="p-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-foreground">Flight Mode Video Cache & Quality Tiers</h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                480p • 720p • 1080p
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Save short videos locally in IndexedDB to watch smoothly during airplane flights. Select 480p Data Saver (~3.2MB/vid, -78% storage) to save phone storage or 720p/1080p for crisp playback.
            </p>
          </div>

          {/* Network Condition Simulator (To test resilience across all networks) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-muted-foreground" /> Network Condition Simulator
              </span>
              <span className="text-[10px] text-muted-foreground">Test across all speeds</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'auto', label: 'Auto Detect', icon: '🌐' },
                { id: 'wifi', label: 'Wi-Fi Fiber', icon: '📶' },
                { id: '5g', label: '5G Ultra', icon: '⚡' },
                { id: '4g', label: '4G LTE', icon: '📱' },
                { id: '3g', label: '3G Rural', icon: '🐢' },
                { id: 'offline', label: 'Offline Mode', icon: '📦' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSetSimulated(item.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                    simulatedMode === item.id
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/80 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Universal Network Resilience Active
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
