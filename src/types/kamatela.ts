export type TabType = 'feed' | 'chats' | 'studio' | 'business' | 'profile';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  coins?: number;
  isBusiness: boolean;
  businessName?: string;
  businessCategory?: string;
  businessRating?: number;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  businessHours?: string;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  likesCount: number;
}

export interface VirtualGift {
  id: string;
  name: string;
  coins: number;
  icon: string;
  color: string;
  animationType: 'rose' | 'coffee' | 'mic' | 'lion' | 'car' | 'crown';
}

export interface GiftEvent {
  id: string;
  sender: User;
  recipient: User;
  gift: VirtualGift;
  timestamp: string;
}

export interface VideoComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export type VideoDownloadQuality = '480p' | '720p' | '1080p';

export interface VideoQualityOption {
  tier: VideoDownloadQuality;
  label: string;
  badge: string;
  resolution: string;
  estimatedMb: string;
  estimatedBytes: number;
  savingsVsUltra: string;
  recommendedFor: string;
}

export interface VideoItem {
  id: string;
  creator: User;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  tags: string[];
  musicTitle: string;
  musicAuthor: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isDownloadedForFlight?: boolean;
  offlineCachedAt?: string;
  fileSizeBytes?: number;
  downloadQuality?: VideoDownloadQuality;
  comments: VideoComment[];
  linkedProduct?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    imageUrl: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'product' | 'song' | 'call_memo';
  isOfflineCached?: boolean;
  callMemoSnippet?: {
    partnerName: string;
    callType: 'voice' | 'video';
    durationSeconds: number;
    audioUrl?: string;
    recordedAt: string;
  };
  productSnippet?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
  songSnippet?: {
    id: string;
    title: string;
    genre: string;
    coverUrl: string;
    duration: string;
  };
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group' | 'business';
  participant: User;
  groupName?: string;
  groupMembers?: User[];
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isPinned?: boolean;
  messages: ChatMessage[];
}

export interface UserStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  isViewed?: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'gift_sent' | 'gift_received' | 'game_reward';
  title: string;
  channel?: 'M-Pesa' | 'MTN MoMo' | 'Orange Money' | 'Card' | 'In-App Game' | 'Live Voice Room' | string;
  amountUsd?: number;
  coins: number;
  timestamp: string;
  referenceId: string;
  status: 'completed' | 'pending';
}

export interface CallLog {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  type: 'voice' | 'video';
  direction: 'outgoing' | 'incoming';
  status: 'completed' | 'missed' | 'declined';
  durationSeconds: number;
  timestamp: string;
}

export interface VoiceRoomParticipant {
  user: User;
  role: 'host' | 'speaker' | 'listener';
  isSpeaking: boolean;
  isMuted: boolean;
  raisedHand: boolean;
  joinedAt: string;
}

export interface VoiceRoom {
  id: string;
  title: string;
  description: string;
  topic: string;
  host: User;
  participants: VoiceRoomParticipant[];
  isLive: boolean;
  createdAt: string;
}

export interface LiveComment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  isHost?: boolean;
}

export interface LiveStreamCoHost {
  user: User;
  isMuted?: boolean;
  isCameraOff?: boolean;
  videoUrl?: string;
  joinedAt?: number;
}

export interface LiveStreamItem {
  id: string;
  title: string;
  host: User;
  viewerCount: number;
  category: 'Music' | 'Tech' | 'Gaming' | 'Shopping' | 'Talk' | 'Lifestyle';
  videoUrl?: string;
  thumbnailUrl: string;
  isLive: boolean;
  linkedProduct?: BusinessProduct;
  startedAt: string;
  tags?: string[];
  likesCount?: number;
  coHost?: LiveStreamCoHost | null;
  pendingCoHostRequests?: Array<{ user: User; requestedAt: number }>;
}

export interface AIMusicTrack {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  mood: string;
  isInstrumental: boolean;
  vocalStyle?: 'female_afropop' | 'male_soul' | 'autotune_trap' | 'acoustic' | 'choir' | 'instrumental';
  lyrics?: string;
  audioUrl?: string;
  coverUrl: string;
  durationSeconds: number;
  createdAt: string;
  creator: User;
  playsCount: number;
  likesCount: number;
  isLiked?: boolean;
  isDownloaded?: boolean;
  offlineCachedAt?: string;
  fileSizeBytes?: number;
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  features?: string[];
}

export interface BusinessInquiry {
  id: string;
  businessId: string;
  productId?: string;
  productName?: string;
  userName: string;
  userPhone: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied' | 'completed';
}
