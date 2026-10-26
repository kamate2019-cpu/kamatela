/**
 * KAMATELA Super App - Offline Storage & Local Caching Engine
 * High-performance IndexedDB + localStorage storage for:
 * 1. Offline chat messages, voice notes, song snippets, and call recording memos
 * 2. Downloaded AI music tracks with synthesis presets & offline audio buffers
 * 3. Network status listener (Online/Offline) and storage quota metrics
 */

import type { ChatConversation, AIMusicTrack, ChatMessage, VideoItem, VideoDownloadQuality, VideoQualityOption } from '@/types/kamatela';

const DB_NAME = 'kamatela_offline_db';
const DB_VERSION = 2;
const STORE_CHATS = 'offline_chats';
const STORE_TRACKS = 'downloaded_tracks';
const STORE_AUDIO = 'offline_audio_blobs';
const STORE_VIDEOS = 'offline_flight_videos';

const LOCAL_STORAGE_CHATS_KEY = 'kamatela_cached_chats_v1';
const LOCAL_STORAGE_TRACKS_KEY = 'kamatela_cached_tracks_v1';
const LOCAL_STORAGE_VIDEOS_KEY = 'kamatela_cached_flight_videos_v1';
const LOCAL_STORAGE_VIDEO_QUALITY_KEY = 'kamatela_video_download_quality_pref_v1';

export const VIDEO_QUALITY_OPTIONS: Record<VideoDownloadQuality, VideoQualityOption> = {
  '480p': {
    tier: '480p',
    label: 'Standard',
    badge: '480p',
    resolution: '854 × 480',
    estimatedMb: '3.2 MB',
    estimatedBytes: 3355443, // ~3.2MB
    savingsVsUltra: '78% smaller',
    recommendedFor: 'Best for saving device storage space and fast downloads',
  },
  '720p': {
    tier: '720p',
    label: 'High',
    badge: '720p',
    resolution: '1280 × 720',
    estimatedMb: '7.5 MB',
    estimatedBytes: 7864320, // ~7.5MB
    savingsVsUltra: '50% smaller',
    recommendedFor: 'Balanced HD quality and storage efficiency (Recommended)',
  },
  '1080p': {
    tier: '1080p',
    label: 'Ultra Crisp',
    badge: '1080p',
    resolution: '1920 × 1080',
    estimatedMb: '15.0 MB',
    estimatedBytes: 15728640, // ~15.0MB
    savingsVsUltra: 'Full resolution',
    recommendedFor: 'Crispest mobile display, uses more storage space',
  },
};

class OfflineStorageEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_CHATS)) {
            db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_TRACKS)) {
            db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_AUDIO)) {
            db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
            db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[OfflineStorage] IndexedDB open failed, falling back to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('[OfflineStorage] IndexedDB not available', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // -------------------------------------------------------------
  // CHAT CONVERSATIONS CACHING
  // -------------------------------------------------------------

  public async saveChats(chats: ChatConversation[]): Promise<void> {
    const stampedChats = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((m) => ({
        ...m,
        isOfflineCached: true,
      })),
      lastCachedAt: new Date().toISOString(),
    }));

    // 1. Save to localStorage for immediate synchronous fallback
    try {
      localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(stampedChats));
    } catch (err) {
      console.warn('[OfflineStorage] localStorage chats quota reached', err);
    }

    // 2. Persist to IndexedDB for unlimited capacity
    const db = await this.initDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_CHATS], 'readwrite');
        const store = tx.objectStore(STORE_CHATS);

        stampedChats.forEach((c) => {
          store.put(c);
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async loadCachedChats(): Promise<ChatConversation[] | null> {
    // Try IndexedDB first
    const db = await this.initDB();
    if (db) {
      try {
        const chats = await new Promise<ChatConversation[]>((resolve, reject) => {
          const tx = db.transaction([STORE_CHATS], 'readonly');
          const store = tx.objectStore(STORE_CHATS);
          const req = store.getAll();

          req.onsuccess = () => resolve(req.result as ChatConversation[]);
          req.onerror = () => reject(req.error);
        });

        if (chats && chats.length > 0) {
          return chats;
        }
      } catch (err) {
        console.warn('[OfflineStorage] Failed loading from IndexedDB, trying localStorage', err);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    return null;
  }

  // -------------------------------------------------------------
  // DOWNLOADED MUSIC TRACKS & AUDIO BLOBS
  // -------------------------------------------------------------

  public async downloadTrackForOffline(track: AIMusicTrack): Promise<AIMusicTrack> {
    const offlineTrack: AIMusicTrack = {
      ...track,
      isDownloaded: true,
      offlineCachedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      fileSizeBytes: track.fileSizeBytes || Math.floor(track.durationSeconds * 44100 * 2 * 0.15) || 2850000,
    };

    // Save metadata to localStorage list
    try {
      const existing = this.getCachedDownloadedTracksSync();
      const updated = [offlineTrack, ...existing.filter((t) => t.id !== track.id)];
      localStorage.setItem(LOCAL_STORAGE_TRACKS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[OfflineStorage] Failed to update localStorage tracks', err);
    }

    // Save to IndexedDB
    const db = await this.initDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction([STORE_TRACKS], 'readwrite');
          const store = tx.objectStore(STORE_TRACKS);
          store.put(offlineTrack);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    return offlineTrack;
  }

  public async removeDownloadedTrack(trackId: string): Promise<void> {
    // 1. Remove from localStorage
    try {
      const existing = this.getCachedDownloadedTracksSync();
      const updated = existing.filter((t) => t.id !== trackId);
      localStorage.setItem(LOCAL_STORAGE_TRACKS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[OfflineStorage] Failed to remove track from localStorage', err);
    }

    // 2. Remove from IndexedDB
    const db = await this.initDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction([STORE_TRACKS, STORE_AUDIO], 'readwrite');
          tx.objectStore(STORE_TRACKS).delete(trackId);
          tx.objectStore(STORE_AUDIO).delete(trackId);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  public getCachedDownloadedTracksSync(): AIMusicTrack[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_TRACKS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public async loadDownloadedTracks(): Promise<AIMusicTrack[]> {
    const db = await this.initDB();
    if (db) {
      try {
        const tracks = await new Promise<AIMusicTrack[]>((resolve, reject) => {
          const tx = db.transaction([STORE_TRACKS], 'readonly');
          const store = tx.objectStore(STORE_TRACKS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as AIMusicTrack[]);
          req.onerror = () => reject(req.error);
        });

        if (tracks && tracks.length > 0) {
          return tracks;
        }
      } catch {
        // fallback
      }
    }

    return this.getCachedDownloadedTracksSync();
  }

  public isTrackDownloaded(trackId: string): boolean {
    const list = this.getCachedDownloadedTracksSync();
    return list.some((t) => t.id === trackId && t.isDownloaded);
  }

  // -------------------------------------------------------------
  // AUDIO BLOB CACHE FOR VOICE MEMOS & NOTES
  // -------------------------------------------------------------

  public async cacheAudioDataUrl(audioId: string, dataUrl: string): Promise<void> {
    const db = await this.initDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_AUDIO], 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        store.put({ id: audioId, dataUrl, cachedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  public async getCachedAudioDataUrl(audioId: string): Promise<string | null> {
    const db = await this.initDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([STORE_AUDIO], 'readonly');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.get(audioId);
        req.onsuccess = () => {
          if (req.result && req.result.dataUrl) {
            resolve(req.result.dataUrl);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // -------------------------------------------------------------
  // SHORT-FORM VIDEO FLIGHT MODE CACHE WITH QUALITY TIERS
  // -------------------------------------------------------------

  public getDefaultQualityPreference(): VideoDownloadQuality {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VIDEO_QUALITY_KEY);
      if (saved === '480p' || saved === '720p' || saved === '1080p') {
        return saved;
      }
    } catch {
      // ignore
    }
    return '720p'; // Default balanced HD
  }

  public setDefaultQualityPreference(quality: VideoDownloadQuality): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_VIDEO_QUALITY_KEY, quality);
    } catch (e) {
      console.warn('Failed to save video quality preference', e);
    }
  }

  public async downloadVideoForFlight(
    video: VideoItem,
    quality?: VideoDownloadQuality
  ): Promise<VideoItem> {
    const selectedQuality = quality || this.getDefaultQualityPreference();
    const qualityConfig = VIDEO_QUALITY_OPTIONS[selectedQuality];

    const offlineVideo: VideoItem = {
      ...video,
      isDownloadedForFlight: true,
      downloadQuality: selectedQuality,
      offlineCachedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      fileSizeBytes: qualityConfig.estimatedBytes,
    };

    // Save to localStorage
    try {
      const existing = this.getCachedVideosSync();
      const updated = [offlineVideo, ...existing.filter((v) => v.id !== video.id)];
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[OfflineStorage] Failed to update localStorage flight videos', err);
    }

    // Save to IndexedDB
    const db = await this.initDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction([STORE_VIDEOS], 'readwrite');
          const store = tx.objectStore(STORE_VIDEOS);
          store.put(offlineVideo);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    return offlineVideo;
  }

  public async removeDownloadedVideo(videoId: string): Promise<void> {
    // 1. Remove from localStorage
    try {
      const existing = this.getCachedVideosSync();
      const updated = existing.filter((v) => v.id !== videoId);
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[OfflineStorage] Failed to remove flight video from localStorage', err);
    }

    // 2. Remove from IndexedDB
    const db = await this.initDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction([STORE_VIDEOS], 'readwrite');
          tx.objectStore(STORE_VIDEOS).delete(videoId);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  public getCachedVideosSync(): VideoItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  public async loadCachedVideos(): Promise<VideoItem[]> {
    const db = await this.initDB();
    if (db) {
      try {
        const videos = await new Promise<VideoItem[]>((resolve, reject) => {
          const tx = db.transaction([STORE_VIDEOS], 'readonly');
          const store = tx.objectStore(STORE_VIDEOS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as VideoItem[]);
          req.onerror = () => reject(req.error);
        });

        if (videos && videos.length > 0) return videos;
      } catch {
        // fallback
      }
    }
    return this.getCachedVideosSync();
  }

  public async clearAllFlightVideos(): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_STORAGE_VIDEOS_KEY);
    } catch (e) {
      console.warn(e);
    }

    const db = await this.initDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction([STORE_VIDEOS], 'readwrite');
          tx.objectStore(STORE_VIDEOS).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  }

  // -------------------------------------------------------------
  // METRICS & STORAGE MANAGEMENT
  // -------------------------------------------------------------

  public async getStorageMetrics(): Promise<{
    chatCount: number;
    messageCount: number;
    trackCount: number;
    videoCount: number;
    estimatedMb: string;
    lastSynced: string;
  }> {
    const chats = (await this.loadCachedChats()) || [];
    const tracks = await this.loadDownloadedTracks();
    const videos = await this.loadCachedVideos();

    let totalMsgs = 0;
    chats.forEach((c) => {
      totalMsgs += c.messages.length;
    });

    const totalTrackBytes = tracks.reduce(
      (acc, t) => acc + (t.fileSizeBytes || 2500000),
      0
    );
    const totalVideoBytes = videos.reduce(
      (acc, v) => acc + (v.fileSizeBytes || 8500000),
      0
    );
    const estimatedBytes = totalTrackBytes + totalVideoBytes + totalMsgs * 1200 + 40000;
    const mb = (estimatedBytes / (1024 * 1024)).toFixed(1);

    return {
      chatCount: chats.length,
      messageCount: totalMsgs,
      trackCount: tracks.length,
      videoCount: videos.length,
      estimatedMb: `${mb} MB`,
      lastSynced: 'Just now',
    };
  }

  public async clearAllCache(): Promise<void> {
    try {
      localStorage.removeItem(LOCAL_STORAGE_CHATS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TRACKS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_VIDEOS_KEY);
    } catch {
      // ignore
    }

    const db = await this.initDB();
    if (db) {
      const tx = db.transaction([STORE_CHATS, STORE_TRACKS, STORE_AUDIO, STORE_VIDEOS], 'readwrite');
      tx.objectStore(STORE_CHATS).clear();
      tx.objectStore(STORE_TRACKS).clear();
      tx.objectStore(STORE_AUDIO).clear();
      tx.objectStore(STORE_VIDEOS).clear();
      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
  }
}

export const offlineStorage = new OfflineStorageEngine();
