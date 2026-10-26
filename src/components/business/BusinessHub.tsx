import React, { useState } from 'react';
import {
  Store,
  Search,
  Plus,
  ShoppingBag,
  MessageCircle,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Trash2,
  Music,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { BusinessProduct, User, AIMusicTrack } from '@/types/kamatela';
import { mockUsers } from '@/services/kamatelaStore';
import { ProductDetailModal } from './ProductDetailModal';
import { AddProductModal } from './AddProductModal';
import { aiMusicSynth } from '@/utils/aiMusicSynth';

interface BusinessHubProps {
  products: BusinessProduct[];
  currentUser: User;
  onAddProduct: (prod: Omit<BusinessProduct, 'id' | 'businessId'>) => void;
  onDeleteProduct: (prodId: string) => void;
  onStartBusinessChat: (businessUser: User, product?: BusinessProduct) => void;
  musicTracks?: AIMusicTrack[];
}

export const BusinessHub: React.FC<BusinessHubProps> = ({
  products,
  currentUser,
  onAddProduct,
  onDeleteProduct,
  onStartBusinessChat,
  musicTracks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<BusinessProduct | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'businesses' | 'my_store'>('catalog');
  const [isBrandAudioPlaying, setIsBrandAudioPlaying] = useState(false);

  const brandTrack = musicTracks && musicTracks.length > 0 ? musicTracks[0] : null;

  const handleToggleBrandAudio = () => {
    if (!brandTrack) return;
    if (isBrandAudioPlaying) {
      aiMusicSynth.pause();
      setIsBrandAudioPlaying(false);
    } else {
      aiMusicSynth.playTrack(brandTrack.id, brandTrack.genre, () => {
        setIsBrandAudioPlaying(false);
      }, brandTrack);
      setIsBrandAudioPlaying(true);
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Gourmet Food', 'Creator Gear'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const allBusinesses: User[] = [
    mockUsers.zara,
    mockUsers.elena,
    mockUsers.marcus,
    currentUser.isBusiness ? currentUser : null,
  ].filter(Boolean) as User[];

  const myProducts = products.filter((p) => p.businessId === currentUser.id);

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto space-y-3">
      {/* Top Banner: KAMATELA Business Commerce & WhatsApp Hub */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Verified Business Directory
            </span>
          </div>
          <h2 className="text-base font-extrabold text-foreground">
            Shop Directly via WhatsApp Messaging
          </h2>
          <p className="text-xs text-muted-foreground">
            Explore authentic catalogs, chat in real-time with creators and business owners.
          </p>
        </div>

        {currentUser.isBusiness && (
          <Button
            size="sm"
            onClick={() => setIsAddProductOpen(true)}
            className="h-8 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-1.5 shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Catalog Item
          </Button>
        )}
      </div>

      {/* Segment tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'catalog'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('businesses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'businesses'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Verified Businesses ({allBusinesses.length})
        </button>
        {currentUser.isBusiness && (
          <button
            type="button"
            onClick={() => setActiveTab('my_store')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'my_store'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Catalog ({myProducts.length})
          </button>
        )}
      </div>

      {/* Official Business Brand Soundtrack Feature Banner */}
      {brandTrack && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-amber-950/30 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-purple-500/40 shadow">
              <img src={brandTrack.coverUrl} alt={brandTrack.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                  OFFICIAL BRAND JINGLE
                </span>
                <span className="text-[10px] text-muted-foreground">{brandTrack.genre}</span>
              </div>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{brandTrack.title}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{brandTrack.prompt}"</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isBrandAudioPlaying && (
              <div className="hidden sm:flex items-center gap-0.5 h-3">
                {[30, 80, 50, 90, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-purple-400 rounded-full animate-pulse"
                    style={{ height: `${(h / 100) * 12}px` }}
                  />
                ))}
              </div>
            )}
            <Button
              size="sm"
              onClick={handleToggleBrandAudio}
              className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5"
            >
              {isBrandAudioPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> Play Theme
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {/* Search & Category Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or gadgets..."
                className="pl-9 h-9 text-xs bg-muted/50 border-border rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-foreground text-background font-bold'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((prod) => {
              const seller = allBusinesses.find((b) => b.id === prod.businessId) || mockUsers.zara;
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground truncate">{seller.businessName || seller.name}</p>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-0.5">{prod.title}</h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">
                        {prod.currency}{prod.price}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartBusinessChat(seller, prod);
                        }}
                        className="h-7 px-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded-lg gap-1"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" /> Inquire
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Businesses Directory View */}
      {activeTab === 'businesses' && (
        <div className="space-y-3">
          {allBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/40 shrink-0 bg-muted">
                  <img src={biz.avatar} alt={biz.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-foreground">
                      {biz.businessName || biz.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">{biz.businessCategory}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {biz.businessRating || '4.9'}
                    </span>
                    {biz.businessAddress && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {biz.businessAddress}
                      </span>
                    )}
                    {biz.businessHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {biz.businessHours}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  onClick={() => onStartBusinessChat(biz)}
                  className="h-8 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 rounded-full"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Catalog (Business Owner Mode) */}
      {activeTab === 'my_store' && (
        <div className="space-y-3">
          <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-foreground">Your Active Business Catalog</h4>
              <p className="text-[10px] text-muted-foreground">These items appear in your store profile and can be linked in video streams.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddProductOpen(true)}
              className="text-xs bg-emerald-500 text-white gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myProducts.map((p) => (
              <div key={p.id} className="p-3 bg-card rounded-xl border border-border flex gap-3 items-center">
                <img src={p.imageUrl} alt={p.title} className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-foreground truncate">{p.title}</h5>
                  <p className="text-xs font-extrabold text-emerald-400">${p.price}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(p.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onInquireWhatsApp={(prod) => {
          const seller = allBusinesses.find((b) => b.id === prod.businessId) || mockUsers.zara;
          onStartBusinessChat(seller, prod);
        }}
        businessUser={allBusinesses.find((b) => b.id === selectedProduct?.businessId)}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={onAddProduct}
      />
    </div>
  );
};
