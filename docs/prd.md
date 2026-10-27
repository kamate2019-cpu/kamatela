# Requirements Document

## 1. Application Overview
- Application Name: KAMATELA
- Description: A mobile-first Progressive Web Application (PWA) with multi-network connection resiliency and universal persistent single sign-on across all network conditions (Wi-Fi, 5G/4G, 3G/2G, roaming, and offline). The application integrates real-time communication, live streaming with dual co-host split-screen broadcasting, short-form video discovery with offline flight saving and playback (with selectable download quality tiers to optimize storage), direct voice and video calling with in-call recording memos, personal QR code profile exchange, contact synchronization, multi-participant group voice rooms with stage mini-games, an AI Music Generation Studio with stem separation, continuous audio playback with a persistent floating mini player, multi-channel mobile money wallet top-ups, cross-network background sync queuing, real-time network quality monitoring with Data Saver mode, and multi-tab session continuity via browser channels.

## 2. Users and Core Scenarios
- Target Users:
  - General Users & Creators: Individuals who log in once to seamlessly access videos, live streams, offline video playlists, chats, voice rooms, music studio, and wallet across sessions, tabs, and fluctuating network environments.
  - Live Stream Hosts & Co-Hosts: Broadcasters and guests who initiate live streams, send or receive co-host requests, and stream together in a synchronized split-screen view.
  - Business Users: Small business owners or creators who switch to business profiles, display business QR codes, showcase brand soundtracks, and manage product catalogs under persistent authenticated sessions.
- Core Scenarios:
  - Logging in once via email, phone, or one-tap demo account switcher and maintaining persistent authenticated access across all app modules, browser tabs, and network states.
  - Starting a live broadcast as a host, inviting viewers or accepting guest join requests, and streaming in a dual split-screen video layout.
  - Joining a live stream as a viewer, sending a request to go live with the host, managing mic and camera settings upon connection, and disconnecting at any time.
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
├── Video Feed & Live Broadcasts
│   ├── Video Player & Feed (Online Stream & Offline Auto-Fallback)
│   ├── Live Streaming Hub
│   │   ├── Live Stream Viewer (Single Host Stream, Viewer Chat, Request Co-Host Button)
│   │   ├── Go Live Studio (Title, Camera/Mic Controls, Start Broadcast)
│   │   ├── Host Co-Host Management Modal (Pending Guest Requests, Invite Viewers List)
│   │   ├── Dual Live Stage (Split-Screen Dual Video Feeds, Host & Co-Host Controls)
│   │   └── Guest Co-Host Controls (Mic Mute, Camera Toggle, Leave Co-Host Button)
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
- Data Saver Mode Switcher: Toggle control enabling low-bandwidth mode to compress image previews, restrict auto-play videos, and stream lower-bitrate media on constrained cellular connections.
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

#### 3.2.4 Video Feed & Live Streaming Module
- Video Player & Feed: Vertical feed of short-form videos with playback controls, soundtrack metadata, and dynamic adaptation based on network bandwidth and Data Saver settings.
- Live Stream Viewer: Displays active broadcast video, viewer count, live chat stream, and an interactive [Request Co-Host] button.
- Go Live Studio: Host setup interface with stream title input, camera flip, microphone toggle, and a [Start Live] action.
- Host Co-Host Management: Drawer or modal for the host listing incoming guest requests with [Accept] and [Decline] actions, as well as an active viewer list with [Invite to Co-Host] buttons.
- Dual Live Stage: Transitions the single broadcast view into a 50/50 vertical split-screen or side-by-side dual video layout when a co-host connects, displaying host feed on one pane and co-host feed on the other with synced audio streams.
- Co-Host In-Stream Controls:
  - Guest Controls: Floating toolbar with microphone mute/unmute, camera on/off, camera flip, and [Leave Stream] action.
  - Host Controls: Floating toolbar with host mic/camera toggles, [Disconnect Co-Host] action, and [End Broadcast] action.
- Download Quality Selection Modal: Modal triggered during video download offering three quality tiers: Standard (480p / Data Saver, ~3.2MB), High (720p / Balanced, ~7.5MB), and Ultra (1080p / Crisp, ~15MB), with estimated file sizes and storage savings.
- One-Tap Flight / Offline Download: Action button on video cards to cache media at the chosen quality tier to client storage with real-time progress and resolution badge.
- Flight Mode / Offline Videos Tab: Filter tab in the video feed to watch cached videos full-screen without network connectivity, showing resolution tags (480p, 720p, 1080p).
- Batch Download Action: [Download Top 5 Videos for Flight] button allowing users to batch-download trending feed videos in sequence using the configured quality tier.
- Offline Video Storage Management: Storage meter displaying disk space used by cached videos with individual deletion controls and a [Clear All Cached Videos] option.
- Auto-Fallback Playback: Automatically switches playback to cached local video streams when offline.
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
  - My QR Code Tab: Displays user unique KAMATELA contact QR code card (avatar, display name, handle, phone number, business badge) with download and share buttons.
  - Scan QR Code Tab: Live camera scanner with camera flip toggle, torch toggle, image file upload scanner fallback, and sample contact QR selector.
  - Scanned Contact Card Modal: Displays scanned profile details with direct actions to add contact, start chat, or place voice/video call.
- Contact Sync & Import Modal:
  - Permission Prompt: Requests contact access confirmation.
  - Native Contact Picker Integration: Triggers browser Contact Picker API on supported browsers.
  - vCard (.vcf) File Import Fallback: Address book file upload parser for unsupported browsers.
  - Contact Matching Display: Separates imported contacts into Matched KAMATELA Users (with direct Chat action) and Non-Registered Contacts (with invite actions).
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
1. Dual Live Co-Hosting Connection & Lifecycle:
   - Viewers can tap [Request Co-Host] while viewing an active live stream. The request is pushed to the host co-host management queue.
   - The host can also browse the viewer list and send a direct co-host invitation to any participant.
   - Once a request is accepted by the host or an invite is accepted by the guest, the stream seamlessly transitions from single-broadcaster mode to a split-screen dual video stage.
   - The guest stream initializes with camera and microphone active; the guest can mute/unmute audio or turn off video at any time.
   - If the guest taps [Leave Stream] or the host taps [Disconnect Co-Host], the co-host session terminates immediately, and the broadcast smoothly reverts to the single-host video layout without ending the main broadcast.
   - If the host taps [End Broadcast], the entire live stream ends for all participants and viewers.
2. Multi-Network SSO Persistence and Token Resilience:
   - Authentication tokens and session credentials persist across network state transitions, including transitions between Wi-Fi, 5G/4G, 3G/2G, captive portals, roaming networks, and offline mode.
   - Network reconnects trigger non-blocking background token verification without logging out the user or interrupting the active view.
3. Multi-Tab Session Synchronization:
   - Changes to authentication state, user identity role, demo account switches, and wallet balance are broadcast across open browser tabs via BroadcastChannel.
   - Logging out in one tab immediately updates all active tabs to the unauthenticated state.
4. Network Quality Monitoring and Adaptive Data Saver:
   - The application monitors active network connection type and latency. When latency exceeds predefined thresholds or network degrades to 2G/3G, Data Saver recommendations are surfaced.
   - When Data Saver mode is active, video feeds and live streams serve compressed lower-bitrate streams.
5. Offline Video Quality Selection and Storage Management:
   - Users can choose among three quality tiers for offline video downloads:
     - Standard (480p / Data Saver): ~3.2MB estimated per video (~78% storage savings vs. Ultra).
     - High (720p / Balanced): ~7.5MB estimated per video (~50% storage savings vs. Ultra).
     - Ultra (1080p / Crisp): ~15MB estimated per video (baseline full resolution).
   - The chosen quality preference is persisted locally and applied as the default for single downloads and batch downloads.
   - Saved videos store and display their downloaded resolution badge (480p, 720p, 1080p) in both the card preview and the Flight Mode view.
   - When zero connectivity or offline status is detected, the video feed automatically falls back to locally cached video streams in the Flight Mode / Offline Videos view.
   - Deleting a cached video releases occupied storage space immediately and updates the storage meter.
6. Background Sync Queue & Reconnection Handling:
   - Outgoing messages, top-up requests, profile edits, and media posts initiated while offline are placed in a persistent client sync queue.
   - Upon restoration of a stable network connection, queued actions are dispatched in chronological order.
7. QR Code Generation & Decoding:
   - Each user account encodes a contact payload into a standardized QR code (user ID, handle, display name, phone number, business status).
   - Scanning a valid payload via camera or file upload triggers the Scanned Contact Card modal with direct contact, chat, and call actions.
8. Contact Sync and Phone Matching:
   - Syncing contacts triggers native Contact Picker API if supported; otherwise, fallback vCard (.vcf) import is provided.
   - Normalized phone numbers are queried against registered users. Matched users display direct Chat actions; unmatched contacts display Invite actions.
9. Persistent & Offline Audio Playback:
   - Track playback continues across view navigation and tab backgrounding via the floating mini-player.
   - Locally cached tracks and stems play directly from client storage without active network connectivity.
10. Chat Offline Storage & Sync:
    - Conversation histories, voice notes, song cards, and call memos are cached locally for offline viewing and playback.
11. Incoming Call Gestures & In-Call Recording:
    - Incoming call overlay supports swipe-to-answer and swipe-to-decline gestures.
    - In-call recording captures audio and automatically compiles and posts a Call Recording Memo bubble into the conversation thread.
12. Stage Mini-Games Logic:
    - Trivia Quiz: Host launches timed rounds, participant answers are scored immediately, and results update on the live stage leaderboard.
    - Coin Lucky Wheel: Spin outcomes calculate reward credits and log entries directly to participant wallet history.
13. Multi-Channel Wallet Funding:
    - Top-up submissions via M-Pesa, MTN MoMo, Orange Money, or Card update wallet balance and record transactions. Offline top-up submissions remain queued until network reconnects.

## 5. Exceptions and Edge Cases

| Scenario | Condition | Handling |
| :--- | :--- | :--- |
| Co-Host Network Drop | Guest or host loses connectivity during dual live broadcast | Display connection reconnecting badge on the affected pane; if unrecovered within grace period, automatically revert stream to single-host layout |
| Co-Host Request Denied | Host declines a guest co-host join request | Notify the requesting viewer with a discreet toast and reset the [Request Co-Host] button state |
| Hardware Permission Denied During Co-Host | Guest accepts co-host invite but blocks camera/microphone access | Notify guest to enable browser media permissions and prevent split-screen initialization until granted |
| Offline Video Download Interrupted | Network disconnects during an individual or batch video download | Pause download, display partial download alert, and automatically resume when network is restored |
| Video Storage Full | Browser storage limit reached during offline video saving | Display storage full notification and prompt user to switch to a lower quality tier or delete existing cached videos |
| Network Drop During Message Send | Network disconnects while transmitting a chat message or media | Mark message status as queued/pending, store in local sync queue, and auto-dispatch upon reconnect |
| Network Switch Mid-Stream | Connection switches between Wi-Fi and Cellular during audio/video playback or live streaming | Maintain playback buffer seamlessly without re-authenticating or restarting playback |
| Demo Account Switch Across Multiple Tabs | User switches demo account in Tab A while Tab B is open | Tab B listens via BroadcastChannel, instantly updates avatar, identity, and role permissions without full reload |
| Storage Token Corruption | Local authentication token data is unreadable or malformed | Clear local token, broadcast reset event to all tabs, and display the Authentication Modal |
| Camera Scanner Permission Denied | User blocks browser camera access for QR scanning | Show permission banner and enable image file upload fallback or sample QR simulation |
| Incomplete Top-Up Form | User submits top-up without selecting channel or entering amount | Highlight invalid fields and prevent form submission |

## 6. Acceptance Criteria
1. Broadcasters can initiate a live broadcast from the Go Live Studio with functional camera and microphone feeds.
2. Viewers watching a live broadcast can tap [Request Co-Host] to submit a guest join request to the host.
3. The host can view pending co-host requests and incoming viewer lists, with functional [Accept], [Decline], and [Invite] actions.
4. When a co-host connects, the live stream layout smoothly transitions into a dual split-screen video display visible to host, guest, and viewers.
5. The connected guest can toggle their microphone mute state, toggle their camera on/off, and cleanly disconnect via [Leave Stream].
6. The host can disconnect the guest via [Disconnect Co-Host] to revert the broadcast to single-host mode, or tap [End Broadcast] to terminate the live stream entirely.
7. Users can select among Standard (480p), High (720p), and Ultra (1080p) download quality tiers for offline flight video downloads, with estimated file sizes and savings displayed.
8. The Flight Mode / Offline Videos tab displays all locally stored videos and allows smooth full-screen playback with zero internet connectivity.
9. Offline video storage management displays total storage space used and allows deleting individual videos or clearing all cached videos.
10. Users maintain valid authenticated sessions across network transitions (Wi-Fi, 5G/4G, 3G/2G, captive network, and offline) without unexpected logout prompts.
11. Messages and actions created while offline are queued locally and automatically synchronized upon network reconnection.
12. Switching demo accounts or logging out in one browser tab updates all other open tabs in real time via BroadcastChannel.
13. Users can generate, download, share, and scan KAMATELA Contact QR codes via live camera or image file upload.
14. Users can sync device contacts via Contact Picker API or vCard (.vcf) file import and view matched versus unregistered contacts.
15. Cached chat threads, voice notes, call recording memos, and downloaded AI music tracks remain accessible and playable when completely offline.
16. Users can perform multi-channel wallet top-ups (M-Pesa, MTN MoMo, Orange Money, Card) with updated balance reflection.

## 7. Out of Scope for Current Phase
1. Multi-participant video grid exceeding two simultaneous video broadcasters in a single live stream.
2. Paid live stream ticketing and virtual gift item tipping animations.
3. Third-party OAuth authentication providers (Apple ID, GitHub OAuth, Facebook Login).
4. Multi-track DAW manual timeline editing in AI Music Studio.
5. Real-world bank wire payouts and automated tax invoicing.