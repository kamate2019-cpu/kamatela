import React from 'react';
import { Film, MessageSquare, ShieldCheck, User, Sparkles, Music } from 'lucide-react';
import type { TabType } from '@/types/kamatela';

interface BottomTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadChatsCount?: number;
  onOpenUpload?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onChangeTab,
  unreadChatsCount = 0,
}) => {
  const tabs = [
    {
      id: 'business' as TabType,
      label: 'iCenter',
      icon: ShieldCheck,
    },
    {
      id: 'chats' as TabType,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadChatsCount,
    },
    {
      id: 'feed' as TabType,
      label: 'Streams',
      icon: Film,
    },
    {
      id: 'studio' as TabType,
      label: 'AI Music',
      icon: Music,
      sparkle: true,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {tab.sparkle && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                )}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
