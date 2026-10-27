import { useState, useEffect } from 'react';
import { offlineStorage } from '@/utils/offlineStorage';
import { networkService } from '@/utils/networkService';
import type {
  User,
  VideoItem,
  ChatConversation,
  UserStory,
  BusinessProduct,
  BusinessInquiry,
  ChatMessage,
  VideoComment,
  CallLog,
  VoiceRoom,
  VoiceRoomParticipant,
  AIMusicTrack,
  WalletTransaction,
  VideoDownloadQuality,
  LiveStreamItem,
  LiveComment
} from '@/types/kamatela';

export const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx_101',
    type: 'topup',
    title: 'M-Pesa Express Deposit',
    channel: 'M-Pesa',
    amountUsd: 5.0,
    coins: 500,
    timestamp: 'Today, 10:14 AM',
    referenceId: 'MPESA-8942A90',
    status: 'completed',
  },
  {
    id: 'tx_102',
    type: 'game_reward',
    title: 'Trivia Stage Champion Prize',
    channel: 'In-App Game',
    coins: 100,
    timestamp: 'Yesterday, 8:45 PM',
    referenceId: 'GAME-TRIVIA-481',
    status: 'completed',
  },
  {
    id: 'tx_103',
    type: 'topup',
    title: 'MTN Mobile Money Top-Up',
    channel: 'MTN MoMo',
    amountUsd: 2.0,
    coins: 200,
    timestamp: '2 days ago',
    referenceId: 'MOMO-7721X09',
    status: 'completed',
  },
  {
    id: 'tx_104',
    type: 'gift_sent',
    title: 'Tipped Safari Lion Gift',
    channel: 'Live Voice Room',
    coins: -200,
    timestamp: '3 days ago',
    referenceId: 'GIFT-VOICEROOM-902',
    status: 'completed',
  },
];

// Current active authenticated user
export const currentUser: User = {
  id: 'user_me',
  name: 'Alex Kamate',
  handle: '@kamate_alex',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Creator & Tech Entrepreneur 🚀 Building modern digital solutions & superapps. DM for collabs.',
  coins: 500,
  isBusiness: true,
  businessName: 'Kamate Global Solutions',
  businessCategory: 'Digital Media & SuperApp',
  businessRating: 4.95,
  businessPhone: '+1 (555) 438-9201',
  businessEmail: 'kamate2019@gmail.com',
  businessAddress: '742 SuperApp Plaza, San Francisco, CA',
  businessHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  verified: true,
  followersCount: 14200,
  followingCount: 380,
  likesCount: 89400,
};

// Mock other users
export const mockUsers: Record<string, User> = {
  kamatela_official: {
    id: 'user_official',
    name: 'KAMATELA Official',
    handle: '@kamatela',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'Official KAMATELA messaging and system verification account.',
    coins: 10000,
    isBusiness: true,
    businessName: 'KAMATELA Security & System',
    businessCategory: 'Official Platform',
    businessRating: 5.0,
    businessPhone: '+225 07 00 12 34',
    businessEmail: 'support@kamatela.com',
    businessAddress: 'KAMATELA Global Hub',
    businessHours: '24/7 Official Support',
    verified: true,
    followersCount: 500000,
    followingCount: 1,
    likesCount: 2000000,
  },
  mamadou: {
    id: 'user_mamadou',
    name: 'Mamadou Diallo',
    handle: '@mamadou_d',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Digital Creator & Entrepreneur 🚀 Building in West Africa.',
    coins: 850,
    isBusiness: false,
    verified: true,
    businessPhone: '+224 622 11 22 33',
    followersCount: 34200,
    followingCount: 180,
    likesCount: 140000,
  },
  fatoumata: {
    id: 'user_fatoumata',
    name: 'Fatoumata Traore',
    handle: '@fatou_t',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Fashion designer & media creator 🎨',
    coins: 600,
    isBusiness: true,
    businessName: 'Atelier Fatou Créations',
    businessCategory: 'Apparel & Design',
    businessRating: 4.95,
    businessPhone: '+223 76 54 32 10',
    businessEmail: 'contact@atelierfatou.com',
    businessAddress: 'Bamako, Mali',
    businessHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    verified: true,
    followersCount: 42000,
    followingCount: 220,
    likesCount: 310000,
  },
  sophia: {
    id: 'user_sophia',
    name: 'Sophia Chen',
    handle: '@sophiachen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Tech reviewer & digital nomad 📸 Exploring modern gadgets.',
    coins: 750,
    isBusiness: false,
    verified: true,
    followersCount: 89300,
    followingCount: 210,
    likesCount: 520000,
  },
  zara: {
    id: 'user_zara',
    name: 'Luxe Audio Labs',
    handle: '@luxeaudio',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
    bio: 'Premium acoustic headphones, wireless studio monitors & sound systems.',
    coins: 1400,
    isBusiness: true,
    businessName: 'Luxe Audio Labs',
    businessCategory: 'Consumer Electronics',
    businessRating: 4.95,
    businessPhone: '+1 (800) 555-LUXE',
    businessEmail: 'support@luxeaudio.com',
    businessAddress: '100 Hi-Fi Way, Austin, TX',
    businessHours: '24/7 Online Support',
    verified: true,
    followersCount: 45000,
    followingCount: 45,
    likesCount: 320000,
  },
  marcus: {
    id: 'user_marcus',
    name: 'Chef Marcus',
    handle: '@marcus_cooks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Fast 15-min street fusion gourmet recipes 🌮 Culinary tips & sauces.',
    coins: 920,
    isBusiness: true,
    businessName: 'Marcus Artisanal Sauces',
    businessCategory: 'Food & Beverage',
    businessRating: 4.88,
    businessPhone: '+1 (555) 782-9912',
    businessEmail: 'orders@marcussauces.com',
    businessAddress: '42 Culinary Lane, Brooklyn, NY',
    businessHours: 'Mon - Fri: 8:00 AM - 6:00 PM',
    verified: true,
    followersCount: 120500,
    followingCount: 190,
    likesCount: 940000,
  },
  elena: {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: '@elenamodes',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Sustainable minimalist fashion & eco-threads designer 🌿',
    coins: 1100,
    isBusiness: true,
    businessName: 'EcoThreads Atelier',
    businessCategory: 'Apparel & Eco Wear',
    businessRating: 4.92,
    businessPhone: '+1 (555) 231-8844',
    businessEmail: 'hello@ecothreads.co',
    businessAddress: '18 Green Market Blvd, Seattle, WA',
    businessHours: 'Tue - Sun: 10:00 AM - 7:00 PM',
    verified: true,
    followersCount: 78000,
    followingCount: 320,
    likesCount: 410000,
  }
};

export const initialVideos: VideoItem[] = [
  {
    id: 'vid_1',
    creator: mockUsers.zara,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    caption: 'Experience pure spatial audio. Our new Titanium Wireless Studio Pro headphones are now live in the catalog! 🎧✨ Tap the product link below to order directly via chat.',
    tags: ['#LuxeAudio', '#Headphones', '#TechTrends', '#KAMATELA'],
    musicTitle: 'Sonic Horizons - Original Audio',
    musicAuthor: 'Luxe Sound Lab',
    likesCount: 18400,
    commentsCount: 342,
    sharesCount: 1280,
    isLiked: false,
    isSaved: false,
    linkedProduct: {
      id: 'prod_1',
      title: 'Titanium ANC Wireless Studio Pro',
      price: 249,
      currency: '$',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    },
    comments: [
      {
        id: 'c1',
        userId: 'user_sophia',
        userName: 'Sophia Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'The noise cancellation on these is legendary! Best audio purchase this year.',
        timestamp: '2h ago',
        likes: 42,
      },
      {
        id: 'c2',
        userId: 'user_marcus',
        userName: 'Chef Marcus',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        text: 'Sent an inquiry through your WhatsApp button. Looking for wholesale bundles!',
        timestamp: '45m ago',
        likes: 15,
      }
    ],
  },
  {
    id: 'vid_2',
    creator: mockUsers.elena,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    caption: 'Handcrafted Japanese organic cotton oversize trench coat. Breathable, storm-proof & stylish 🌿 Drop a message to get personalized sizing advice!',
    tags: ['#SustainableFashion', '#OOTD', '#MinimalStyle', '#EcoFriendly'],
    musicTitle: 'Lo-Fi Autumn Walk',
    musicAuthor: 'Chillhop Beats',
    likesCount: 24900,
    commentsCount: 512,
    sharesCount: 3410,
    isLiked: true,
    isSaved: true,
    linkedProduct: {
      id: 'prod_3',
      title: 'Organic Cotton Minimalist Trench',
      price: 189,
      currency: '$',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    },
    comments: [
      {
        id: 'c3',
        userId: 'user_me',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Love the drape and texture! Does it ship worldwide?',
        timestamp: '3h ago',
        likes: 8,
      }
    ]
  },
  {
    id: 'vid_3',
    creator: mockUsers.marcus,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    caption: 'Secret 5-ingredient smoky chipotle truffle glaze on grilled ribs 🔥 Available in our 3-pack gourmet bottle gift set!',
    tags: ['#Foodie', '#CookingHacks', '#BBQSeason', '#ChefLife'],
    musicTitle: 'Sizzle & Spice Fiesta',
    musicAuthor: 'Latin Beats',
    likesCount: 41200,
    commentsCount: 890,
    sharesCount: 7600,
    isLiked: false,
    isSaved: false,
    linkedProduct: {
      id: 'prod_5',
      title: 'Artisanal Smoky Truffle Glaze 3-Pack',
      price: 34,
      currency: '$',
      imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop&q=80',
    },
    comments: [
      {
        id: 'c4',
        userId: 'user_sophia',
        userName: 'Sophia Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'Making this tonight! My mouth is watering just watching this!',
        timestamp: '1h ago',
        likes: 31,
      }
    ]
  }
];

export const initialChats: ChatConversation[] = [
  {
    id: 'chat_official',
    type: 'business',
    participant: mockUsers.kamatela_official,
    lastMessage: 'Welcome to KAMATELA WhatsApp! Your account is verified. Tap here to start chatting securely.',
    lastTimestamp: '10:42 AM',
    unreadCount: 1,
    isPinned: true,
    messages: [
      {
        id: 'm1',
        senderId: 'user_official',
        text: 'Welcome to KAMATELA WhatsApp! Messages and calls are end-to-end encrypted. No one outside of this chat, not even KAMATELA, can read or listen to them.',
        timestamp: '10:40 AM',
        status: 'read',
      },
      {
        id: 'm2',
        senderId: 'user_official',
        text: 'Welcome to KAMATELA WhatsApp! Your account is verified. Tap here to start chatting securely.',
        timestamp: '10:42 AM',
        status: 'delivered',
      }
    ]
  },
  {
    id: 'chat_mamadou',
    type: 'direct',
    participant: mockUsers.mamadou,
    lastMessage: 'Hey! Glad to see you on KAMATELA WhatsApp. Everything is running smoothly now!',
    lastTimestamp: '9:15 AM',
    unreadCount: 0,
    isPinned: true,
    messages: [
      {
        id: 'm3',
        senderId: 'user_mamadou',
        text: 'Hey! Are we testing the new video live streaming today?',
        timestamp: 'Yesterday 8:00 PM',
        status: 'read',
      },
      {
        id: 'm4',
        senderId: 'user_me',
        text: 'Yes! The camera and live co-hosting are ready. Let us test now.',
        timestamp: 'Yesterday 8:14 PM',
        status: 'read',
      },
      {
        id: 'm5',
        senderId: 'user_mamadou',
        text: 'Hey! Glad to see you on KAMATELA WhatsApp. Everything is running smoothly now!',
        timestamp: '9:15 AM',
        status: 'delivered',
      }
    ]
  },
  {
    id: 'chat_fatoumata',
    type: 'business',
    participant: mockUsers.fatoumata,
    lastMessage: 'Hello! Welcome to KAMATELA. Feel free to reach out anytime.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        senderId: 'user_fatoumata',
        text: 'Hello! Welcome to KAMATELA. Feel free to reach out anytime.',
        timestamp: 'Yesterday',
        status: 'read',
      }
    ]
  }
];

export const initialStories: UserStory[] = [
  {
    id: 'story_me',
    userId: 'user_me',
    userName: 'My Status',
    userAvatar: currentUser.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    caption: 'Setting up new video gear 🎥',
    timestamp: 'Just now',
    isViewed: false,
  },
  {
    id: 'story_zara',
    userId: 'user_zara',
    userName: 'Luxe Audio',
    userAvatar: mockUsers.zara.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
    caption: 'Behind the sound engineering lab 🎛️',
    timestamp: '25m ago',
    isViewed: false,
  },
  {
    id: 'story_sophia',
    userId: 'user_sophia',
    userName: 'Sophia',
    userAvatar: mockUsers.sophia.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80',
    caption: 'Sunset vibes from the rooftop ✨',
    timestamp: '2h ago',
    isViewed: false,
  },
  {
    id: 'story_marcus',
    userId: 'user_marcus',
    userName: 'Chef Marcus',
    userAvatar: mockUsers.marcus.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    caption: 'Fresh batch of spicy glazes ready for delivery 🌶️',
    timestamp: '4h ago',
    isViewed: true,
  },
  {
    id: 'story_elena',
    userId: 'user_elena',
    userName: 'Elena',
    userAvatar: mockUsers.elena.avatar,
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80',
    caption: 'Draping sample patterns for the upcoming runway show ✂️',
    timestamp: '6h ago',
    isViewed: true,
  }
];

export const initialMusicTracks: AIMusicTrack[] = [
  {
    id: 'track_1',
    title: 'Lagos Sunset Grooves',
    prompt: 'Afrobeats banger with sunny log drum percussion, melodic saxophone, and uplifting summer vibes',
    genre: 'Afrobeats',
    mood: 'Upbeat',
    isInstrumental: false,
    vocalStyle: 'female_afropop',
    lyrics: `[Verse 1]
Walking down the island shore
Feel the heat, wanting more
Rhythm moving in my chest
Sunset glowing in the west

[Chorus]
Lagos night, we shine so bright
Dancing till the morning light
No more worries, no more pain
African golden summer rain

[Outro]
Yeah yeah, KAMATELA vibes
Feel the sound come alive`,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    durationSeconds: 154,
    createdAt: '2h ago',
    creator: mockUsers.zara,
    playsCount: 14200,
    likesCount: 3820,
    isLiked: false,
  },
  {
    id: 'track_2',
    title: 'Midnight Neon Drift',
    prompt: 'Chill Lo-Fi hip-hop study beat with warm electric piano chords, vinyl crackle, and slow boom-bap drums',
    genre: 'Lo-Fi Chill',
    mood: 'Chill',
    isInstrumental: true,
    vocalStyle: 'instrumental',
    lyrics: `[Instrumental Beat with Vinyl Textures & Warm Piano Chords]`,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    durationSeconds: 178,
    createdAt: '1d ago',
    creator: mockUsers.sophia,
    playsCount: 28900,
    likesCount: 7150,
    isLiked: true,
  },
  {
    id: 'track_3',
    title: 'Kinshasa Cyber Nights',
    prompt: 'Deep Amapiano shaker beat with heavy log drums, hypnotic keys, and energetic South African club bassline',
    genre: 'Amapiano',
    mood: 'Energetic',
    isInstrumental: false,
    vocalStyle: 'male_soul',
    lyrics: `[Verse 1]
Bass is bumping in the street
Log drums driving all the feet
Bassline speaking to the soul
Take control, reach the goal

[Chorus]
Amapiano in the air
Music healing everywhere
Kamatela, let it play
Dancing all our blues away!

[Outro]
Kinshasa to the world!`,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    durationSeconds: 165,
    createdAt: '3d ago',
    creator: mockUsers.marcus,
    playsCount: 39500,
    likesCount: 9420,
    isLiked: false,
  },
];

export const initialVoiceRooms: VoiceRoom[] = [
  {
    id: 'room_tech_africa',
    title: 'Africa Tech & Digital Creators Hub 🚀',
    description: 'Weekly open stage discussing super apps, monetizing short-form video content, and tech startups.',
    topic: 'Tech & Startups',
    host: mockUsers.zara,
    isLive: true,
    createdAt: '35m ago',
    participants: [
      {
        user: mockUsers.zara,
        role: 'host',
        isSpeaking: true,
        isMuted: false,
        raisedHand: false,
        joinedAt: '35m ago',
      },
      {
        user: mockUsers.marcus,
        role: 'speaker',
        isSpeaking: false,
        isMuted: false,
        raisedHand: false,
        joinedAt: '20m ago',
      },
      {
        user: mockUsers.sophia,
        role: 'speaker',
        isSpeaking: true,
        isMuted: false,
        raisedHand: false,
        joinedAt: '15m ago',
      },
      {
        user: mockUsers.elena,
        role: 'listener',
        isSpeaking: false,
        isMuted: true,
        raisedHand: true,
        joinedAt: '8m ago',
      },
    ],
  },
  {
    id: 'room_ecommerce_growth',
    title: 'E-Commerce Catalogs & Social Selling 📦',
    description: 'How to convert short video viewers into direct WhatsApp catalog sales and loyal repeat buyers.',
    topic: 'Business & Sales',
    host: mockUsers.elena,
    isLive: true,
    createdAt: '1h ago',
    participants: [
      {
        user: mockUsers.elena,
        role: 'host',
        isSpeaking: false,
        isMuted: false,
        raisedHand: false,
        joinedAt: '1h ago',
      },
      {
        user: mockUsers.marcus,
        role: 'speaker',
        isSpeaking: true,
        isMuted: false,
        raisedHand: false,
        joinedAt: '40m ago',
      },
    ],
  },
  {
    id: 'room_music_beats',
    title: 'Midnight Lo-Fi & Creator Jam 🎧',
    description: 'Chill live audio room with independent music producers sharing original soundtracks for videos.',
    topic: 'Music & Vibes',
    host: mockUsers.sophia,
    isLive: true,
    createdAt: '12m ago',
    participants: [
      {
        user: mockUsers.sophia,
        role: 'host',
        isSpeaking: true,
        isMuted: false,
        raisedHand: false,
        joinedAt: '12m ago',
      },
    ],
  },
];

export const initialLiveStreams: LiveStreamItem[] = [
  {
    id: 'live_stream_elena',
    title: '🎧 Live DJ Sunset Session & Suno AI Beats Jam',
    host: mockUsers.elena,
    viewerCount: 1420,
    category: 'Music',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-in-a-club-40540-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    startedAt: '42m ago',
    likesCount: 8940,
    tags: ['#Electronic', '#SunoAI', '#AfroHouse'],
  },
  {
    id: 'live_stream_zara',
    title: '🔊 Unboxing ANC Titanium Studio Pro + Live Q&A',
    host: mockUsers.zara,
    viewerCount: 890,
    category: 'Shopping',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-headphones-on-a-wooden-table-41135-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    startedAt: '18m ago',
    likesCount: 4210,
    tags: ['#Audiophile', '#TechReview', '#SpecialOffer'],
  },
  {
    id: 'live_stream_marcus',
    title: '🍳 Farm-to-Table Gourmet Cooking & Fresh Honey Drops',
    host: mockUsers.marcus,
    viewerCount: 650,
    category: 'Lifestyle',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-dish-in-a-kitchen-41586-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    startedAt: '31m ago',
    likesCount: 3120,
    tags: ['#Organic', '#CookingLive', '#FarmersMarket'],
  },
  {
    id: 'live_stream_sophia',
    title: '🚀 Building Mobile Super Apps in Africa (Live Code & Tech)',
    host: mockUsers.sophia,
    viewerCount: 1180,
    category: 'Tech',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-41486-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    startedAt: '55m ago',
    likesCount: 6540,
    tags: ['#TechTalk', '#FlutterReact', '#SiliconSavannah'],
  },
];

export const initialCallLogs: CallLog[] = [
  {
    id: 'call_1',
    partnerId: 'user_zara',
    partnerName: 'Luxe Audio Labs',
    partnerAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
    type: 'voice',
    direction: 'outgoing',
    status: 'completed',
    durationSeconds: 142,
    timestamp: 'Today, 11:20 AM',
  },
  {
    id: 'call_2',
    partnerId: 'user_sophia',
    partnerName: 'Sophia Chen',
    partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'video',
    direction: 'incoming',
    status: 'completed',
    durationSeconds: 310,
    timestamp: 'Yesterday, 4:45 PM',
  },
  {
    id: 'call_3',
    partnerId: 'user_elena',
    partnerName: 'Elena Rostova',
    partnerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    type: 'voice',
    direction: 'incoming',
    status: 'missed',
    durationSeconds: 0,
    timestamp: 'Oct 24, 7:15 PM',
  }
];

export const initialProducts: BusinessProduct[] = [
  {
    id: 'prod_1',
    businessId: 'user_zara',
    title: 'Titanium ANC Wireless Studio Pro',
    description: 'Flagship audiophile active noise cancelling headphones with custom 40mm planar magnetic drivers and 65-hour battery life.',
    price: 249,
    currency: '$',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['Active Noise Cancellation', '65hr Battery Life', 'Lossless Audio LDAC', 'Multipoint Connection']
  },
  {
    id: 'prod_2',
    businessId: 'user_zara',
    title: 'Acoustic Pulse Portable Waterproof Speaker',
    description: '360-degree immersive bass, IP67 waterproof & dustproof, built for outdoor adventures and studio playback.',
    price: 119,
    currency: '$',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['IP67 Waterproof', '24hr Playtime', 'TWS Pairing', 'Bass Radiators']
  },
  {
    id: 'prod_3',
    businessId: 'user_elena',
    title: 'Organic Cotton Minimalist Trench',
    description: 'Double-breasted storm-resistant trench coat crafted from 100% GOTS certified organic Japanese cotton.',
    price: 189,
    currency: '$',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['100% Organic Cotton', 'Water-repellent finish', 'Tailored fit', 'Eco dyes']
  },
  {
    id: 'prod_4',
    businessId: 'user_elena',
    title: 'Eco-Knit Cashmere Mockneck Sweater',
    description: 'Ultra-soft recycled cashmere yarn, ribbed cuffs, timeless silhouette designed for effortless layering.',
    price: 145,
    currency: '$',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['Recycled Cashmere', 'Zero-waste knitting', 'Thermal comfort', 'Breathable']
  },
  {
    id: 'prod_5',
    businessId: 'user_marcus',
    title: 'Artisanal Smoky Truffle Glaze 3-Pack',
    description: 'Crafted in small batches with black winter truffle, smoked chipotle peppers and aged Modena balsamic.',
    price: 34,
    currency: '$',
    category: 'Gourmet Food',
    imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['Real Black Truffle', 'No preservatives', 'Vegan & Gluten-free', 'Chef Recipe Included']
  },
  {
    id: 'prod_6',
    businessId: 'user_me',
    title: 'Creator MagSafe Smart Rig & Wireless Mic',
    description: 'All-in-one content creator mobile stabilization kit with ultra-low latency wireless lapel microphone.',
    price: 89,
    currency: '$',
    category: 'Creator Gear',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    inStock: true,
    features: ['MagSafe Mount', 'Dual Wireless Mics', 'Cold Shoe Mounts', 'Compact Case']
  }
];

// Persistent state manager
const STORAGE_PREFIX = 'kamatela_v1_';

function getSaved<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function useKamatelaStore() {
  const [user, setUser] = useState<User>(() => getSaved('user', currentUser));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem(STORAGE_PREFIX + 'auth_session');
      return session ? true : true; // Default active session for instant persistent access
    } catch {
      return true;
    }
  });
  const [videos, setVideos] = useState<VideoItem[]>(() => getSaved('videos', initialVideos));
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>(() =>
    getSaved('live_streams', initialLiveStreams)
  );

  useEffect(() => {
    save('live_streams', liveStreams);
  }, [liveStreams]);

  const addLiveStream = (stream: LiveStreamItem) => {
    setLiveStreams((prev) => [stream, ...prev]);
  };

  const endLiveStream = (streamId: string) => {
    setLiveStreams((prev) => prev.filter((s) => s.id !== streamId));
  };

  const toggleLikeLiveStream = (streamId: string) => {
    setLiveStreams((prev) =>
      prev.map((s) =>
        s.id === streamId
          ? { ...s, likesCount: (s.likesCount || 0) + 1 }
          : s
      )
    );
  };
  const [chats, setChats] = useState<ChatConversation[]>(() => {
    const saved = getSaved<ChatConversation[] | null>('chats', null);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      // Auto-migrate away from old legacy contact names if present
      const hasOldNames = saved.some(
        (c: any) =>
          c.id === 'chat_zara' ||
          c.id === 'chat_sophia' ||
          c.id === 'chat_elena' ||
          c.id === 'chat_marcus'
      );
      if (!hasOldNames) return saved;
    }
    return initialChats;
  });
  const [stories, setStories] = useState<UserStory[]>(() => getSaved('stories', initialStories));
  const [products, setProducts] = useState<BusinessProduct[]>(() => getSaved('products', initialProducts));
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>(() => getSaved('inquiries', []));
  const [callLogs, setCallLogs] = useState<CallLog[]>(() => getSaved('call_logs', initialCallLogs));
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>(() => getSaved('voice_rooms', initialVoiceRooms));
  const [musicTracks, setMusicTracks] = useState<AIMusicTrack[]>(() => getSaved('music_tracks', initialMusicTracks));
  const [downloadedTracks, setDownloadedTracks] = useState<AIMusicTrack[]>(() =>
    offlineStorage.getCachedDownloadedTracksSync()
  );
  const [downloadedVideos, setDownloadedVideos] = useState<VideoItem[]>(() =>
    offlineStorage.getCachedVideosSync()
  );

  // Hydrate chats & offline downloaded tracks from IndexedDB on startup
  useEffect(() => {
    offlineStorage.loadCachedChats().then((cachedChats) => {
      if (cachedChats && cachedChats.length > 0) {
        setChats(cachedChats);
      }
    });

    offlineStorage.loadDownloadedTracks().then((cachedTracks) => {
      if (cachedTracks && cachedTracks.length > 0) {
        setDownloadedTracks(cachedTracks);
        // Mark downloaded flag on corresponding in-memory tracks
        const downloadedIds = new Set(cachedTracks.map((t) => t.id));
        setMusicTracks((prev) =>
          prev.map((t) => ({
            ...t,
            isDownloaded: downloadedIds.has(t.id),
          }))
        );
      }
    });

    offlineStorage.loadCachedVideos().then((cachedVideos) => {
      if (cachedVideos && cachedVideos.length > 0) {
        setDownloadedVideos(cachedVideos);
        const downloadedIds = new Set(cachedVideos.map((v) => v.id));
        setVideos((prev) =>
          prev.map((v) => ({
            ...v,
            isDownloadedForFlight: downloadedIds.has(v.id),
          }))
        );
      }
    });

    // Listen to cross-tab BroadcastChannel session events
    const unsubscribeBroadcast = networkService.onBroadcastSessionEvent((evt) => {
      if (evt.type === 'ACCOUNT_SWITCH' || evt.type === 'LOGIN') {
        if (evt.data) {
          setUser(evt.data);
          setIsAuthenticated(true);
        }
      } else if (evt.type === 'LOGOUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      unsubscribeBroadcast();
    };
  }, []);

  useEffect(() => {
    save('voice_rooms', voiceRooms);
  }, [voiceRooms]);

  useEffect(() => {
    save('music_tracks', musicTracks);
  }, [musicTracks]);

  useEffect(() => {
    save('user', user);
  }, [user]);

  useEffect(() => {
    save('videos', videos);
  }, [videos]);

  useEffect(() => {
    save('chats', chats);
    offlineStorage.saveChats(chats);
  }, [chats]);

  useEffect(() => {
    save('stories', stories);
  }, [stories]);

  useEffect(() => {
    save('products', products);
  }, [products]);

  useEffect(() => {
    save('inquiries', inquiries);
  }, [inquiries]);

  useEffect(() => {
    save('call_logs', callLogs);
  }, [callLogs]);

  // Actions
  const toggleLikeVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          return {
            ...v,
            isLiked,
            likesCount: isLiked ? v.likesCount + 1 : v.likesCount - 1,
          };
        }
        return v;
      })
    );
  };

  const addCommentToVideo = (videoId: string, commentText: string) => {
    const newComment: VideoComment = {
      id: 'c_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: commentText,
      timestamp: 'Just now',
      likes: 0,
    };

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            commentsCount: v.commentsCount + 1,
            comments: [newComment, ...v.comments],
          };
        }
        return v;
      })
    );
  };

  const uploadVideo = (videoData: Partial<VideoItem>) => {
    const newVid: VideoItem = {
      id: 'vid_' + Date.now(),
      creator: user,
      videoUrl: videoData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: videoData.posterUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      caption: videoData.caption || 'New video on KAMATELA #superapp',
      tags: videoData.tags || ['#KAMATELA', '#Viral', '#Trending'],
      musicTitle: videoData.musicTitle || 'Original Creator Sound',
      musicAuthor: user.name,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      comments: [],
      linkedProduct: videoData.linkedProduct,
    };
    setVideos((prev) => [newVid, ...prev]);
  };

  const sendMessage = (
    chatId: string,
    text: string,
    mediaType?: 'image' | 'voice' | 'product' | 'song' | 'call_memo',
    mediaUrl?: string,
    extraSnippet?: {
      productSnippet?: { id: string; title: string; price: number; imageUrl: string };
      songSnippet?: { id: string; title: string; genre: string; coverUrl: string; duration: string };
      callMemoSnippet?: {
        partnerName: string;
        callType: 'voice' | 'video';
        durationSeconds: number;
        audioUrl?: string;
        recordedAt: string;
      };
    }
  ) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      mediaType,
      mediaUrl,
      productSnippet: extraSnippet?.productSnippet,
      songSnippet: extraSnippet?.songSnippet,
      callMemoSnippet: extraSnippet?.callMemoSnippet,
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: text || (mediaType ? `Sent a ${mediaType}` : ''),
            lastTimestamp: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Simulated auto-reply from recipient if it's a business chat
    setTimeout(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const replyMsg: ChatMessage = {
              id: 'msg_reply_' + Date.now(),
              senderId: c.participant.id,
              text: `Thanks for contacting ${c.participant.name}! We got your message: "${text.substring(0, 30)}..." and are on it! ⚡`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
            };
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastTimestamp: 'Just now',
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  const addStory = (mediaUrl: string, caption?: string) => {
    const newStory: UserStory = {
      id: 'story_' + Date.now(),
      userId: user.id,
      userName: 'My Status',
      userAvatar: user.avatar,
      mediaUrl,
      caption,
      timestamp: 'Just now',
      isViewed: false,
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const addProduct = (prod: Omit<BusinessProduct, 'id' | 'businessId'>) => {
    const newProd: BusinessProduct = {
      ...prod,
      id: 'prod_' + Date.now(),
      businessId: user.id,
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const deleteProduct = (prodId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  const toggleBusinessMode = () => {
    setUser((prev) => ({
      ...prev,
      isBusiness: !prev.isBusiness,
    }));
  };

  const startOrGetChatWithBusiness = (businessUser: User, initialProduct?: BusinessProduct): string => {
    const existing = chats.find((c) => c.participant.id === businessUser.id);
    if (existing) {
      if (initialProduct) {
        // Send inquiry snippet
        sendMessage(
          existing.id,
          `Inquiring about: ${initialProduct.title} (${initialProduct.currency}${initialProduct.price})`,
          'product'
        );
      }
      return existing.id;
    }

    const newChatId = 'chat_' + businessUser.id;
    const newChat: ChatConversation = {
      id: newChatId,
      type: 'business',
      participant: businessUser,
      lastMessage: initialProduct
        ? `Inquiring about ${initialProduct.title}`
        : `Started chat with ${businessUser.businessName || businessUser.name}`,
      lastTimestamp: 'Just now',
      unreadCount: 0,
      messages: initialProduct
        ? [
            {
              id: 'msg_init_' + Date.now(),
              senderId: user.id,
              text: `Hello! I am interested in ${initialProduct.title}. Is it available?`,
              timestamp: 'Just now',
              status: 'sent',
              productSnippet: {
                id: initialProduct.id,
                title: initialProduct.title,
                price: initialProduct.price,
                imageUrl: initialProduct.imageUrl,
              },
            },
          ]
        : [],
    };

    setChats((prev) => [newChat, ...prev]);
    return newChatId;
  };

  const addCallLog = (log: Omit<CallLog, 'id'>) => {
    const newLog: CallLog = {
      ...log,
      id: 'call_' + Date.now(),
    };
    setCallLogs((prev) => [newLog, ...prev]);
  };

  const clearCallLogs = () => {
    setCallLogs([]);
  };

  // Voice Rooms Management
  const createVoiceRoom = (title: string, topic: string, description: string): string => {
    const newRoomId = 'room_' + Date.now();
    const newRoom: VoiceRoom = {
      id: newRoomId,
      title,
      topic,
      description,
      host: user,
      isLive: true,
      createdAt: 'Just now',
      participants: [
        {
          user,
          role: 'host',
          isSpeaking: true,
          isMuted: false,
          raisedHand: false,
          joinedAt: 'Just now',
        },
      ],
    };
    setVoiceRooms((prev) => [newRoom, ...prev]);
    return newRoomId;
  };

  const joinVoiceRoom = (roomId: string, participantUser: User, role: 'speaker' | 'listener' = 'listener') => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          if (r.participants.some((p) => p.user.id === participantUser.id)) {
            return r;
          }
          return {
            ...r,
            participants: [
              ...r.participants,
              {
                user: participantUser,
                role,
                isSpeaking: false,
                isMuted: role === 'listener',
                raisedHand: false,
                joinedAt: 'Just now',
              },
            ],
          };
        }
        return r;
      })
    );
  };

  const leaveVoiceRoom = (roomId: string, userId: string) => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: r.participants.filter((p) => p.user.id !== userId),
          };
        }
        return r;
      })
    );
  };

  const toggleVoiceRoomMute = (roomId: string, userId: string) => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: r.participants.map((p) =>
              p.user.id === userId ? { ...p, isMuted: !p.isMuted } : p
            ),
          };
        }
        return r;
      })
    );
  };

  const raiseHandInVoiceRoom = (roomId: string, userId: string) => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: r.participants.map((p) =>
              p.user.id === userId ? { ...p, raisedHand: !p.raisedHand } : p
            ),
          };
        }
        return r;
      })
    );
  };

  const promoteParticipant = (roomId: string, userId: string) => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: r.participants.map((p) =>
              p.user.id === userId
                ? { ...p, role: 'speaker', raisedHand: false, isMuted: false }
                : p
            ),
          };
        }
        return r;
      })
    );
  };

  const demoteParticipant = (roomId: string, userId: string) => {
    setVoiceRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: r.participants.map((p) =>
              p.user.id === userId
                ? { ...p, role: 'listener', isMuted: true, isSpeaking: false }
                : p
            ),
          };
        }
        return r;
      })
    );
  };

  const toggleLikeMusicTrack = (trackId: string) => {
    setMusicTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const isLiked = !t.isLiked;
          return {
            ...t,
            isLiked,
            likesCount: isLiked ? t.likesCount + 1 : t.likesCount - 1,
          };
        }
        return t;
      })
    );
  };

  const generateAIMusicTrack = (params: {
    title?: string;
    prompt: string;
    genre: string;
    mood: string;
    isInstrumental: boolean;
    vocalStyle?: AIMusicTrack['vocalStyle'];
    lyrics?: string;
  }): AIMusicTrack => {
    const trackId = 'ai_track_' + Date.now();
    const generatedTitle =
      params.title?.trim() ||
      `${params.genre} ${params.mood} Session #${Math.floor(Math.random() * 900 + 100)}`;

    const covers = [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    ];

    const randomCover = covers[Math.floor(Math.random() * covers.length)];

    const fallbackLyrics = params.isInstrumental
      ? `[Instrumental Track with ${params.genre} Beat & Melody]`
      : `[Verse 1]
Sound waves taking over the floor
Electric feelings we adore
KAMATELA rhythm in the groove
Every beat making you move

[Chorus]
${generatedTitle}!
Shining through the neon sky
Singing loud, flying high
Music never gonna die

[Outro]
Fade out on the harmony...`;

    const newTrack: AIMusicTrack = {
      id: trackId,
      title: generatedTitle,
      prompt: params.prompt,
      genre: params.genre,
      mood: params.mood,
      isInstrumental: params.isInstrumental,
      vocalStyle: params.vocalStyle || (params.isInstrumental ? 'instrumental' : 'female_afropop'),
      lyrics: params.lyrics?.trim() || fallbackLyrics,
      coverUrl: randomCover,
      durationSeconds: Math.floor(Math.random() * 40 + 140),
      createdAt: 'Just now',
      creator: user,
      playsCount: 1,
      likesCount: 1,
      isLiked: true,
    };

    setMusicTracks((prev) => [newTrack, ...prev]);
    return newTrack;
  };

  const updateTrackCover = (trackId: string, newCoverUrl: string) => {
    setMusicTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, coverUrl: newCoverUrl } : t))
    );
  };

  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);

  const addTransaction = (tx: Omit<WalletTransaction, 'id' | 'timestamp' | 'status'>) => {
    const newTx: WalletTransaction = {
      ...tx,
      id: 'tx_' + Date.now(),
      timestamp: 'Just now',
      status: 'completed',
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const deductCoins = (
    amount: number,
    title?: string,
    channel: WalletTransaction['channel'] = 'Live Voice Room'
  ): boolean => {
    const currentCoins = user.coins ?? 500;
    if (currentCoins < amount) {
      return false;
    }
    setUser((prev) => ({ ...prev, coins: (prev.coins ?? 500) - amount }));
    if (title) {
      addTransaction({
        type: 'gift_sent',
        title,
        channel,
        coins: -amount,
        referenceId: `GIFT-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }
    return true;
  };

  const addCoins = (
    amount: number,
    channel: WalletTransaction['channel'] = 'M-Pesa',
    amountUsd?: number
  ) => {
    setUser((prev) => ({ ...prev, coins: (prev.coins || 0) + amount }));
    addTransaction({
      type: 'topup',
      title: `${channel} Coin Top-Up (+${amount})`,
      channel,
      amountUsd: amountUsd ?? amount / 100,
      coins: amount,
      referenceId: `${channel?.replace(/\s+/g, '').toUpperCase() || 'TOPUP'}-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  const addGameReward = (coins: number, gameName: string) => {
    setUser((prev) => ({ ...prev, coins: (prev.coins || 0) + coins }));
    addTransaction({
      type: 'game_reward',
      title: `${gameName} Reward (+${coins} Coins)`,
      channel: 'In-App Game',
      coins,
      referenceId: `REWARD-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  const addCallMemoToChat = (
    partnerId: string,
    memo: {
      partnerName: string;
      callType: 'voice' | 'video';
      durationSeconds: number;
      audioUrl?: string;
    }
  ) => {
    const mins = Math.floor(memo.durationSeconds / 60);
    const secs = memo.durationSeconds % 60;
    const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    sendMessage(
      partnerId,
      `🎙️ In-Call Audio Memo (${durationFormatted})`,
      'call_memo',
      memo.audioUrl,
      {
        callMemoSnippet: {
          ...memo,
          recordedAt: 'Just now',
        },
      }
    );
  };

  const downloadTrackForOffline = async (trackId: string) => {
    const track = musicTracks.find((t) => t.id === trackId);
    if (!track) return;
    const downloaded = await offlineStorage.downloadTrackForOffline(track);
    setDownloadedTracks((prev) => [downloaded, ...prev.filter((t) => t.id !== trackId)]);
    setMusicTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isDownloaded: true } : t))
    );
  };

  const removeDownloadedTrack = async (trackId: string) => {
    await offlineStorage.removeDownloadedTrack(trackId);
    setDownloadedTracks((prev) => prev.filter((t) => t.id !== trackId));
    setMusicTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, isDownloaded: false } : t))
    );
  };

  // Short-form Video Flight Mode & Zero-Connectivity Caching
  const [downloadQuality, setDownloadQualityState] = useState<VideoDownloadQuality>(() =>
    offlineStorage.getDefaultQualityPreference()
  );

  const setDownloadQuality = (quality: VideoDownloadQuality) => {
    offlineStorage.setDefaultQualityPreference(quality);
    setDownloadQualityState(quality);
  };

  const downloadVideoForFlight = async (video: VideoItem, quality?: VideoDownloadQuality) => {
    const q = quality || downloadQuality;
    const cached = await offlineStorage.downloadVideoForFlight(video, q);
    setDownloadedVideos((prev) => [cached, ...prev.filter((v) => v.id !== video.id)]);
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? { ...v, isDownloadedForFlight: true, downloadQuality: q, fileSizeBytes: cached.fileSizeBytes }
          : v
      )
    );
    return cached;
  };

  const removeDownloadedVideo = async (videoId: string) => {
    await offlineStorage.removeDownloadedVideo(videoId);
    setDownloadedVideos((prev) => prev.filter((v) => v.id !== videoId));
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isDownloadedForFlight: false } : v))
    );
  };

  const batchDownloadTopVideos = async (count = 5, quality?: VideoDownloadQuality) => {
    const q = quality || downloadQuality;
    const toDownload = videos.slice(0, count);
    const results: VideoItem[] = [];
    for (const v of toDownload) {
      const cached = await offlineStorage.downloadVideoForFlight(v, q);
      results.push(cached);
    }
    setDownloadedVideos(results);
    const downloadedIds = new Set(results.map((v) => v.id));
    setVideos((prev) =>
      prev.map((v) => ({
        ...v,
        isDownloadedForFlight: downloadedIds.has(v.id),
        downloadQuality: downloadedIds.has(v.id) ? q : v.downloadQuality,
      }))
    );
    return results;
  };

  const clearAllFlightVideos = async () => {
    await offlineStorage.clearAllFlightVideos();
    setDownloadedVideos([]);
    setVideos((prev) =>
      prev.map((v) => ({
        ...v,
        isDownloadedForFlight: false,
      }))
    );
  };

  // Unified Single Sign-On (SSO) authentication & persistent session management
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'blocked_user_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reportedRecords, setReportedRecords] = useState<
    Array<{ userId: string; reason: string; details?: string; timestamp: number }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'reported_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const blockUser = (userId: string, reason?: string) => {
    setBlockedUserIds((prev) => {
      if (prev.includes(userId)) return prev;
      const updated = [...prev, userId];
      try {
        localStorage.setItem(STORAGE_PREFIX + 'blocked_user_ids', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const unblockUser = (userId: string) => {
    setBlockedUserIds((prev) => {
      const updated = prev.filter((id) => id !== userId);
      try {
        localStorage.setItem(STORAGE_PREFIX + 'blocked_user_ids', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isUserBlocked = (userId: string) => {
    return blockedUserIds.includes(userId);
  };

  const reportUser = (
    userId: string,
    reason: string,
    details?: string,
    shouldBlock: boolean = false
  ) => {
    const newRecord = {
      userId,
      reason,
      details,
      timestamp: Date.now(),
    };
    setReportedRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(STORAGE_PREFIX + 'reported_records', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (shouldBlock) {
      blockUser(userId, reason);
    }
  };

  const login = (newUser: User, token?: string) => {
    setUser(newUser);
    setIsAuthenticated(true);
    save('auth_session', {
      token: token || `token_${Date.now()}`,
      userId: newUser.id,
      timestamp: Date.now(),
    });
    save('user', newUser);
    networkService.broadcastSessionEvent({ type: 'LOGIN', data: newUser });
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'auth_session');
    } catch (e) {
      console.error(e);
    }
    networkService.broadcastSessionEvent({ type: 'LOGOUT' });
  };

  const switchAccount = (targetUser: User) => {
    login(targetUser);
    networkService.broadcastSessionEvent({ type: 'ACCOUNT_SWITCH', data: targetUser });
  };

  return {
    user,
    setUser,
    isAuthenticated,
    login,
    logout,
    switchAccount,
    blockedUserIds,
    blockUser,
    unblockUser,
    isUserBlocked,
    reportUser,
    reportedRecords,
    transactions,
    addTransaction,
    deductCoins,
    addCoins,
    addGameReward,
    addCallMemoToChat,
    downloadedTracks,
    downloadTrackForOffline,
    removeDownloadedTrack,
    downloadedVideos,
    downloadQuality,
    setDownloadQuality,
    downloadVideoForFlight,
    removeDownloadedVideo,
    batchDownloadTopVideos,
    clearAllFlightVideos,
    videos,
    chats,
    stories,
    products,
    inquiries,
    callLogs,
    voiceRooms,
    musicTracks,
    addCallLog,
    clearCallLogs,
    createVoiceRoom,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleVoiceRoomMute,
    raiseHandInVoiceRoom,
    promoteParticipant,
    demoteParticipant,
    generateAIMusicTrack,
    updateTrackCover,
    toggleLikeMusicTrack,
    toggleLikeVideo,
    addCommentToVideo,
    uploadVideo,
    sendMessage,
    addStory,
    addProduct,
    deleteProduct,
    toggleBusinessMode,
    startOrGetChatWithBusiness,
    liveStreams,
    addLiveStream,
    endLiveStream,
    toggleLikeLiveStream,
  };
}
