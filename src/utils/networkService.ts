// Multi-Network Resilience & Session Continuity Service for KAMATELA
// Supports Wi-Fi, 5G, 4G, 3G, 2G, roaming, offline mode, and cross-tab BroadcastChannel

export type NetworkType = 'wifi' | '5g' | '4g' | '3g' | '2g' | 'offline';

export interface NetworkInfo {
  isOnline: boolean;
  type: NetworkType;
  effectiveType: string;
  latencyMs: number;
  downlinkSpeedMbps: number;
  dataSaver: boolean;
  simulatedMode?: NetworkType | 'auto';
}

export interface SyncQueueItem {
  id: string;
  type: 'message' | 'profile_update' | 'topup' | 'video_draft';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced';
}

const STORAGE_KEYS = {
  DATA_SAVER: 'kamatela_data_saver',
  SYNC_QUEUE: 'kamatela_sync_queue',
  SIMULATED_NETWORK: 'kamatela_simulated_network',
};

// Singleton cross-tab BroadcastChannel
let ssoBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    ssoBroadcastChannel = new BroadcastChannel('kamatela_sso_network_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

export const networkService = {
  /**
   * Broadcast session or identity update to all other open tabs/windows
   */
  broadcastSessionEvent(event: { type: 'ACCOUNT_SWITCH' | 'LOGOUT' | 'LOGIN' | 'BALANCE_UPDATE'; data?: any }) {
    if (ssoBroadcastChannel) {
      try {
        ssoBroadcastChannel.postMessage(event);
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }
  },

  /**
   * Listen to cross-tab session events
   */
  onBroadcastSessionEvent(callback: (event: { type: string; data?: any }) => void): () => void {
    if (!ssoBroadcastChannel) return () => {};

    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        callback(e.data);
      }
    };

    ssoBroadcastChannel.addEventListener('message', handler);
    return () => {
      ssoBroadcastChannel?.removeEventListener('message', handler);
    };
  },

  /**
   * Detect current network state and interface
   */
  getNetworkInfo(): NetworkInfo {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const sim = this.getSimulatedNetwork();

    if (sim && sim !== 'auto') {
      return {
        isOnline: sim !== 'offline',
        type: sim,
        effectiveType: sim === 'offline' ? 'none' : sim,
        latencyMs: sim === '5g' ? 22 : sim === 'wifi' ? 35 : sim === '4g' ? 68 : sim === '3g' ? 240 : 999,
        downlinkSpeedMbps: sim === '5g' ? 120 : sim === 'wifi' ? 85 : sim === '4g' ? 32 : sim === '3g' ? 1.8 : 0,
        dataSaver: this.isDataSaverEnabled(),
        simulatedMode: sim,
      };
    }

    if (!isOnline) {
      return {
        isOnline: false,
        type: 'offline',
        effectiveType: 'none',
        latencyMs: 999,
        downlinkSpeedMbps: 0,
        dataSaver: this.isDataSaverEnabled(),
        simulatedMode: 'auto',
      };
    }

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    let netType: NetworkType = 'wifi';
    let effective = '4g';
    let downlink = 25;

    if (conn) {
      effective = conn.effectiveType || '4g';
      downlink = conn.downlink || 20;

      if (conn.type === 'cellular') {
        if (effective === '5g' || downlink > 50) netType = '5g';
        else if (effective === '4g') netType = '4g';
        else if (effective === '3g') netType = '3g';
        else netType = '2g';
      } else if (conn.type === 'wifi') {
        netType = 'wifi';
      } else {
        netType = effective === '3g' ? '3g' : effective === '2g' ? '2g' : 'wifi';
      }
    }

    return {
      isOnline: true,
      type: netType,
      effectiveType: effective,
      latencyMs: conn?.rtt || 45,
      downlinkSpeedMbps: downlink,
      dataSaver: this.isDataSaverEnabled(),
      simulatedMode: 'auto',
    };
  },

  /**
   * Ping test to check real-time network response
   */
  async testLatency(): Promise<number> {
    const start = Date.now();
    try {
      // Use favicon or lightweight asset to measure actual round-trip latency
      await fetch('/icons/icon-192.svg?_t=' + start, {
        method: 'HEAD',
        cache: 'no-store',
      });
      return Math.max(12, Date.now() - start);
    } catch {
      // If offline
      return navigator.onLine ? 85 : 999;
    }
  },

  /**
   * Data Saver Mode preferences
   */
  isDataSaverEnabled(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.DATA_SAVER) === 'true';
    } catch {
      return false;
    }
  },

  setDataSaverEnabled(enabled: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA_SAVER, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Simulated network settings (for testing resilience across all networks)
   */
  getSimulatedNetwork(): NetworkType | 'auto' {
    try {
      return (localStorage.getItem(STORAGE_KEYS.SIMULATED_NETWORK) as any) || 'auto';
    } catch {
      return 'auto';
    }
  },

  setSimulatedNetwork(mode: NetworkType | 'auto') {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATED_NETWORK, mode);
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Cross-Network Sync Queue (Outbox)
   */
  getSyncQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status'>): SyncQueueItem {
    const newItem: SyncQueueItem = {
      ...item,
      id: 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      status: 'pending',
    };
    const queue = this.getSyncQueue();
    queue.push(newItem);
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn(e);
    }
    return newItem;
  },

  clearSyncedQueue() {
    try {
      const remaining = this.getSyncQueue().filter((item) => item.status === 'pending');
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * Flush and process all queued items
   */
  async flushSyncQueue(
    onProcessed?: (item: SyncQueueItem) => void
  ): Promise<{ processed: number; remaining: number }> {
    const queue = this.getSyncQueue();
    const pending = queue.filter((i) => i.status === 'pending');

    if (pending.length === 0) {
      return { processed: 0, remaining: 0 };
    }

    // Process each queued item
    for (const item of pending) {
      item.status = 'synced';
      if (onProcessed) {
        onProcessed(item);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn(e);
    }

    return { processed: pending.length, remaining: 0 };
  },
};
