# Requirements Document

## 1. Application Overview
- Application Name: KAMATELA
- Description: A mobile-first Progressive Web Application structured as an integrated super-app inspired by ZTE iCenter architecture. KAMATELA combines phone-based onboarding and real-time instant messaging, in-chat message search and date filtering, dual co-host live streaming, offline-capable short video discovery, an AI Music Generation Studio with stem separation, multi-participant group voice rooms with stage mini-games, multi-channel mobile money wallet services, a creator/business marketplace, and a centralized Device Privacy and Security Hub backed by cross-network session resiliency.

## 2. Users and Core Scenarios
- Target Users:
  - General Users: Individuals connecting with contacts, searching chat message history, participating in voice rooms, chatting with rich messaging features, calling, and managing personal wallet balances.
  - Creators and Live Broadcasters: Users generating AI music, sharing short videos with offline download support, hosting single or dual co-host live streams, and monetizing services.
  - Business Owners: Small businesses and merchants listing catalogs in the Creator Marketplace, sharing business QR codes, and processing mobile money payments.
- Core Scenarios:
  - Registering and logging in via phone verification with international country code selection, receiving an on-screen 6-digit SMS code with auto-fill, and configuring a user profile with display name and status message.
  - Switching between saved demo or secondary accounts and managing global session state across browser tabs.
  - Chatting in 1-on-1 and group threads with rich text, voice notes with speed toggles, delivery receipts, quoted replies, emoji reactions, document/location/contact/money attachments, disappearing messages, and presence indicators.
  - Searching message threads in real time using keyword queries and date filters with match count navigation.
  - Initiating or watching live streams, sending or accepting co-host requests, and broadcasting simultaneously on a 50/50 dual split-screen stage.
  - Placing voice and video calls with swipe controls and in-call recording memos with offline sync queuing.
  - Generating AI music tracks, separating stems (Vocals, Beat, Bassline), and playing audio continuously in a persistent floating mini player.
  - Joining interactive voice rooms with background music and live stage mini-games (Trivia Quiz and Coin Lucky Wheel).
  - Funding wallets via M-Pesa, MTN MoMo, Orange Money, or bank cards and conducting peer-to-peer transfers inside chat threads.
  - Managing device security, network data saver modes, offline video storage cache, and privacy permissions in the Security Hub.

## 3. Page Structure and Functional Description

### 3.1 Information Architecture
```
KAMATELA (iCenter Architecture)
├── Global Navigation & Framework
│   ├── Top Header (Network Status, Latency Indicator, Security Status, Search)
│   ├── Floating Mini Audio Player (Global Audio Playback & Offline Mode)
│   └── Bottom Navigation Bar (Chats, Feeds & Live, iCenter Hub, AI Studio, Profile)
├── Authentication & Account Management
│   ├── Phone Number Verification Screen (Country Code Selector, Phone Input)
│   ├── 6-Digit SMS Code Verification Screen (On-Screen Code Banner, Auto-Fill, Resend Timer)
│   ├── Profile Setup Screen (Avatar Upload, Display Name, Status Message/About)
│   └── Account Switcher & Session Controller (Demo Profiles, Multi-Tab Sync, Logout)
├── Module 1: Communication Center (Instant Messaging & Calls)
│   ├── Conversation List (Search, Presence Indicators, Sync Status, QR Entry, Sync Contacts Action)
│   ├── Chat Room
│   │   ├── Chat Header & Search Bar Toggle
│   │   ├── In-Chat Message Search Bar (Keyword Input, Date Filter, Match Counter, Match Navigators, Clear/Close)
│   │   ├── Rich Messaging & Voice Notes
│   │   ├── Rich Attachments & Cards
│   │   └── Message Actions & Delivery Status
│   ├── Chat Info & Media Drawer (Contact Profile, Media Gallery, Shared Docs, Starred Messages, Disappearing Timer)
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

#### 3.2.1 Authentication Module
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
  - Session persistence retaining authentication across network switches.
  - Multi-tab synchronization utilizing browser channels to synchronize login and logout events across tabs.

#### 3.2.2 Communication Center (Instant Messaging & Calls)
- Conversation List:
  - Displays active 1-on-1 and group chats with profile avatar, contact name, last message snippet, timestamp, unread badge, and presence indicator (online status/typing label).
  - Search bar to filter conversations by name or message content.
  - Header actions for QR Scanner and Contact Sync.
- Chat Room:
  - Header: Displays contact name, avatar, online / last seen status, live typing indicator simulation, search toggle icon, and an info drawer toggle button.
  - In-Chat Message Search Bar:
    - Toggled via the search icon in the chat header; docks directly below or replaces the header.
    - Keyword text input supporting real-time text matching and keyword highlighting in message bubbles.
    - Date filter selector supporting presets (e.g., Any Date, Today, This Week) and custom date selection to scope search results.
    - Match status indicator displaying current index and total matches (e.g., \"3 of 12 matches\").
    - Next / Previous navigation buttons to jump directly to matched messages in the thread.
    - Clear keyword action and close/dismiss button to return to the standard chat view.
  - Message Stream: Chronological list of message bubbles with sender distinction, timestamp, and delivery status indicators (single check for Sent, double check for Delivered, blue double check for Read).
  - Voice Notes Module:
    - Microphone recording button with hold/tap action.
    - Live recording state showing duration counter, real-time waveform visualizer animation, and [Cancel] / [Send] controls.
    - Playback audio bubble featuring play/pause toggle, audio progress scrub bar, total duration, and playback speed toggle button (1x / 1.5x / 2x).
  - Rich Attachment Menu:
    - Photo/Image: Image attachment picker with image preview.
    - Document/PDF: File attachment card displaying document name, file size, and file type icon.
    - Location Card: Shared location preview card with map thumbnail, address label, and coordinate details.
    - Contact Card: Interactive contact share card with avatar, name, phone number, and [Add Contact] action.
    - MoMo Transfer Card: Integrated mobile money transfer bubble displaying transfer amount, currency, transaction reference, and status badge.
    - AI Song Card & Call Recording Memo: Embedded playable music cards and recorded call audio bubbles.
  - Message Action Controls:
    - Quick reaction picker supporting preset reaction options (Thumbs Up, Heart, Laugh, Surprised, Sad, Pray).
    - Swipe or click action to reply with a quoted message preview banner docked above the input field.
    - Context actions: Copy text, Star message, Forward message, and Delete for everyone.
- Chat Info & Media Drawer:
  - Profile summary showing contact avatar, display name, phone number, and status message.
  - Encryption badge indicating communication status.
  - Shared Media Gallery: Tabbed collection for shared photos, videos, and embedded audio.
  - Shared Documents: List of shared document files with file names and size metadata.
  - Starred Messages: Dedicated list of all messages marked as starred within the conversation.
  - Disappearing Messages Controller: Configurable timer settings (24 Hours, 7 Days, 90 Days, Off).
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
  - Quality Selector Modal: Quality selection (Standard 480p, High 720p, Ultra 1080p) showing estimated file sizes.
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
1. Phone Verification Lifecycle:
   - Users enter a phone number after selecting an international country code.
   - An on-screen SMS simulation displays a 6-digit verification code. Users can enter the code manually or tap [Auto-Fill].
   - Successful verification checks if a profile exists; if not, the user is routed to the Profile Setup screen to configure display name and status message before accessing the app.
2. Instant Messaging State and Delivery Receipts:
   - Messages transition through three delivery statuses: Sent (single check), Delivered (double check), and Read (blue double check).
   - Quoted replies attach the target message payload above the new input and display a clickable quote reference in the rendered bubble.
   - Deleting a message for everyone replaces bubble content with a revoked message placeholder across conversation participants.
3. In-Chat Message Search and Filtering:
   - Users activate search via the header search button.
   - Queries filter messages containing matching text and/or matching the selected date criteria (e.g., Today, This Week, or a chosen date).
   - Search matches highlight corresponding text within chat bubbles, update total match counts, and allow stepping through results chronologically using Next/Previous actions.
   - Closing search resets highlights, clears keyword filters, and returns the chat stream to normal scrolling.
4. Disappearing Messages Lifecycle:
   - When disappearing messages are enabled in Chat Info, messages sent after configuration automatically purge from the conversation thread upon timer expiration (24h, 7d, or 90d).
5. Voice Note Audio Processing:
   - Recorded voice notes capture audio duration and waveform points locally.
   - Playback supports dynamic rate switching among 1x, 1.5x, and 2x speeds without altering audio pitch baseline.
6. Dual Live Co-Hosting Mechanism:
   - Viewers can send co-host requests; hosts can accept/decline or invite any active viewer.
   - Upon acceptance, the broadcast transitions into a dual split-screen stage with active audio/video for both parties.
   - Either party leaving or disconnecting smoothly returns the broadcast to a single-host layout without ending the main live stream.
7. Session Resiliency & Multi-Tab Synchronization:
   - User sessions and authentication tokens remain active across network changes.
   - Authentication status, account switching, and wallet balance updates synchronize across all open browser tabs via BroadcastChannel.
8. Background Action Queue:
   - Messages, top-ups, and profile changes made while offline are placed in a persistent local queue and automatically submitted upon network restoration.
9. Audio Continuity:
   - The global floating mini player maintains uninterrupted audio playback across internal page transitions and tab changes for both online streams and cached tracks.

## 5. Exceptions and Edge Cases

| Scenario | Condition | Handling |
| :--- | :--- | :--- |
| No Search Matches Found | Keyword or date filter yields zero matching messages | Display \"0 matches found\" status indicator in search bar and keep existing message stream position intact |
| Invalid SMS Verification Code | User enters an incorrect 6-digit code | Highlight code inputs in red, clear input values, and display an invalid code error message |
| Expired SMS Verification Code | Verification code entered after validity expiration | Prompt user to request a new SMS code and reset the resend timer |
| Camera/Mic Permission Blocked | User denies media permissions during live stream or call | Show an explicit permission guidance banner and disable streaming actions until granted |
| Voice Note Recording Interrupted | User cancels or network drops during recording | Discard active recording buffer without creating an empty chat message |
| Co-Host Network Disconnect | Co-host loses connection during split-screen broadcast | Display reconnecting indicator on co-host pane; revert to single host layout if unrecovered after grace period |
| Message Sent While Offline | Chat message sent with zero network connectivity | Store message in local sync queue with a pending icon; auto-send when connection is restored |
| Contact Sync File Malformed | User uploads an invalid or unreadable .vcf file | Display file parse error message and suggest native contact picker or manual QR scan |
| Missing Top-Up Details | Top-up submitted without selecting channel or entering amount | Highlight missing fields and prevent transaction submission |

## 6. Acceptance Criteria
1. Users can register and log in by selecting a country code, inputting a phone number, receiving an on-screen 6-digit SMS code, and using the one-tap auto-fill action.
2. Users can toggle the in-chat search bar from the chat header, execute text keyword queries, apply date filters, view match counts, and navigate between matched messages.
3. Users can record voice notes with live waveform and duration display, cancel or send recordings, and play received voice notes at 1x, 1.5x, or 2x speed.
4. Chat messages display accurate delivery indicators (Sent, Delivered, Read), support emoji reactions, quoted replies, text copying, starring, forwarding, and delete-for-everyone.
5. Chat threads support sending and viewing rich attachment cards including Images, Documents with file size, Location map previews, Contact cards, and MoMo Money transfer cards.
6. The Chat Info drawer displays contact profile details, shared media gallery, shared documents, starred messages, encryption status badge, and disappearing message timer configuration.
7. Active conversation lists and chat headers display live typing and online/last seen presence status simulations.
8. Broadcasters and viewers can establish a dual live co-host split-screen broadcast and revert to single-host mode upon disconnection.
9. Users can generate, share, and scan KAMATELA contact QR codes using the camera or file upload scanner to view contact cards.
10. Short videos can be downloaded in 480p, 720p, or 1080p quality tiers and played smoothly in Flight Mode while completely offline.
11. AI Music Studio generates tracks, enables stem separation (Vocals, Beat, Bassline), and plays audio continuously via the persistent floating mini player.
12. Group voice rooms support live voice discussions, background music, Trivia Quiz scoring, and Coin Lucky Wheel spins.
13. Users can submit top-ups across M-Pesa, MTN MoMo, Orange Money, and Card with updated balance and transaction logs.

## 7. Out of Scope for Current Phase
1. Multi-party video grid exceeding two broadcasters in a single live stream.
2. Paid live broadcast paywalls and virtual gifting item animations.
3. Native desktop executable installers.
4. Multi-track timeline sound engineering tools in AI Music Studio.
5. Real-world international bank wire settlements.