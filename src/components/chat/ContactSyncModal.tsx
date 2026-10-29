import React, { useState, useRef } from 'react';
import {
  Users,
  Smartphone,
  Upload,
  MessageSquare,
  Share2,
  CheckCircle2,
  Search,
  Sparkles,
  PhoneCall,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User } from '@/types/kamatela';
import {
  isContactPickerSupported,
  pickNativeContacts,
  parseVCardText,
  matchContactsWithUsers,
  sampleDeviceAddressBook,
  getSmsInviteUrl,
  getChatInviteUrl,
  type DeviceContact,
  type SyncResult,
} from '@/utils/contactSync';

interface ContactSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onStartChatWithUser: (user: User) => void;
  onStartCallWithUser?: (user: User) => void;
  onOpenQR?: () => void;
}

export const ContactSyncModal: React.FC<ContactSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartChatWithUser,
  onStartCallWithUser,
  onOpenQR,
}) => {
  const [activeTab, setActiveTab] = useState<'matched' | 'unregistered'>('matched');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult>(() =>
    matchContactsWithUsers(sampleDeviceAddressBook)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Native Contact Picker Trigger
  const handleNativeSync = async () => {
    setIsSyncing(true);
    try {
      if (isContactPickerSupported()) {
        const picked = await pickNativeContacts();
        if (picked.length > 0) {
          const result = matchContactsWithUsers(picked);
          setSyncResult(result);
          toast.success(
            `Successfully synced ${picked.length} contacts! Found ${result.matched.length} on KAMATELA.`
          );
        } else {
          toast.info('No contacts selected');
        }
      } else {
        // Fallback to sample address book with informative notice
        toast.info(
          'Contact Picker API is restricted on desktop. Loading sample phone address book with instant matches!'
        );
        const result = matchContactsWithUsers(sampleDeviceAddressBook);
        setSyncResult(result);
      }
    } catch (err: any) {
      console.warn('Native contact sync failed, using sample address book:', err);
      toast.info('Falling back to local address book simulation');
      const result = matchContactsWithUsers(sampleDeviceAddressBook);
      setSyncResult(result);
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. vCard (.vcf) File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseVCardText(text);
        if (parsed.length > 0) {
          const result = matchContactsWithUsers(parsed);
          setSyncResult(result);
          toast.success(
            `Imported ${parsed.length} contacts from .vcf! Found ${result.matched.length} on KAMATELA.`
          );
        } else {
          toast.error('No valid contacts found in this .vcf file');
        }
      }
      setIsSyncing(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read address book file');
      setIsSyncing(false);
    };
    reader.readAsText(file);
  };

  // Filter contacts by search query
  const filteredMatched = syncResult.matched.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tel.includes(searchQuery) ||
      (c.matchedUser && c.matchedUser.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUnregistered = syncResult.unregistered.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.tel.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-3 bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Phone Contacts & Friends
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  W3C Ready
                </span>
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Sync contacts to find friends already on KAMATELA or send quick invites
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Sync Trigger Action Bar */}
        <div className="p-4 bg-muted/20 border-b border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Native Contact Picker Button */}
            <Button
              onClick={handleNativeSync}
              disabled={isSyncing}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold h-9 gap-1.5 shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              {isSyncing ? 'Accessing Contacts...' : 'Sync Device Contacts'}
            </Button>

            {/* vCard .vcf File Import Button */}
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSyncing}
              className="text-xs h-9 gap-1.5 border border-border hover:bg-muted text-foreground"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              Import .VCF
            </Button>

            {/* Scan Contact QR Button */}
            {onOpenQR && (
              <Button
                variant="ghost"
                onClick={onOpenQR}
                className="text-xs h-9 gap-1.5 border border-purple-500/40 hover:bg-purple-500/10 text-purple-400"
              >
                <QrCode className="w-4 h-4" />
                Scan QR
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,text/vcard"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> End-to-end device privacy protected
            </span>
            <span>{syncResult.totalSynced} Contacts Synced</span>
          </div>
        </div>

        {/* Search Bar & Tabs */}
        <div className="px-4 pt-3 pb-2 space-y-2 border-b border-border/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search synced contacts by name or phone..."
              className="pl-8 text-xs h-8 bg-muted/50 border-border/80"
            />
          </div>

          <div className="flex rounded-xl bg-muted p-0.5 border border-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('matched')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'matched'
                  ? 'bg-card text-emerald-400 shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              On KAMATELA ({syncResult.matched.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unregistered')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'unregistered'
                  ? 'bg-card text-purple-400 shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Friends ({syncResult.unregistered.length})
            </button>
          </div>
        </div>

        {/* Contact List View */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2">
          {activeTab === 'matched' ? (
            filteredMatched.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground px-4 space-y-2">
                <Users className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-semibold">No matched contacts found</p>
                <p className="text-[11px] text-muted-foreground">
                  Try syncing with another address book or inviting your friends below.
                </p>
              </div>
            ) : (
              filteredMatched.map((item) => {
                const user = item.matchedUser!;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {user.name}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            Friend
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{item.tel}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          Address Book: {item.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onStartCallWithUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onClose();
                            onStartCallWithUser(user);
                          }}
                          className="h-7 w-7 p-0 rounded-full border border-border text-foreground hover:bg-muted"
                          title="Call on KAMATELA"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          onClose();
                          onStartChatWithUser(user);
                        }}
                        className="h-7 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1 shadow-sm"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chat
                      </Button>
                    </div>
                  </div>
                );
              })
            )
          ) : filteredUnregistered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground px-4 space-y-2">
              <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs font-semibold">All contacts are already on KAMATELA!</p>
            </div>
          ) : (
            filteredUnregistered.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">{item.tel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* SMS Invite */}
                  <a
                    href={getSmsInviteUrl(item.tel, currentUser.name)}
                    className="h-7 px-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    title="Send invite link via phone SMS"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-400" />
                    SMS
                  </a>

                  {/* KAMATELA Chat Invite */}
                  <a
                    href={getChatInviteUrl(item.tel, currentUser.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                    title="Send invite link via SMS"
                  >
                    <Share2 className="w-3 h-3" />
                    KAMATELA Chat
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/70 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Synced locally to your device browser</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
