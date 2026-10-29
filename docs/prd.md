# Requirements Document

## 1. Application Overview
- Application Name: KAMATELA
- Description: A mobile-first Progressive Web Application (PWA) structured as an integrated super-app inspired by ZTE iCenter architecture. KAMATELA combines WhatsApp-style phone onboarding and real-time communications, dual co-host live streaming, offline-capable short video discovery, an AI Music Generation Studio with stem separation, multi-participant group voice rooms with stage mini-games, multi-channel mobile money wallet services, a creator/business marketplace, and a centralized Device Privacy & Security Hub backed by cross-network session resiliency.

## 2. Users and Core Scenarios
- Target Users:
  - General Users: Individuals connecting with friends and family, participating in voice rooms, chatting, calling, and managing personal wallet balances.
  - Creators & Live Broadcasters: Users generating AI music, sharing short videos with offline flight download support, hosting single or dual co-host live streams, and monetizing services.
  - Business Owners: Small businesses and merchants listing catalogs in the Creator Marketplace, sharing business QR codes, and processing mobile money payments.
- Core Scenarios:
  - Registering and logging in via WhatsApp-style phone verification with international country code selection, receiving an on-screen 6-digit SMS code with auto-fill, and configuring a user profile with display name and status message.
  - Switching effortlessly between saved demo or secondary accounts and managing global logout across tabs.
  - Initiating or watching live streams, sending or accepting co-host requests, and broadcasting simultaneously on a 50/50 dual split-screen stage.
  - Chatting in 1-on-1 and group threads with text, voice notes, media, embedded AI song cards, contact QR cards, and in-call recording memos with full offline sync queuing.
  - Placing simulated voice and video calls with swipe controls and in-call memo recording.
  - Generating AI music tracks, separating stems (Vocals, Beat, Bassline), and playing audio continuously in a persistent floating mini player.
  - Joining interactive voice rooms with background music and live stage mini-games (Trivia Quiz and Coin Lucky Wheel).
  - Funding wallets via M-Pesa, MTN MoMo, Orange Money, or bank cards and viewing transaction histories.
  - Managing device security, network data saver modes, offline video storage cache, and privacy permissions in the Security Hub.

## 3. Page Structure and Functional Description

### 3.1 Information Architecture
```
KAMATELA (iCenter Architecture)
├── Global Navigation & Framework
│   ├── Top Header (Network Status, Latency Indicator, Security Status, Search)
│   ├── Floating Mini Audio Player (Global Audio Playback & Offline Mode)
│   └── Bottom Navigation Bar (Chats, Feeds & Live, iCenter Hub, AI Studio, Profile)
├── Authentication & Account Management (WhatsApp Style)
│   ├── Phone Number Verification Screen (Country Code Selector, Phone Input)
│   ├── 6-Digit SMS Code Verification Screen (On-Screen Code Banner, Auto-Fill, Resend Timer)
│   ├── Profile Setup Screen (Avatar Upload, Display Name, Status Message/About)
│   └── Account Switcher & Session Controller (Demo Profiles, Multi-Tab Sync, Logout)
├── Module 1: Communication Center (WhatsApp-Style Chats & Calls)
│   ├── Conversation List (Search, Offline Sync Status, QR Entry, Sync Contacts Action)
│   ├── Chat Room (Text, Voice Notes, Media, AI Song Cards, Call Recording Memos, Sync Queue)
│   ├── QR Code Center (My Contact QR Card, Live Camera Scanner, File Upload Scanner)
│   ├── Contact Management & Sync (Native Contact Picker, vCard Import, Matched/Invite Lists)
│   ├── Call Screen & Overlay (Voice/Video Call, Swipe Gestures, In-Call Audio Recorder)
│   └── Call Logs & Recording History
├── Module 2: Video & Live Broadcast Center
│   ├── Video Feed (Short-Form Videos, Offline Quality Badges, Data Saver Mode)
│   ├── Offline / Flight Mode Video Player (Offline Playlist, Storage Cache Meter)
│   ├── Download Quality Modal (Standard 480p, High 720p, Ultra 1080p, Batch Download)
│   └── Live Streaming Stage (Go Live Studio, Viewer Stage, Dual Split-Screen Co-Host Layout)
├── Module 3: iCenter Services & Tools Hub
│   ├── Voice Rooms & Mini Games (Room Discovery, Stage Audio, Trivia Quiz, Coin Lucky Wheel)
│   ├── Creator & Business Marketplace (Business Profiles, Product/Service Catalog, Brand Tracks)
│   ├── Wallet & Mobile Money Center (Balance, M-Pesa, MTN MoMo, Orange Money, Card Top-Up)
│   └── Device Privacy & Security Hub (Network Diagnostic, Storage Manager, Permission Center)
├── Module 4: AI Music Studio
│   ├── Prompt & Lyrics Generator
│   ├── Track Player & Waveform Visualizer
│   ├── Stem Separation Mixer (Vocals, Beat, Bassline Faders & Stem Exporter)
│   └── Offline Music Playlist & Cover Art Generator
└── Module 5: Profile & System Preferences
    ├── Personal Profile & Status Edit
    ├── Account Switcher & Linked Sessions
    ├── Network Preferences & Data Saver Toggle
    └── Global Logout & PWA Installation
```

### 3.2 Page Functional Descriptions

#### 3.2.1 WhatsApp-Style Authentication Module
- Phone Number Verification Screen:
  - Searchable country code dropdown with international dial codes and flag indicators.
  - Phone number input field with format validation.
  - Action button to submit and request a 6-digit SMS verification code.
- 6-Digit SMS Verification Screen:
  - Six individual digit input boxes with auto-focus progression.
  - Simulated on-screen SMS notification displaying the 6-digit verification code.
  - One-tap [Auto-Fill] button to populate the code into input fields automatically.
  - Resend countdown timer and verification trigger upon entry of the complete code.
- Profile Setup Screen:
  - Initial profile configuration shown upon first registration or missing profile data.
  - Avatar image selection or camera capture.
  - Display name input field.
  - Status message / About selector with customizable preset options (e.g., Available, Busy, At Work, In a Meeting).
  - [Complete Setup] button directing users to the main application.
- Account Switcher & Session Controller:
  - Demo account switcher offering instant pre-configured profiles (Creator, Business, Nomad).
  - Session persistence retaining authentication across network switches (Wi-Fi, 4G/5G, 3G/2G, Offline).
  - Multi-tab synchronization utilizing browser channels to synchronize login and logout events across tabs.

#### 3.2.2 Communication Center (Chats & Calls)
- Conversation List: Displays active 1-on-1 and group chats, preview snippets, unread message badges, offline pending indicators, and quick action headers for QR Scanner and Contact Sync.
- Chat Room:
  - Messaging: Supports text input, inline voice note recorder, photo/video attachments, and local message status indicators (Pending / Sent / Cached).
  - AI Song Cards: Embedded playable music cards with cover, title, genre, and play/pause controls.
  - Call Recording Memos: Chronological voice memo bubbles recorded during calls for playback in-thread.
- QR Code Center:
  - My QR Code: Displays personal profile card, QR code, phone number, and status with download and share actions.
  - Scan QR Code: Camera viewfinder with torch and camera flip controls, file upload scanner fallback, and sample contact QR selection.
  - Scanned Contact Card: Profile preview modal with instant [Add Contact], [Message], and [Call] actions.
- Contact Sync & Import Modal:
  - Native browser contact picker integration with vCard (.vcf) file import fallback.
  - Categorization into Matched KAMATELA contacts and Unregistered contacts with invite triggers.
- Call Screen & Overlay:
  - Incoming call simulation overlay with swipe-to-answer and swipe-to-decline gestures.
  - Active voice/video call screen featuring microphone mute, camera toggle, call timer, audio visualizer, and an [In-Call Audio Recording] button.
  - Call history log linking recorded call memos directly to respective chats.

#### 3.2.3 Video & Live Broadcast Center
- Short Video Feed: Vertical video stream with audio controls, creator details, attached soundtracks, and offline fallback.
- Live Streaming Hub:
  - Single Host Broadcast: Live viewer stage with real-time viewer count, chat feed, and a [Request Co-Host] button for viewers.
  - Go Live Studio: Host creation view with stream title input, camera/mic preview, and [Start Broadcast] action.
  - Co-Host Management: Host drawer listing viewer join requests with [Accept] / [Decline] actions and an active viewer list with [Invite to Co-Host] options.
  - Dual Split-Screen Stage: Automatically renders a 50/50 dual video layout when a co-host connects, streaming synchronized audio and video from both host and guest.
  - In-Stream Controls: Host controls to mute/disconnect guest or end broadcast; guest controls to toggle mic, toggle camera, or leave stream.
- Offline Flight Videos:
  - Quality Selector Modal: Quality selection (Standard 480p, High 720p, Ultra 1080p) showing estimated file sizes and storage savings.
  - Flight Mode Player: Full-screen video player dedicated to playing locally cached videos when offline.
  - Batch Download: One-tap action to download the top 5 trending videos in the selected quality tier.

#### 3.2.4 iCenter Services & Tools Hub
- Voice Rooms & Mini-Games:
  - Voice Room Stage: Audio room supporting host, speaker stage, audience queue, and background music streaming.
  - Trivia Quiz Mini-Game: Host-initiated timed quiz with live participant scoring and leaderboard display.
  - Coin Lucky Wheel Mini-Game: Interactive wheel spin crediting reward tokens to the user wallet balance.
- Creator & Business Marketplace:
  - Business Profiles: Merchant profile showing category, contact info, location, and official Brand Soundtrack.
  - Product & Service Catalog: Browse and manage items with images, pricing, and descriptions.
- Wallet & Mobile Money Center:
  - Wallet Overview: Available balance display with real-time multi-tab synchronization.
  - Multi-Channel Top-Up: Form supporting M-Pesa, MTN MoMo, Orange Money, and Card payments.
  - Transaction History: Log of top-ups, mini-game rewards, and marketplace activities with offline sync queue indicators.
- Device Privacy & Security Hub:
  - Network Diagnostic Monitor: Real-time connection interface and latency monitor with Data Saver toggle.
  - Storage Cache Manager: Storage meter displaying cached video and audio disk consumption with individual and clear-all actions.
  - Privacy & Permission Center: Browser media permissions overview (camera, microphone, contacts) and local data reset.

#### 3.2.5 AI Music Studio
- Generator: Prompt, genre, mood, and lyrics input to generate custom audio tracks.
- Waveform Player: Audio player featuring live waveform, scrub slider, and lyrics visualizer.
- Stem Separation Mixer: Isolates Vocals, Beat, and Bassline channels with volume faders, solo/mute controls, and individual stem download options.
- Floating Mini Player: Persistent global bar dockable across tabs and views supporting online streaming and offline cached track playback.

#### 3.2.6 Profile & System Preferences
- Profile View: Displays phone number, display name, status message/about, QR code action, and account switcher.
- Preferences: Default offline video download quality tier selector, Data Saver toggle, and global logout action.

## 4. Business Rules and Core Logic
1. WhatsApp-Style Phone Verification Lifecycle:
   - Users enter a phone number after selecting an international country code.
   - An on-screen SMS simulation displays a 6-digit verification code. Users can enter the code manually or tap [Auto-Fill].
   - Successful verification checks if a profile exists; if not, the user is routed to the Profile Setup screen to configure display name and status message before accessing the app.
2. Dual Live Co-Hosting Mechanism:
   - Viewers can send co-host requests; hosts can accept/decline or invite any active viewer.
   - Upon acceptance, the broadcast transitions into a dual split-screen stage with active audio/video for both parties.
   - Either party leaving or disconnecting smoothly returns the broadcast to a single-host layout without ending the main live stream.
3. Session Resiliency & Multi-Tab Broadcast:
   - User sessions and authentication tokens remain active across network changes (Wi-Fi, 4G/5G, 3G/2G, Offline).
   - Authentication status, account switching, and wallet balance updates synchronize across all open browser tabs via BroadcastChannel.
4. Offline Video Downloads & Quality Tiers:
   - Offline downloads support three explicit tiers: Standard (480p), High (720p), and Ultra (1080p).
   - Cached videos are accessible in Flight Mode without an active internet connection, displaying their resolution badges.
5. Background Action Queue:
   - Messages, top-ups, and profile changes made while offline are placed in a persistent local queue and automatically submitted upon network restoration.
6. QR Contact Exchange & Contact Matching:
   - User QR codes contain structured profile payloads. Scanning via camera or file upload immediately opens the Scanned Contact Card.
   - Contact syncing compares imported numbers with registered records to generate matched chat links and unregistered invite actions.
7. Audio Continuity:
   - The global floating mini player maintains uninterrupted audio playback across internal page transitions and tab changes for both online streams and cached tracks.
8. Wallet and Mobile Money Updates:
   - Successful top-ups via M-Pesa, MTN MoMo, Orange Money, or Card instantly credit the local wallet balance and log a transaction record.

## 5. Exceptions and Edge Cases

| Scenario | Condition | Handling |
| :--- | :--- | :--- |
| Invalid SMS Verification Code | User enters an incorrect 6-digit code | Highlight code inputs in red, clear input values, and display an invalid code error message |
| Expired SMS Verification Code | Verification code entered after validity expiration | Prompt user to request a new SMS code and reset the resend timer |
| Camera/Mic Permission Blocked | User denies media permissions during live stream or call | Show an explicit permission guidance banner and disable streaming actions until granted |
| Co-Host Network Disconnect | Co-host loses connection during split-screen broadcast | Display reconnecting indicator on co-host pane; revert to single host layout if unrecovered after grace period |
| Offline Video Storage Full | Browser storage limit reached during video download | Notify user of insufficient storage and offer option to delete cached items in Security Hub |
| Message Sent While Offline | Chat message sent with zero network connectivity | Store message in local sync queue with a pending icon; auto-send when connection is restored |
| Contact Sync File Malformed | User uploads an invalid or unreadable .vcf file | Display file parse error message and suggest native contact picker or manual QR scan |
| Missing Top-Up Details | Top-up submitted without selecting channel or entering amount | Highlight missing fields and prevent transaction submission |

## 6. Acceptance Criteria
1. Users can register and log in by selecting a country code, inputting a phone number, receiving an on-screen 6-digit SMS code, and using the one-tap auto-fill action.
2. First-time users or unconfigured accounts can set their display name, avatar, and status message on the Profile Setup screen.
3. Switching demo accounts or logging out in one browser tab immediately updates all open tabs in real time.
4. Broadcasters and viewers can establish a dual live co-host split-screen broadcast and revert to single-host mode upon disconnection.
5. Users can send text, voice notes, media, AI song cards, and call recording memos in chat threads with offline queuing support.
6. Users can generate, share, and scan KAMATELA contact QR codes using the camera or file upload scanner to view contact cards.
7. Device contacts can be imported via native contact picker or .vcf file and segregated into matched users and unregistered contacts.
8. Short videos can be downloaded in 480p, 720p, or 1080p quality tiers and played smoothly in Flight Mode while completely offline.
9. The Device Privacy & Security Hub accurately reports network latency, Data Saver toggle state, and cached storage usage with clear-cache controls.
10. AI Music Studio generates tracks, enables stem separation (Vocals, Beat, Bassline), and plays audio continuously via the persistent floating mini player.
11. Group voice rooms support live voice discussions, background music, Trivia Quiz scoring, and Coin Lucky Wheel spins.
12. Users can submit top-ups across M-Pesa, MTN MoMo, Orange Money, and Card with updated balance and transaction logs.

## 7. Out of Scope for Current Phase
1. Multi-party video grid exceeding two broadcasters in a single live stream.
2. Paid live broadcast paywalls and virtual gifting item animations.
3. Native desktop executable installers.
4. Multi-track timeline sound engineering tools in AI Music Studio.
5. Real-world international bank wire settlements.