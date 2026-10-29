import React, { useState } from 'react';
import {
  Image as ImageIcon,
  FileText,
  MapPin,
  User as UserIcon,
  DollarSign,
  Music,
  X,
  Camera,
  Check,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendImage: () => void;
  onSendDocument: (fileName: string, fileSize: string) => void;
  onSendLocation: (title: string, address: string, lat: number, lng: number) => void;
  onSendContact: (name: string, phone: string) => void;
  onSendMoMo: (amount: number, currency: string, note?: string) => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onSendImage,
  onSendDocument,
  onSendLocation,
  onSendContact,
  onSendMoMo,
}) => {
  const [activeView, setActiveView] = useState<'menu' | 'location' | 'contact' | 'momo' | 'doc'>('menu');

  // Location form state
  const [locTitle, setLocTitle] = useState('My Current Location');
  const [locAddress, setLocAddress] = useState('Boulevard de la République, Plateau, Abidjan');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('+225 ');

  // MoMo form state
  const [momoAmount, setMomoAmount] = useState('5000');
  const [momoCurrency, setMomoCurrency] = useState('XOF');

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveView('menu');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            {activeView === 'menu' && 'Share Attachment'}
            {activeView === 'location' && 'Share Location Pin'}
            {activeView === 'contact' && 'Share Contact Card'}
            {activeView === 'momo' && 'Send MoMo Cash in Chat'}
            {activeView === 'doc' && 'Attach Document'}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="rounded-full h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 1. Main Menu View */}
        {activeView === 'menu' && (
          <div className="grid grid-cols-3 gap-3 py-2">
            {/* Photos / Gallery */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                onSendImage();
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">Photos</span>
            </button>

            {/* Document / PDF */}
            <button
              type="button"
              onClick={() => setActiveView('doc')}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">Document</span>
            </button>

            {/* Location */}
            <button
              type="button"
              onClick={() => setActiveView('location')}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">Location</span>
            </button>

            {/* Contact */}
            <button
              type="button"
              onClick={() => setActiveView('contact')}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">Contact</span>
            </button>

            {/* MoMo Transfer */}
            <button
              type="button"
              onClick={() => setActiveView('momo')}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">MoMo Pay</span>
            </button>

            {/* Audio / Music */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                toast.info('Share music via the AI Music Studio in the navigation bar!');
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-pink-500/10 to-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 hover:scale-105 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">Audio</span>
            </button>
          </div>
        )}

        {/* 2. Document Pick View */}
        {activeView === 'doc' && (
          <div className="space-y-3 py-1">
            <p className="text-xs text-muted-foreground">Select a document to send:</p>
            <div className="space-y-2">
              {[
                { name: 'KAMATELA_Platform_Specs.pdf', size: '1.8 MB' },
                { name: 'Creator_Invoice_October.pdf', size: '420 KB' },
                { name: 'Studio_Equipment_Agreement.pdf', size: '2.1 MB' },
              ].map((doc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSendDocument(doc.name, doc.size);
                    handleClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-xs font-bold truncate max-w-[190px]">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Location View */}
        {activeView === 'location' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Place Name</label>
              <Input
                value={locTitle}
                onChange={(e) => setLocTitle(e.target.value)}
                placeholder="e.g. KAMATELA Studio"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Address / Coordinates</label>
              <Input
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
                placeholder="e.g. Boulevard de la République, Abidjan"
                className="h-9 text-xs"
              />
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9"
              onClick={() => {
                onSendLocation(locTitle, locAddress, 5.3253, -4.0197);
                handleClose();
              }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send Location Pin
            </Button>
          </div>
        )}

        {/* 4. Contact View */}
        {activeView === 'contact' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Contact Name</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Mamadou Diallo"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Mobile Phone Number</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+225 07 00 11 22 33"
                className="h-9 text-xs font-mono"
              />
            </div>

            <Button
              disabled={!contactName.trim() || !contactPhone.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9"
              onClick={() => {
                onSendContact(contactName.trim(), contactPhone.trim());
                handleClose();
              }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Share Contact Card
            </Button>
          </div>
        )}

        {/* 5. MoMo Money Transfer View */}
        {activeView === 'momo' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Transfer Amount</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={momoAmount}
                  onChange={(e) => setMomoAmount(e.target.value)}
                  placeholder="5000"
                  className="h-9 text-xs font-mono flex-1"
                />
                <select
                  value={momoCurrency}
                  onChange={(e) => setMomoCurrency(e.target.value)}
                  className="h-9 px-2 text-xs font-bold rounded-md bg-secondary border border-border text-foreground"
                >
                  <option value="XOF">XOF (CFA)</option>
                  <option value="GNF">GNF</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-1.5">
              {['2000', '5000', '10000', '25000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMomoAmount(amt)}
                  className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground"
                >
                  +{amt}
                </button>
              ))}
            </div>

            <Button
              disabled={!momoAmount || Number(momoAmount) <= 0}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs h-9 shadow-md shadow-yellow-500/20"
              onClick={() => {
                onSendMoMo(Number(momoAmount), momoCurrency);
                handleClose();
              }}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Transfer {momoCurrency} {Number(momoAmount).toLocaleString()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
