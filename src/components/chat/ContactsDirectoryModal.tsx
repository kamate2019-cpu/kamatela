import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  QrCode,
  MessageSquare,
  PhoneCall,
  Video,
  Share2,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Plus,
  Upload,
  Camera,
  X,
  BadgeCheck,
  Building,
  UserCheck,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User } from '@/types/kamatela';
import {
  isContactPickerSupported,
  pickNativeContacts,
  matchContactsWithUsers,
  sampleDeviceAddressBook,
  getSmsInviteUrl,
  getChatInviteUrl,
  type DeviceContact,
  type SyncResult,
} from '@/utils/contactSync';

interface ContactsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onStartChatWithUser: (user: User) => void;
  onStartCallWithUser?: (user: User, isVideo?: boolean) => void;
  onOpenQR?: () => void;
  blockedUserIds?: string[];
  onBlockUser?: (userId: string, reason?: string) => void;
  onUnblockUser?: (userId: string) => void;
}

export const ContactsDirectoryModal: React.FC<ContactsDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartChatWithUser,
  onStartCallWithUser,
  onOpenQR,
  blockedUserIds = [],
  onBlockUser,
  onUnblockUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'on_kamatela' | 'invite' | 'blocked'>('all');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState('Hey there! I am using KAMATELA.');

  // Persistent Custom Contacts
  const [customContacts, setCustomContacts] = useState<DeviceContact[]>(() => {
    try {
      const saved = localStorage.getItem('kamatela_custom_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [syncResult, setSyncResult] = useState<SyncResult>(() => {
    return matchContactsWithUsers([...sampleDeviceAddressBook, ...customContacts]);
  });

  // Re-sync whenever custom contacts change
  useEffect(() => {
    const combined = [...sampleDeviceAddressBook, ...customContacts];
    setSyncResult(matchContactsWithUsers(combined));
    try {
      localStorage.setItem('kamatela_custom_contacts', JSON.stringify(customContacts));
    } catch (e) {
      console.error(e);
    }
  }, [customContacts]);

  if (!isOpen) return null;

  // Handle Add New Contact
  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }

    const createdUser: User = {
      id: `contact_user_${Date.now()}`,
      name: newName.trim(),
      handle: `@${newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: newStatus.trim() || 'Hey there! I am using KAMATELA.',
      coins: 400,
      businessPhone: newPhone.trim(),
      businessEmail: newEmail.trim() || undefined,
      verified: true,
      isBusiness: false,
      followersCount: 12,
      followingCount: 8,
      likesCount: 35,
    };

    const newContactItem: DeviceContact = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      tel: newPhone.trim(),
      email: newEmail.trim() || undefined,
      matchedUser: createdUser,
    };

    setCustomContacts((prev) => [newContactItem, ...prev]);
    toast.success(`Contact added: ${newName.trim()}`);
    setIsAddContactOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  // Filter contacts
  const query = searchQuery.trim().toLowerCase();

  const filteredMatched = syncResult.matched.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.tel.includes(query) ||
      c.matchedUser?.handle.toLowerCase().includes(query)
  );

  const filteredUnregistered = syncResult.unregistered.filter(
    (c) => c.name.toLowerCase().includes(query) || c.tel.includes(query)
  );

  const totalContactsCount = filteredMatched.length + filteredUnregistered.length;

  const handleNativeSync = async () => {
    if (isContactPickerSupported()) {
      const picked = await pickNativeContacts();
      if (picked && picked.length > 0) {
        setCustomContacts((prev) => [...picked, ...prev]);
        toast.success(`Synced ${picked.length} contacts from your phone!`);
        return;
      }
    }
    toast.info('Loaded device contacts and KAMATELA friends!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
        {/* KAMATELA Chat-Style Emerald Top App Bar */}
        <div className="p-4 border-b border-border/70 bg-gradient-to-r from-emerald-950/80 via-card to-teal-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Users className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Select Contact
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {filteredMatched.length} on KAMATELA
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {totalContactsCount} total contacts in address book
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNativeSync}
              className="h-8 px-2.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold rounded-xl"
              title="Sync Phone Contacts"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1" /> Sync
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border/50 bg-muted/20">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name, handle, or phone..."
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* KAMATELA Chat Action Buttons Header: New Group, New Contact, QR Code */}
        <div className="p-3 border-b border-border/40 grid grid-cols-3 gap-2 bg-muted/10 text-xs">
          <button
            type="button"
            onClick={() => setIsAddContactOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px]">New Contact</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredMatched[0]?.matchedUser) {
                onStartChatWithUser(filteredMatched[0].matchedUser);
                toast.success('Started new group chat!');
                onClose();
              }
            }}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px]">New Group</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenQR?.();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-bold text-[11px]">QR Code</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pt-2.5 pb-2 border-b border-border/40 flex items-center gap-1.5 text-xs overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground bg-muted/40'
            }`}
          >
            All ({totalContactsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('on_kamatela')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              activeTab === 'on_kamatela'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground bg-muted/40'
            }`}
          >
            On KAMATELA ({filteredMatched.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              activeTab === 'invite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground bg-muted/40'
            }`}
          >
            Invite ({filteredUnregistered.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blocked')}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              activeTab === 'blocked'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-rose-400 bg-muted/40'
            }`}
          >
            Blocked ({blockedUserIds.length})
          </button>
        </div>

        {/* Contacts Directory List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-4">
          {/* SECTION 1: Registered Contacts on KAMATELA & Blocked */}
          {(activeTab === 'all' || activeTab === 'on_kamatela' || activeTab === 'blocked') && (
            <div className="space-y-2">
              <div className="px-2 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>
                  {activeTab === 'blocked'
                    ? `Blocked Contacts (${blockedUserIds.length})`
                    : `Contacts on KAMATELA (${filteredMatched.length})`}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {activeTab === 'blocked' ? 'Privacy & Safety' : 'Free Calls & Chats'}
                </span>
              </div>

              {filteredMatched.filter((c) => {
                if (activeTab === 'blocked') {
                  return c.matchedUser && blockedUserIds.includes(c.matchedUser.id);
                }
                return true;
              }).length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-muted/20 border border-border/50 text-xs text-muted-foreground">
                  {activeTab === 'blocked'
                    ? 'No blocked contacts. You can block any contact from chat options.'
                    : 'No matching registered contacts found.'}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredMatched
                    .filter((c) => {
                      if (activeTab === 'blocked') {
                        return c.matchedUser && blockedUserIds.includes(c.matchedUser.id);
                      }
                      return true;
                    })
                    .map((c) => {
                    const u = c.matchedUser;
                    if (!u) return null;
                    const isBlocked = blockedUserIds.includes(u.id);
                    return (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                          isBlocked
                            ? 'bg-rose-500/5 border-rose-500/30'
                            : 'bg-card hover:bg-muted/50 border-border/60'
                        }`}
                      >
                        {/* Avatar & Info */}
                        <div
                          onClick={() => {
                            onStartChatWithUser(u);
                            onClose();
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className={`relative w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 shadow-sm ${
                            isBlocked ? 'border-rose-500 opacity-60' : 'border-emerald-500'
                          }`}>
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            {!isBlocked && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-background shadow-sm" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-bold truncate transition-colors ${
                                isBlocked ? 'text-rose-300' : 'text-foreground group-hover:text-emerald-400'
                              }`}>
                                {u.name}
                              </h4>
                              {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              {isBlocked && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                                  BLOCKED
                                </span>
                              )}
                              {u.isBusiness && !isBlocked && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  BIZ
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate font-mono">
                              {c.tel} {u.handle ? `• ${u.handle}` : ''}
                            </p>
                            <p className="text-[10px] text-foreground/80 truncate italic">
                              "{u.bio || 'Hey there! I am using KAMATELA.'}"
                            </p>
                          </div>
                        </div>

                        {/* Quick Action Buttons: Chat, Audio Call, Video Call, Block/Unblock */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isBlocked ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onUnblockUser?.(u.id);
                                toast.success(`Unblocked ${u.name}`);
                              }}
                              className="h-8 px-2.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Unblock
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  onStartChatWithUser(u);
                                  onClose();
                                }}
                                className="h-8 w-8 p-0 rounded-full text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                title="Chat on KAMATELA"
                              >
                                <MessageSquare className="w-4 h-4 fill-current" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  onStartCallWithUser?.(u, false);
                                  onClose();
                                }}
                                className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                                title="Voice Call"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  onStartCallWithUser?.(u, true);
                                  onClose();
                                }}
                                className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:bg-purple-500/10 hover:text-purple-400"
                                title="Video Call"
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  onBlockUser?.(u.id, 'Blocked from Contacts directory');
                                  toast.success(`Blocked ${u.name}`);
                                }}
                                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
                                title="Block this contact"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Invite Friends to KAMATELA */}
          {(activeTab === 'all' || activeTab === 'invite') && (
            <div className="space-y-2 pt-2">
              <div className="px-2 flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Invite to KAMATELA ({filteredUnregistered.length})</span>
                <span className="text-[10px] text-cyan-400 font-medium">Free Invite SMS / Link</span>
              </div>

              {filteredUnregistered.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-muted/20 border border-border/50 text-xs text-muted-foreground">
                  All address book contacts are already registered on KAMATELA!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredUnregistered.map((c) => {
                    const initials = c.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/50 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0 border border-border shadow-sm">
                            {initials || 'C'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{c.name}</h4>
                            <p className="text-[11px] text-muted-foreground truncate font-mono">{c.tel}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Not on KAMATELA yet</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={getChatInviteUrl(c.tel, currentUser.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-3 text-[11px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Share2 className="w-3 h-3" /> Invite
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Contact Modal Drawer */}
        {isAddContactOpen && (
          <div className="p-4 border-t border-border/80 bg-card space-y-3 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-400" /> Add New Contact
              </h4>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleAddNewContact} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contact Name (e.g. John Doe)"
                  className="h-8 text-xs bg-muted/50 border-border"
                />
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone (e.g. +1 555-019-2834)"
                  className="h-8 text-xs bg-muted/50 border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email (Optional)"
                  className="h-8 text-xs bg-muted/50 border-border"
                />
                <Input
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="About / Status Headline"
                  className="h-8 text-xs bg-muted/50 border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm"
              >
                Save Contact to KAMATELA
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
