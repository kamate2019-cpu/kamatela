import React, { useState } from 'react';
import { toast } from 'sonner';
import type { TabType, BusinessProduct, User, VideoItem, AIMusicTrack } from '@/types/kamatela';
import { useKamatelaStore, mockUsers } from '@/services/kamatelaStore';
import { AppHeader } from '@/components/common/AppHeader';
import { BottomTabBar } from '@/components/common/BottomTabBar';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { VideoFeed } from '@/components/video/VideoFeed';
import { VideoUploadModal } from '@/components/video/VideoUploadModal';
import { ShareSongModal } from '@/components/music/ShareSongModal';
import { FloatingAudioPlayer } from '@/components/music/FloatingAudioPlayer';
import { CoinTopUpModal } from '@/components/wallet/CoinTopUpModal';
import { ChatModule } from '@/components/chat/ChatModule';
import { BusinessHub } from '@/components/business/BusinessHub';
import { ProfileView } from '@/components/profile/ProfileView';
import { MusicStudioView } from '@/components/music/MusicStudioView';
import { ProductDetailModal } from '@/components/business/ProductDetailModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { NetworkMonitorModal } from '@/components/common/NetworkMonitorModal';
import { LiveStreamPlayerModal } from '@/components/live/LiveStreamPlayerModal';
import { LiveBroadcastHostModal } from '@/components/live/LiveBroadcastHostModal';
import type { LiveStreamItem } from '@/types/kamatela';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeChatTargetId, setActiveChatTargetId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BusinessProduct | null>(null);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [shareSongTarget, setShareSongTarget] = useState<AIMusicTrack | null>(null);
  const [attachedVideoTrack, setAttachedVideoTrack] = useState<AIMusicTrack | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'switch'>('login');
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStreamItem | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const {
    user,
    setUser,
    isAuthenticated,
    login,
    logout,
    switchAccount,
    deductCoins,
    addCoins,
    transactions,
    addCallMemoToChat,
    videos,
    chats,
    stories,
    products,
    callLogs,
    voiceRooms,
    musicTracks,
    blockedUserIds,
    blockUser,
    unblockUser,
    reportUser,
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
    downloadTrackForOffline,
    removeDownloadedTrack,
    downloadedVideos,
    downloadQuality,
    setDownloadQuality,
    downloadVideoForFlight,
    removeDownloadedVideo,
    batchDownloadTopVideos,
    clearAllFlightVideos,
    toggleLikeVideo,
    addCommentToVideo,
    uploadVideo,
    sendMessage,
    addStory,
    addProduct,
    deleteProduct,
    startOrGetChatWithBusiness,
    liveStreams,
    addLiveStream,
  } = useKamatelaStore();

  const unreadChatsCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  // When tapping a product in video feed
  const handleOpenBusinessProduct = (
    productSnippet: NonNullable<VideoItem['linkedProduct']>,
    creator: User
  ) => {
    const fullProd = products.find((p) => p.id === productSnippet.id) || {
      id: productSnippet.id,
      businessId: creator.id,
      title: productSnippet.title,
      description: 'Featured catalog product on KAMATELA Streams.',
      price: productSnippet.price,
      currency: productSnippet.currency,
      category: 'Electronics',
      imageUrl: productSnippet.imageUrl,
      inStock: true,
      features: ['Official Verified Item', 'Available for WhatsApp Inquiry'],
    };
    setSelectedProduct(fullProd);
  };

  // When initiating chat with a business
  const handleStartBusinessChat = (businessUser: User, product?: BusinessProduct) => {
    const chatId = startOrGetChatWithBusiness(businessUser, product);
    setActiveChatTargetId(chatId);
    setActiveTab('chats');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased pb-20">
      {/* PWA Home Screen Install Banner */}
      <PwaInstallPrompt />

      {/* Top Super App Navigation Bar */}
      <AppHeader
        activeTab={activeTab}
        currentUser={user}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenPwaGuide={() => setShowPwaGuide(true)}
        onOpenTopUp={() => setIsTopUpModalOpen(true)}
        onOpenAuthModal={(mode = 'login') => {
          setAuthInitialMode(mode);
          setIsAuthModalOpen(true);
        }}
        onOpenNetworkMonitor={() => setIsNetworkModalOpen(true)}
        onOpenGoLive={() => setIsBroadcastModalOpen(true)}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 w-full px-2 sm:px-4 py-2">
        {activeTab === 'feed' && (
          <VideoFeed
            videos={videos}
            liveStreams={liveStreams}
            currentUser={user}
            onSelectLiveStream={(stream) => setSelectedLiveStream(stream)}
            onGoLive={() => setIsBroadcastModalOpen(true)}
            downloadedVideos={downloadedVideos}
            downloadQuality={downloadQuality}
            onSelectDownloadQuality={setDownloadQuality}
            onToggleLike={toggleLikeVideo}
            onAddComment={addCommentToVideo}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenBusinessProduct={handleOpenBusinessProduct}
            onOpenCreatorProfile={(creator) => {
              // Could navigate to creator profile or open chat
              handleStartBusinessChat(creator);
            }}
            onDownloadVideoForFlight={downloadVideoForFlight}
            onRemoveDownloadedVideo={removeDownloadedVideo}
            onBatchDownloadTopVideos={batchDownloadTopVideos}
            onClearAllFlightVideos={clearAllFlightVideos}
          />
        )}

        {activeTab === 'chats' && (
          <ChatModule
            chats={chats}
            stories={stories}
            callLogs={callLogs}
            voiceRooms={voiceRooms}
            musicTracks={musicTracks}
            currentUser={user}
            onDeductCoins={deductCoins}
            onAddCoins={addCoins}
            onSendMessage={sendMessage}
            onAddStory={addStory}
            onLogCall={addCallLog}
            onClearCallLogs={clearCallLogs}
            onCreateVoiceRoom={createVoiceRoom}
            onJoinVoiceRoom={joinVoiceRoom}
            onLeaveVoiceRoom={leaveVoiceRoom}
            onToggleVoiceRoomMute={toggleVoiceRoomMute}
            onRaiseHandInVoiceRoom={raiseHandInVoiceRoom}
            onPromoteVoiceParticipant={promoteParticipant}
            onDemoteVoiceParticipant={demoteParticipant}
            onSaveCallMemoToChat={addCallMemoToChat}
            initialChatId={activeChatTargetId}
            blockedUserIds={blockedUserIds}
            onBlockUser={blockUser}
            onUnblockUser={unblockUser}
            onReportUser={reportUser}
            onOpenProductDetail={(prodId) => {
              const p = products.find((item) => item.id === prodId);
              if (p) setSelectedProduct(p);
            }}
          />
        )}

        {activeTab === 'studio' && (
          <MusicStudioView
            tracks={musicTracks}
            currentUser={user}
            onGenerateTrack={generateAIMusicTrack}
            onUpdateTrackCover={updateTrackCover}
            onToggleLike={toggleLikeMusicTrack}
            onDownloadTrack={downloadTrackForOffline}
            onRemoveDownloadedTrack={removeDownloadedTrack}
            onUseInVideo={(track) => {
              setAttachedVideoTrack(track);
              setIsUploadOpen(true);
              toast.success(`Attached "${track.title}" to video soundtrack!`);
            }}
            onPlayInVoiceRoom={(track) => {
              setActiveTab('chats');
              toast.info(`Switched to Voice Rooms. You can broadcast "${track.title}" on stage!`);
            }}
            onShareToChat={(track) => {
              setShareSongTarget(track);
            }}
          />
        )}

        {activeTab === 'business' && (
          <BusinessHub
            products={products}
            currentUser={user}
            onAddProduct={addProduct}
            onDeleteProduct={deleteProduct}
            onStartBusinessChat={handleStartBusinessChat}
            musicTracks={musicTracks}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onUpdateUser={setUser}
            videos={videos}
            downloadedVideos={downloadedVideos}
            downloadQuality={downloadQuality}
            onSelectDownloadQuality={setDownloadQuality}
            products={products}
            onOpenPwaGuide={() => setShowPwaGuide(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSelectVideo={() => setActiveTab('feed')}
            onSelectProduct={(p) => setSelectedProduct(p)}
            transactions={transactions}
            onAddCoins={addCoins}
          />
        )}
      </main>

      {/* Floating Persistent Mini Audio Player across all tabs */}
      <FloatingAudioPlayer
        tracks={musicTracks}
        onOpenTrackDetails={() => setActiveTab('studio')}
      />

      {/* Sticky Bottom Tab Bar (Streams / Chats / Center + / Business / Profile) */}
      <BottomTabBar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'chats') {
            setActiveChatTargetId(null);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        unreadChatsCount={unreadChatsCount}
      />

      {/* Creator Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setAttachedVideoTrack(null);
        }}
        onUpload={(videoData) => {
          uploadVideo(videoData);
          setAttachedVideoTrack(null);
        }}
        products={products}
        attachedTrack={attachedVideoTrack}
      />

      {/* Share Track to Chat Modal */}
      <ShareSongModal
        track={shareSongTarget}
        chats={chats}
        isOpen={Boolean(shareSongTarget)}
        onClose={() => setShareSongTarget(null)}
        onConfirmShare={(chatId, customMsg, track) => {
          const durationStr = `${Math.floor(track.durationSeconds / 60)}:${(track.durationSeconds % 60).toString().padStart(2, '0')}`;
          sendMessage(chatId, customMsg, 'song', track.coverUrl, {
            songSnippet: {
              id: track.id,
              title: track.title,
              genre: track.genre,
              coverUrl: track.coverUrl,
              duration: durationStr,
            },
          });
          setActiveChatTargetId(chatId);
          setActiveTab('chats');
        }}
      />

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onInquireWhatsApp={(p) => {
          const seller =
            [mockUsers.zara, mockUsers.elena, mockUsers.marcus, user].find(
              (u) => u.id === p.businessId
            ) || mockUsers.zara;
          handleStartBusinessChat(seller, p);
        }}
        businessUser={[mockUsers.zara, mockUsers.elena, mockUsers.marcus, user].find(
          (u) => u.id === selectedProduct?.businessId
        )}
      />
      {/* Global Coin Top Up Modal */}
      <CoinTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        currentBalance={user.coins ?? 500}
        transactions={transactions}
        onTopUp={addCoins}
      />

      {/* Unified Single Sign-On (SSO) Authentication & Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        isAuthenticated={isAuthenticated}
        onLogin={login}
        onLogout={logout}
        onSwitchAccount={switchAccount}
        initialMode={authInitialMode}
      />

      {/* Cross-Network Diagnostics, Latency Monitor & Data Saver Modal */}
      <NetworkMonitorModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* Interactive Live Stream Video Player Modal */}
      <LiveStreamPlayerModal
        stream={selectedLiveStream}
        currentUser={user}
        isOpen={Boolean(selectedLiveStream)}
        onClose={() => setSelectedLiveStream(null)}
        onDeductCoins={deductCoins}
        onAddCoins={addCoins}
        onOpenProduct={(prod, host) => handleOpenBusinessProduct(prod, host)}
      />

      {/* Live Host Broadcasting Studio Modal */}
      <LiveBroadcastHostModal
        currentUser={user}
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onStartStream={(stream) => {
          addLiveStream(stream);
        }}
      />
    </div>
  );
};
export default HomePage;
