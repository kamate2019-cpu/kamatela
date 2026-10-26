# Requirements Document

## 1. Application Overview
- Application Name: KAMATELA
- Description: A mobile-first Progressive Web Application (PWA) with multi-network connection resiliency and universal persistent single sign-on across all network conditions (Wi-Fi, 5G/4G, 3G/2G, roaming, and offline). The application integrates real-time communication, short-form video discovery with offline flight saving and playback (with selectable download quality tiers to optimize storage), direct voice and video calling with in-call recording memos, personal QR code profile exchange, contact synchronization, multi-participant group voice rooms with stage mini-games, an AI Music Generation Studio with stem separation, continuous audio playback with a persistent floating mini player, multi-channel mobile money wallet top-ups, cross-network background sync queuing, real-time network quality monitoring with Data Saver mode, and multi-tab session continuity via browser channels.

## 2. Users and Core Scenarios
- Target Users:
  - General Users & Creators: Individuals who log in once to seamlessly access videos, offline video playlists, chats, voice rooms, music studio, and wallet across sessions, tabs, and fluctuating network environments.
  - Business Users: Small business owners or creators who switch to business profiles, display business QR codes, showcase brand soundtracks, and manage product catalogs under persistent authenticated sessions.
- Core Scenarios:
  - Logging in once via email, phone, or one-tap demo account switcher and maintaining persistent authenticated access across all app modules, browser tabs, and network states.
  - Selecting preferred video download quality (Standard 480p, High 720p, or Ultra 1080p) to manage storage consumption and downloading short-form videos individually or in batch for full offline playback during flights or in zero-connectivity environments.
  - Monitoring real-time connection status (active network interface, latency indicator) and toggling Data Saver mode to adapt media streaming under low-bandwidth conditions.
  - Queuing outgoing messages, transactions, and profile updates when network connectivity is weak or offline, with automatic background synchronization upon network reconnection or transition.
  - Synchronizing session states, active profiles, and audio playback status across multiple browser tabs and windows in real time.
  - Generating, sharing, and scanning KAMATELA Contact QR Codes to add contacts, initiate chats, or place direct calls.
  - Syncing device contacts via native Contact Picker API or vCard (.vcf) import, matching registered users, and inviting non-registered contacts.
  - Messaging contacts with text, voice notes, media, and offline-cached conversation access.
  - Downloading generated music and stems for offline playback via the persistent floating mini player.
  - Receiving simulated incoming voice/video calls and saving in-call audio recording memos to chat threads.
  - Hosting and joining group voice rooms with background music and stage mini-games (Trivia Quiz and Coin Lucky Wheel).
  - Managing wallet balances and executing top-ups via M-Pesa, MTN MoMo, Orange Money, or Card.
  - Generating AI music tracks, isolating stems, and publishing short-form videos with attached soundtracks.

## 3. Page Structure and Functional Description

### 3.1 Information Architecture
```
KAMATELA (PWA)
├── Global Network & Session Resilience Layer
│   ├── Network Status Monitor & Latency Indicator
│   ├── Data Saver Mode Switcher (Adaptive Bitrate / Compressed Media)
│   ├── Cross-Network Background Sync Queue (Auto-Flush & Conflict Resolution)
│   └── Multi-Tab Session Synchronization (BroadcastChannel Real-Time Sync)
├── Global Authentication & Identity Provider (Unified SSO, auto-restore across networks)
│   ├── Authentication Modal (Email / Phone Login & Registration)
│   ├── Demo Account Quick Switcher (Creator, Business, Nomad presets)
│   └── Session State Controller (Logout & Multi-Tab State Clearance)
├── Persistent Floating Mini Player (Global across tabs, supports offline playback)
├── Video Feed
│   ├── Video Player & Feed (Online Stream & Offline Auto-Fallback)
│   ├── Flight Mode / Offline Videos Tab (Full-Screen Offline Player & Resolution Badges)
│   ├── Download Quality Selection Modal (Standard 480p, High 720p, Ultra 1080p with Size Estimates & Storage Savings)
│   ├── Video Download & Flight Queue (One-Tap Save, Progress, Batch Top 5 Download)
│   ├── Offline Video Storage Manager (Space Usage Display & Clear Cache)
│   └── Video & Photo Upload (with Soundtrack Attachment & Offline Draft Queue)
├── Chats & Calls
│   ├── Conversation List (Offline cached access, QR Code Header Action, Sync Phone Contacts Action)
│   ├── New Chat Modal (Sync Phone Contacts Action, Scan QR Action)
│   ├── QR Code Hub Modal / View
│   │   ├── My QR Code Tab (Avatar, Name, Handle, Phone, Business Badge, Download & Share)
│   │   ├── Scan QR Code Tab (Live Camera Viewfinder, Flip/Torch Controls, Image File Upload Scanner, Sample QR Simulation)
│   │   └── Scanned Contact Card Modal (Profile Details, Add Contact, Start Chat, Voice/Video Call)
│   ├── Contact Sync & Import Modal (Native Picker / vCard .vcf Import / QR Entry / Permission Prompt)
│   ├── Chat Room (Text, Voice Notes, Media, Song Cards, Call Recording Memos, Background Sync Queue)
│   ├── Incoming Call Overlay (Swipe-to-Answer / Decline)
│   ├── Call Screen (Voice & Video Streams, In-Call Audio Recording)
│   ├── Call History & Logs
│   ├── Group Voice Rooms
│   │   ├── Voice Room Discovery List
│   │   ├── Create Voice Room
│   │   └── Live Voice Room Stage (BGM Broadcast, Trivia Quiz, Coin Lucky Wheel)
│   └── Contact List (Matched Users & Unregistered Invite List)
├── AI Music Studio
│   ├── Studio Generator (Prompt, Genres, Mood, Lyrics)
│   ├── Track Details & Audio Player (Waveform, Lyrics Sheet)
│   ├── Stem Separation Mixer & Stem Downloader (Vocals, Beat, Bassline)
│   ├── Custom Cover Art Generator
│   └── Generated Tracks Library & Offline Downloaded Playlist
├── Wallet Hub
│   ├── Wallet Balance Display
│   ├── Multi-Channel Top-Up (M-Pesa, MTN MoMo, Orange Money, Card)
│   └── Transaction History & Offline Sync Logs
├── Business Hub
│   ├── Business Profile Page (with Brand Soundtrack Player)
│   └── Product / Service Catalog
└── Profile & Settings
    ├── User Profile (My QR Code Action Entry, Account Switcher Entry)
    ├── Offline Video Storage Management Section (Space Meter, Clear Storage)
    ├── Download Quality Preferences (Default Quality Tier Selector)
    ├── Network Preferences & Data Saver Toggle
    ├── Global Logout Action
    └── PWA Install Prompt / Status
```

### 3.2 Page Functional Descriptions

#### 3.2.1 Global Network & Session Resilience Module
- Network Status Monitor & Latency Display: Displays real-time connection state indicator (Wi-Fi, 5G, 4G, 3G, 2G, or Offline) and ping latency in milliseconds across the global header.
- Data Saver Mode Switcher: Toggle control enabling low-bandwidth mode to compress image previews, restrict auto-play videos, and stream lower-bitrate audio on constrained cellular connections.
- Cross-Network Background Sync Queue: Stores pending messages, media uploads, profile edits, and balance adjustments locally when offline or on weak networks, automatically flushing and synchronizing data when reconnected.
- Multi-Tab Session Synchronization: Utilizes browser BroadcastChannel to instantly synchronize authentication tokens, profile role changes, wallet balances, and active playback states across all open tabs and windows in real time.

#### 3.2.2 Global Authentication & Account Switcher Module
- Unified Authentication Modal: Entry point for login and registration via email, phone number, or password credentials.
- Resilient Persistent Storage: Stores authenticated tokens and session state in browser persistent storage with automatic token revalidation and restoration across network changes.
- Demo Account Quick Switcher: One-tap instant login buttons allowing users to switch among preconfigured demo profiles (Creator, Business, Nomad) without manual credentials, broadcasting updates to all open tabs.
- Universal Single Sign-On Access: Grants persistent access to all core modules without re-authentication challenges.
- Global Logout Action: Clears session credentials locally and broadcasts a logout event across all open tabs to return all windows to guest state.

#### 3.2.3 Global Floating Mini Audio Player
- Persistent Mini-Player Bar: Docks above the bottom navigation bar and persists across views and tabs, supporting playback of streamed and locally cached offline tracks.
- Playback Controls: Displays current track thumbnail, title, genre badge, live frequency equalizer bars, play/pause toggle, and skip controls.
- Expand Action: Opens full track view with dynamic waveform and lyrics sheet.

#### 3.2.4 Video Feed Module
- Video Player & Feed: Vertical feed of short-form videos with playback controls, soundtrack metadata, and dynamic adaptation based on network bandwidth and Data Saver settings.
- Download Quality Selection Modal: Modal or selector triggered during download actions offering three quality tiers: Standard (480p / Data Saver, ~3.2MB), High (720p / Balanced, ~7.5MB), and Ultra (1080p / Crisp, ~15MB), with clear estimated file size and storage savings percentage relative to Ultra tier.
- One-Tap Flight / Offline Download: Action button on each video card to download video media and metadata at the selected quality tier to local client storage, displaying real-time download progress and an offline-ready badge with downloaded resolution tag.
- Flight Mode / Offline Videos Tab: Dedicated filter and tab in the video feed to browse, scroll, and watch cached videos full-screen without network connectivity, showing resolution tags (480p, 720p, 1080p) on each saved item.
- Batch Download Action: [Download Top 5 Videos for Flight] button allowing users to batch-download the top 5 trending feed videos in sequence using the configured download quality tier with total estimated storage footprint displayed.
- Offline Video Storage Management: Storage meter displaying total disk space occupied by cached videos, accompanied by individual deletion controls and a [Clear All Cached Videos] option.
- Auto-Fallback Playback: Automatically switches playback to cached local video streams when offline or in airplane mode without buffering stalls or error screens.
- Video & Photo Upload: Live recording or file selection, auto-populating AI soundtrack metadata, and queuing posts for background sync when disconnected.

#### 3.2.5 AI Music Studio Module
- Studio Generator: Accepts natural language prompts, genre selection, mood selection, and structured lyrics to generate playable audio tracks.
- Track Details & Audio Player: Interactive audio player with dynamic waveform, time slider, formatted lyrics, offline download toggle, and direct sharing actions.
- Stem Separation Mixer & Downloader: Splits generated tracks into Vocals, Beat, and Bassline channels with real-time volume faders, mute/solo toggles, and direct file download options.
- Custom Cover Art Generator: Generates visual artwork based on text prompts and style presets.
- Generated Tracks Library & Offline Playlist: Lists user-created and downloaded tracks with offline indicators, continuous queue playback, and file export.

#### 3.2.6 Chats & Calls Module
- Conversation List: Displays active chat threads with snippet previews, unread badges, timestamps, offline cached indicators, a direct QR Code scanner icon, and a Sync Phone Contacts header action.
- New Chat Modal: Search bar, contact list, Sync Phone Contacts entry, and Scan QR shortcut.
- QR Code Hub:
  - My QR Code Tab: Displays user unique KAMATELA contact QR code card (avatar, display name, handle, phone number, business badge) with [Save / Download QR] and [Share QR] buttons.
  - Scan QR Code Tab: Live camera scanner with camera flip toggle, torch toggle, image file upload scanner fallback, and sample contact QR selector.
  - Scanned Contact Card Modal: Displays scanned profile details with [Add Contact], [Start Chat], and [Voice / Video Call] actions.
- Contact Sync & Import Modal:
  - Permission Prompt: Requests contact access confirmation.
  - Native Contact Picker Integration: Triggers browser Contact Picker API on supported browsers.
  - vCard (.vcf) File Import Fallback: Address book file upload parser for unsupported browsers.
  - Contact Matching Display: Separates imported contacts into Matched KAMATELA Users (with direct Chat action) and Non-Registered Contacts (with direct SMS/WhatsApp invite actions).
- Chat Room:
  - Messaging: Supports text messages, images, captured video clips, and inline voice notes.
  - Offline Storage & Sync Queue: Displays local pending status icons for queued messages and automatically syncs them upon network recovery.
  - Playable AI Song Card: Embedded message bubble with track cover, title, genre badge, and inline audio playback controls.
  - Call Recording Memos: Auto-saved voice recording memo bubbles created during voice/video calls with inline playback.
- Incoming Call Overlay: Interactive simulation banner featuring caller details, call type (voice/video), and swipe-to-answer or swipe-to-decline controls.
- Call Screen: One-on-one voice or video calling interface with camera toggle, microphone mute, call timer, real-time audio visualizer, and an In-Call Audio Recording button.
- Call History & Logs: Chronological log of call records with type, participant, timestamp, duration, status, and linked audio recording memos.
- Group Voice Rooms:
  - Discovery & Creation: Active voice room list and room creation modal.
  - Live Voice Room Stage: Audio room supporting speaker queue, soundwave indicators, background music broadcast, and stage mini-games (Trivia Quiz and Coin Lucky Wheel).
- Contact List: Displays saved and synced contacts with triggers for chat, call, or room invitation.

#### 3.2.7 Wallet Hub Module
- Wallet Balance Display: Shows current available balance and quick actions, synchronized across tabs.
- Multi-Channel Top-Up: Form interface supporting M-Pesa, MTN MoMo, Orange Money, and Card deposits.
- Transaction History: Chronological list of deposits, mini-game reward credits, and balance changes with offline submission queue status.

#### 3.2.8 Business Hub Module
- Business Profile: Public business profile displaying contact details, category, location, description, and an official Brand Soundtrack player.
- Catalog: Management interface for product/service catalog items with pricing, description, and media attachments.

#### 3.2.9 Profile & Settings Module
- User Profile: Displays user details, avatar, account type toggle (Personal / Business), My QR Code trigger, Demo Account Switcher entry, and saved content.
- Download Quality Settings: Selector for default offline video download quality (Standard 480p / High 720p / Ultra 1080p) persisted in user local preferences.
- Offline Video Storage Management: Displays total storage space consumed by downloaded flight videos with options to delete individual items or clear all cached videos.
- Network & Data Preferences: Network status diagnostics, ping monitor, and Data Saver mode toggle.
- Global Logout Action: Clears active user session across all open tabs.
- PWA Installation: Prompts for browser home screen installation.

## 4. Business Rules and Core Logic
1. Multi-Network SSO Persistence and Token Resilience:
   - Authentication tokens and session credentials persist across network state transitions, including transitions between Wi-Fi, 5G/4G, 3G/2G, captive portals, roaming networks, and offline mode.
   - Network reconnects trigger non-blocking background token verification without logging out the user or interrupting the active view.
2. Multi-Tab Session Synchronization:
   - Changes to authentication state, user identity role, demo account switches, and wallet balance are broadcast across open browser tabs via BroadcastChannel.
   - Logging out in one tab immediately updates all active tabs to the unauthenticated state.
3. Network Quality Monitoring and Adaptive Data Saver:
   - The application monitors active network connection type and latency. When latency exceeds predefined thresholds or network degrades to 2G/3G, Data Saver recommendations are surfaced.
   - When Data Saver mode is active, video feeds serve compressed low-resolution streams and audio streams switch to compressed formats.
4. Offline Video Quality Selection and Storage Management:
   - Users can choose among three quality tiers for offline video downloads:
     - Standard (480p / Data Saver): ~3.2MB estimated per video (~78% storage savings vs. Ultra).
     - High (720p / Balanced): ~7.5MB estimated per video (~50% storage savings vs. Ultra).
     - Ultra (1080p / Crisp): ~15MB estimated per video (baseline full resolution).
   - The chosen quality preference is persisted locally and applied as the default for single downloads and batch downloads unless changed.
   - Saved videos store and display their downloaded resolution badge (e.g., [480p], [720p], [1080p]) in both the card preview and the Flight Mode view.
   - Tapping [Save for Flight / Offline] downloads the selected quality payload and metadata into client offline storage, updating the card download state to completed.
   - Executing [Download Top 5 Videos for Flight] enqueues and caches the top 5 feed videos consecutively at the selected quality tier with aggregated size estimation.
   - When zero connectivity or offline status is detected, the video feed automatically falls back to locally cached video streams in the Flight Mode / Offline Videos view.
   - Deleting a cached video releases occupied storage space immediately and updates the storage meter.
5. Background Sync Queue & Reconnection Handling:
   - Outgoing messages, top-up requests, profile edits, and media posts initiated while offline or experiencing network drops are placed in a persistent client sync queue.
   - Upon restoration of a stable network connection, queued actions are dispatched in chronological order, updating message statuses from pending to sent.
6. QR Code Generation & Decoding:
   - Each user account encodes a contact payload into a standardized QR code (user ID, handle, display name, phone number, business status).
   - Scanning a valid payload via camera or file upload triggers the Scanned Contact Card modal with direct contact, chat, and call actions.
7. Contact Sync and Phone Matching:
   - Syncing contacts triggers native Contact Picker API if supported; otherwise, fallback vCard (.vcf) import is provided.
   - Normalized phone numbers are queried against registered users. Matched users display direct Chat actions; unmatched contacts display Invite actions.
8. Persistent & Offline Audio Playback:
   - Track playback continues across view navigation and tab backgrounding via the floating mini-player.
   - Locally cached tracks and stems play directly from client storage without active network connectivity.
9. Chat Offline Storage & Sync:
   - Conversation histories, voice notes, song cards, and call memos are cached locally for offline viewing and playback.
10. Incoming Call Gestures & In-Call Recording:
    - Incoming call overlay supports swipe-to-answer and swipe-to-decline gestures.
    - In-call recording captures audio and automatically compiles and posts a Call Recording Memo bubble into the conversation thread.
11. Stage Mini-Games Logic:
    - Trivia Quiz: Host launches timed rounds, participant answers are scored immediately, and results update on the live stage leaderboard.
    - Coin Lucky Wheel: Spin outcomes calculate reward credits and log entries directly to participant wallet history.
12. Multi-Channel Wallet Funding:
    - Top-up submissions via M-Pesa, MTN MoMo, Orange Money, or Card update wallet balance and record transactions. Offline top-up submissions remain queued until network reconnects.
13. Stem Separation & Export:
    - Track separation produces Vocals, Beat, and Bassline channels with independent volume faders and individual stem file downloads.

## 5. Exceptions and Edge Cases

| Scenario | Condition | Handling |
| :--- | :--- | :--- |
| Offline Video Download Interrupted | Network disconnects during an individual or batch video download | Pause download, display partial download alert, and automatically resume when network is restored |
| Video Storage Full | Browser storage limit reached during offline video saving | Display storage full notification and prompt user to switch to a lower quality tier or delete existing cached videos |
| Network Drop During Message Send | Network disconnects while transmitting a chat message or media | Mark message status as queued/pending, store in local sync queue, and auto-dispatch upon reconnect |
| Network Switch Mid-Stream | Connection switches between Wi-Fi and Cellular during audio/video playback | Maintain playback buffer seamlessly without re-authenticating or restarting playback |
| Captive Portal / Restricted Wi-Fi | Wi-Fi connected without internet access | Keep cached session active, display offline/limited connection indicator, and defer network sync |
| Demo Account Switch Across Multiple Tabs | User switches demo account in Tab A while Tab B is open | Tab B listens via BroadcastChannel, instantly updates avatar, identity, and role permissions without full reload |
| Storage Token Corruption | Local authentication token data is unreadable or malformed | Clear local token, broadcast reset event to all tabs, and display the Authentication Modal |
| Camera Scanner Permission Denied | User blocks browser camera access for QR scanning | Show permission banner and enable image file upload fallback or sample QR simulation |
| Invalid QR Code Decoded | Scanned QR code contains unrecognized data format | Display an invalid QR error banner and keep the scanner active |
| Contact Picker API Unsupported | Browser does not implement navigator.contacts | Prompt user to upload a vCard (.vcf) file or use QR scanner |
| Hardware Permission Denied | User blocks microphone or camera access for calling | Display permission error prompt and abort call initialization |
| Call Disconnected Unexpectedly | Call drops due to network failure | Terminate call view, save recorded audio buffer up to drop point as a memo in chat, and mark call status as dropped |
| Incomplete Top-Up Form | User submits top-up without selecting channel or entering amount | Highlight invalid fields and prevent form submission |

## 6. Acceptance Criteria
1. Users can select among Standard (480p), High (720p), and Ultra (1080p) download quality tiers, with estimated file sizes and savings displayed for each tier.
2. User download quality preferences are persisted and applied across single and batch flight video downloads.
3. Downloaded videos in the Flight Mode / Offline Videos tab display their respective downloaded resolution badge (480p, 720p, or 1080p).
4. Users can download individual feed videos via the one-tap [Save for Flight / Offline] button and view download completion indicators.
5. Users can trigger [Download Top 5 Videos for Flight] to batch-cache top feed videos at the chosen quality tier for offline viewing.
6. The Flight Mode / Offline Videos tab displays all locally stored videos and allows smooth full-screen playback with zero internet connectivity.
7. Offline video storage management displays total storage space used and allows deleting individual videos or clearing all cached videos.
8. Users maintain valid authenticated sessions across network transitions (Wi-Fi, 5G/4G, 3G/2G, captive network, and offline) without unexpected logout prompts.
9. Messages and actions created while offline are queued locally and automatically synchronized upon network reconnection.
10. Switching demo accounts or logging out in one browser tab updates all other open tabs in real time via BroadcastChannel.
11. Users can generate, download, share, and scan KAMATELA Contact QR codes via live camera or image file upload.
12. Users can sync device contacts via Contact Picker API or vCard (.vcf) file import and view matched versus unregistered contacts.
13. Cached chat threads, voice notes, call recording memos, and downloaded AI music tracks remain accessible and playable when completely offline.
14. Users can perform multi-channel wallet top-ups (M-Pesa, MTN MoMo, Orange Money, Card) with updated balance reflection.

## 7. Out of Scope for Current Phase
1. Third-party OAuth authentication providers (Apple ID, GitHub OAuth, Facebook Login).
2. Background continuous automatic contact address book syncing without user-initiated trigger.
3. Multi-party video conference grid (beyond one-on-one video calls).
4. Multi-track DAW manual timeline editing.
5. Real-world bank wire payouts and automated tax invoicing.