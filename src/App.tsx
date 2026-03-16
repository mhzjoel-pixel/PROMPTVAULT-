import React, { useState, useEffect } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { MiniKit, Tokens } from '@worldcoin/minikit-js';
import { 
  Search, 
  Plus, 
  Wallet, 
  Shield, 
  Zap, 
  History, 
  LayoutGrid, 
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  ShoppingBag,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Star,
  Heart,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prompt, Collection } from './types';
import { StakingDashboard } from './components/economy/StakingDashboard';

// --- Helpers ---
const trackActivity = (address: string | undefined, promptId: string, type: 'view' | 'search' | 'purchase') => {
  if (!address) return;
  fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, prompt_id: promptId, type })
  }).catch(err => console.error('Failed to track activity:', err));
};

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { address, isConnected, isHuman, isMiniKit, isConnecting, connect, disconnect, signInWithWorldID } = useWallet();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0b10]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
            <Shield className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase">Prompt<span className="text-brand-primary">Vault</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Solutions <ChevronDown size={14} />
            </button>
          </div>
          <button className="text-sm font-medium text-white/70 hover:text-white transition-colors">Blog</button>
          <button className="text-sm font-medium text-white/70 hover:text-white transition-colors">Docs</button>
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Community <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setActiveTab('market')}
          className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Marketplace
        </button>

        {isConnected && (
          <button 
            onClick={() => setActiveTab('mint')}
            className={`hidden md:block text-sm font-medium transition-colors ${activeTab === 'mint' ? 'text-brand-primary' : 'text-white/70 hover:text-white'}`}
          >
            Mint
          </button>
        )}
        
        {isConnected && (
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'vault' ? 'text-brand-primary' : 'text-white/70 hover:text-white'}`}
            >
              <Lock size={16} />
              My Vault
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'text-brand-primary' : 'text-white/70 hover:text-white'}`}
            >
              <Heart size={16} fill={activeTab === 'favorites' ? "currentColor" : "none"} />
              Wishlist
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'account' ? 'text-brand-primary' : 'text-white/70 hover:text-white'}`}
            >
              <UserIcon size={16} />
              Account
            </button>
          </div>
        )}
        
        {!isConnected ? (
          <button 
            onClick={connect}
            className="px-5 py-2 border border-white/10 rounded-md text-sm font-medium text-white hover:bg-white/5 transition-all"
          >
            Login
          </button>
        ) : (
          <button 
            onClick={disconnect}
            className="px-5 py-2 border border-white/10 rounded-md text-sm font-medium text-white hover:bg-white/5 transition-all"
          >
            {address?.slice(0, 6)}...
          </button>
        )}
        
        <button className="px-5 py-2 bg-brand-primary text-black rounded-md text-sm font-bold hover:bg-brand-primary/90 transition-all">
          Whitepaper
        </button>
      </div>
    </nav>
  );
};

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen bg-[#05060b] text-white pt-32">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-8">
          <LinkIcon size={14} className="text-brand-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Prompt Tokenization</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          How Prompt <span className="text-brand-primary">Tokenization</span> Works
        </h1>
        
        <p className="text-white/50 max-w-2xl mx-auto mb-20 leading-relaxed">
          Transform your AI prompts into valuable digital assets that can be traded, owned, and generate ongoing revenue through our advanced tokenization system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="relative group">
            <div className="p-8 bg-[#0a0b10] border border-white/5 rounded-xl hover:border-brand-primary/30 transition-all duration-500 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-6 text-brand-primary">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">Create Quality Prompts</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Develop high-performing AI prompts that deliver consistent value to users.
              </p>
            </div>
            <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-white/10">
              <ArrowRight size={24} />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="p-8 bg-[#0a0b10] border border-white/5 rounded-xl hover:border-brand-primary/30 transition-all duration-500 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-6 text-orange-400">
                <LinkIcon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">Tokenize Your Work</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Convert successful prompts into tradeable tokens on the blockchain.
              </p>
            </div>
            <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-white/10">
              <ArrowRight size={24} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="p-8 bg-[#0a0b10] border border-white/5 rounded-xl hover:border-brand-primary/30 transition-all duration-500 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6 text-green-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">Earn Ongoing Royalties</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Receive payments every time your tokenized prompts are used by others.
              </p>
            </div>
            <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-white/10">
              <ArrowRight size={24} />
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative group">
            <div className="p-8 bg-[#0a0b10] border border-white/5 rounded-xl hover:border-brand-primary/30 transition-all duration-500 flex flex-col items-center text-center h-full">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-400">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold mb-3">Build Community Value</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Token holders can trade, stake, and participate in governance decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <button 
            onClick={onStart}
            className="px-10 py-4 bg-brand-primary hover:bg-brand-primary/90 text-black rounded-xl font-bold transition-all hover:scale-105"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

const PromptModal = ({ prompt, isOpen, onClose, isOwned }: { prompt: Prompt, isOpen: boolean, onClose: () => void, isOwned: boolean }) => {
  const { address } = useWallet();
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isRating, setIsRating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, prompt.id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/reviews`);
      const data = await res.json();
      setReviews(data);
      
      // Find current user's rating if it exists
      const myReview = data.find((r: any) => r.user_address === address);
      if (myReview) {
        setUserRating(myReview.score);
        setComment(myReview.comment || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!isOpen) return null;

  const handleRate = async (score: number) => {
    if (!address) return;
    setIsRating(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_address: address, score, comment }),
      });
      if (res.ok) {
        setUserRating(score);
        fetchReviews();
        alert('Feedback submitted successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-brand-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-brand-primary/20">
                  {prompt.category}
                </span>
                <span className="text-[10px] text-white/20 font-mono tracking-widest">REGISTRY_ID: {prompt.token_id}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none">{prompt.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
            >
              <Lock className="w-6 h-6 text-white/20" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4">Abstract</h3>
                <p className="text-white/60 leading-relaxed text-lg">{prompt.description}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-brand-primary font-bold">Vaulted Sequence</h3>
                    <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-[8px] font-bold rounded border border-brand-primary/30">ENCRYPTED</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.content);
                      alert('Sequence copied to clipboard!');
                    }}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white font-bold transition-colors flex items-center gap-2"
                  >
                    <Plus size={12} />
                    Copy Sequence
                  </button>
                </div>
                <div className="bg-black/60 border border-white/5 rounded-3xl p-8 font-mono text-sm text-brand-primary/90 leading-relaxed max-h-80 overflow-y-auto custom-scrollbar shadow-inner">
                  {prompt.content}
                </div>
                
                <div className="flex items-center gap-3 p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl">
                  <Shield size={18} className="text-brand-primary shrink-0" />
                  <p className="text-[11px] text-brand-primary/70 leading-relaxed">
                    {isOwned 
                      ? "This sequence is decrypted and visible to you as the verified protocol owner." 
                      : "Protocol Preview: Decrypted sequence is visible for verification purposes in this demo."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Protocol Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/40 uppercase">Rating</span>
                      <div className="flex items-center gap-1 text-brand-primary font-bold">
                        <Zap size={12} fill="currentColor" />
                        <span>{(prompt.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/40 uppercase">Utilization</span>
                      <span className="text-[10px] text-white font-bold">{prompt.sales_count} Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/40 uppercase">License</span>
                      <span className="text-[10px] text-white font-bold uppercase tracking-tighter">{prompt.license_type || 'Standard'}</span>
                    </div>
                    {prompt.model_compatibility && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase">Model</span>
                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-tighter">{prompt.model_compatibility}</span>
                      </div>
                    )}
                    {prompt.prompt_type && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase">Type</span>
                        <span className="text-[10px] text-white font-bold uppercase tracking-tighter">{prompt.prompt_type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isOwned && (
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Submit Feedback</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed italic">Rate the accuracy and usefulness of this sequence.</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          disabled={isRating}
                          onClick={() => setUserRating(star)}
                          className={`p-1.5 transition-all rounded-lg hover:bg-white/5 ${
                            userRating >= star 
                              ? 'text-brand-primary' 
                              : 'text-white/10 hover:text-white/30'
                          }`}
                        >
                          <Zap size={24} fill={userRating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience with this prompt..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-brand-primary transition-all h-20 resize-none"
                    />
                    <button 
                      onClick={() => handleRate(userRating)}
                      disabled={isRating || userRating === 0}
                      className="w-full py-2.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary/20 transition-all disabled:opacity-30"
                    >
                      {isRating ? 'Submitting...' : 'Update Feedback'}
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                  <ShoppingBag size={12} />
                  Community Feedback
                </h4>
                
                {loadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic">No feedback submitted yet.</p>
                ) : (
                  <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {reviews.map((review, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-white/60">{review.username}</span>
                          <div className="flex items-center gap-0.5 text-brand-primary">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Zap key={s} size={8} fill={review.score >= s ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-[11px] text-white/40 leading-relaxed italic">"{review.comment}"</p>
                        )}
                        <p className="text-[8px] text-white/20 mt-2 uppercase tracking-widest">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-brand-primary text-black rounded-3xl">
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">Listing Price</h4>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold tracking-tighter">{prompt.price}</span>
                  <span className="text-xs font-bold uppercase">WLD</span>
                </div>
                <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95">
                  Execute Acquisition
                </button>
              </div>

              <div className="text-center">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">Registered {new Date(prompt.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PromptCard: React.FC<{ prompt: Prompt, onBuy?: () => void | Promise<void>, isOwned?: boolean }> = ({ prompt, onBuy, isOwned }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inCart, setInCart] = useState(false);
  const { address, favorites, toggleFavorite } = useWallet();

  const isFavorite = favorites.includes(prompt.id);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    trackActivity(address, prompt.id, 'view');
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="group relative bg-brand-card border border-white/5 rounded-2xl overflow-hidden flex flex-col transition-all hover:border-brand-primary/30 hover:shadow-[0_0_30px_rgba(0,255,0,0.05)]"
      >
        <div className="aspect-video bg-white/5 relative overflow-hidden cursor-pointer" onClick={handleOpenModal}>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity text-brand-primary">
             <Zap className="w-24 h-24" />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded text-[9px] uppercase tracking-widest text-white/80 font-bold">
              {prompt.category}
            </span>
            {prompt.rating && prompt.rating > 4.5 && (
              <span className="px-2 py-1 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 rounded text-[9px] uppercase tracking-widest text-brand-primary font-bold">
                Top Rated
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(prompt.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                isFavorite 
                  ? 'bg-brand-primary border-brand-primary text-black' 
                  : 'bg-black/50 border-white/10 text-white/40 hover:text-white hover:bg-black/70'
              }`}
            >
              <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            {isOwned && (
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                <Shield className="text-black w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <h3 className="text-lg font-bold leading-tight group-hover:text-brand-primary transition-colors line-clamp-1">{prompt.title}</h3>
            <span className="text-[10px] font-mono text-white/30">#{prompt.token_id.slice(0, 6)}</span>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-[10px] text-brand-primary font-bold">
              <Zap size={10} fill="currentColor" />
              <span>{(prompt.rating || 0).toFixed(1)}</span>
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <ShoppingBag size={10} />
              <span>{prompt.sales_count || 0}</span>
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <Lock size={10} />
              <span className="uppercase tracking-tighter">{prompt.license_type || 'Standard'}</span>
            </div>
          </div>

          <p className="text-sm text-white/50 line-clamp-2 mb-4 flex-1 cursor-pointer leading-relaxed" onClick={handleOpenModal}>{prompt.description}</p>
          
          {prompt.tags && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {prompt.tags.split(',').slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] text-white/30 uppercase tracking-widest">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {prompt.model_compatibility && (
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={10} className="text-brand-primary" />
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">{prompt.model_compatibility}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-0.5">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white tracking-tighter">{prompt.price}</span>
                <span className="text-[10px] text-brand-primary font-bold">WLD</span>
              </div>
            </div>
            
            {isOwned ? (
              <button 
                onClick={handleOpenModal}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                Open Vault
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setInCart(!inCart);
                  }}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                    inCart 
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                  title={inCart ? "Remove from cart" : "Add to cart"}
                >
                  {inCart ? <CheckCircle2 size={16} /> : <ShoppingBag size={16} />}
                </button>
                <button 
                  onClick={onBuy}
                  className="px-5 py-2.5 bg-brand-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
                >
                  Unlock
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <PromptModal 
            prompt={prompt} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            isOwned={!!isOwned} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

const CollectionCard: React.FC<{ collection: Collection }> = ({ collection }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-brand-card border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-brand-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
          <Layers size={20} />
        </div>
        {collection.is_staff_pick && (
          <span className="px-2 py-0.5 bg-brand-primary/20 border border-brand-primary/30 rounded text-[8px] uppercase tracking-widest text-brand-primary font-bold">
            Staff Pick
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">{collection.title}</h4>
        <p className="text-xs text-white/40 line-clamp-2">{collection.description}</p>
      </div>
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] text-white/30 uppercase tracking-widest">Curated Collection</span>
        <ArrowRight size={14} className="text-white/20 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
};

const Marketplace = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [recommendations, setRecommendations] = useState<Prompt[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    model: 'All',
    type: 'All',
    minPrice: '',
    maxPrice: '',
    license: 'All',
    sort: 'newest'
  });
  const { address, isConnected, isMiniKit } = useWallet();

  const trendingTags = ['Stable Diffusion', 'Midjourney', 'React', 'GPT-4', 'Python', 'Creative Writing'];

  const fetchPrompts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category !== 'All') params.append('category', filters.category);
    if (filters.model !== 'All') params.append('model', filters.model);
    if (filters.type !== 'All') params.append('type', filters.type);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.license !== 'All') params.append('license', filters.license);
    params.append('sort', filters.sort);
    params.append('page', page.toString());
    params.append('limit', '12');

    fetch(`/api/prompts?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPrompts(data.prompts);
        setTotalPages(data.totalPages);
        setTotalResults(data.total);
        setLoading(false);
      });
  };

  const fetchDiscovery = () => {
    // Fetch recommendations
    fetch(`/api/recommendations?address=${address || ''}`)
      .then(res => res.json())
      .then(data => setRecommendations(data));

    // Fetch collections
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => setCollections(data));
  };

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrompts();
      if (filters.search && address) {
        // Track search activity for the first result if any
        // This is a simple way to capture search intent
        fetch(`/api/prompts?search=${filters.search}&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data.prompts && data.prompts.length > 0) {
              trackActivity(address, data.prompts[0].id, 'search');
            }
          });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page]);

  useEffect(() => {
    fetchDiscovery();
  }, [address]);

  const handleBuy = async (prompt: Prompt) => {
    if (!isConnected) return alert('Please connect your wallet first');
    
    if (isMiniKit) {
      try {
        const { finalPayload } = await MiniKit.commandsAsync.pay({
          reference: `buy_${prompt.id}_${Date.now()}`,
          to: prompt.creator_address,
          tokens: [
            {
              symbol: Tokens.WLD,
              amount: prompt.price.toString(),
            } as any,
          ],
          description: `Purchase prompt: ${prompt.title}`,
        });

        if (finalPayload.status === 'success') {
          const res = await fetch('/api/prompts/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt_id: prompt.id,
              buyer_address: address,
              seller_address: prompt.creator_address,
              amount: prompt.price,
              transaction_id: finalPayload.transaction_id,
              payload: finalPayload
            })
          });

          if (res.ok) {
            alert('Purchase successful! Prompt added to your vault.');
            trackActivity(address, prompt.id, 'purchase');
            fetchPrompts();
            fetchDiscovery();
          }
        }
      } catch (err) {
        console.error('Payment failed:', err);
      }
    } else {
      const txId = `tx_${Math.random().toString(36).slice(2, 11)}`;
      const res = await fetch('/api/prompts/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_id: prompt.id,
          buyer_address: address,
          seller_address: prompt.creator_address,
          amount: prompt.price,
          transaction_id: txId
        })
      });

      if (res.ok) {
        alert('Purchase successful! Prompt added to your vault.');
        trackActivity(address, prompt.id, 'purchase');
        fetchPrompts();
        fetchDiscovery();
      }
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="relative mb-20 overflow-hidden rounded-[40px] bg-brand-card border border-white/5 p-12 md:p-20">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-primary/20 to-transparent" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-brand-primary blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-brand-primary" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-primary font-bold">The Alpha Protocol</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            UNLEASH <br />
            <span className="text-brand-primary italic">INTELLIGENCE</span>
          </h1>
          <p className="text-lg text-white/50 max-w-md mb-10 leading-relaxed">
            The world's first decentralized vault for high-performance AI prompts. 
            Minted on-chain, verified by humans, secured by World ID.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {trendingTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setFilters({...filters, search: tag})}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-brand-primary hover:border-brand-primary/30 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - Technical Dashboard Style */}
        <aside className="w-full lg:w-72 space-y-10">
          <div className="p-6 bg-brand-card border border-white/5 rounded-3xl space-y-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <Search size={12} />
                Search Registry
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Keywords..." 
                  value={filters.search}
                  onChange={e => setFilters({...filters, search: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-primary transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
                <LayoutGrid size={12} />
                Classification
              </h3>
              {(filters.category !== 'All' || filters.search || filters.minPrice || filters.maxPrice || filters.license !== 'All' || filters.model !== 'All' || filters.type !== 'All') && (
                <button 
                  onClick={() => setFilters({
                    search: '',
                    category: 'All',
                    model: 'All',
                    type: 'All',
                    minPrice: '',
                    maxPrice: '',
                    license: 'All',
                    sort: 'newest'
                  })}
                  className="text-[9px] uppercase tracking-widest text-brand-primary font-bold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Creative', 'Technical', 'Code', 'Business', 'Academic'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilters({...filters, category: cat})}
                    className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      filters.category === cat 
                        ? 'bg-brand-primary border-brand-primary text-black' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <Zap size={12} />
                Price Range (WLD)
              </h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={e => setFilters({...filters, minPrice: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <Cpu size={12} />
                Model Compatibility
              </h3>
              <select 
                value={filters.model}
                onChange={e => setFilters({...filters, model: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
              >
                <option>All</option>
                <option>GPT-4</option>
                <option>GPT-3.5</option>
                <option>Claude 3</option>
                <option>Gemini Pro</option>
                <option>Midjourney</option>
                <option>Stable Diffusion</option>
              </select>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <Layers size={12} />
                Prompt Type
              </h3>
              <select 
                value={filters.type}
                onChange={e => setFilters({...filters, type: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
              >
                <option>All</option>
                <option>Text-to-Image</option>
                <option>Code Generation</option>
                <option>Creative Writing</option>
                <option>Technical Specification</option>
                <option>Business/Marketing</option>
                <option>Academic/Research</option>
              </select>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <Shield size={12} />
                License Protocol
              </h3>
              <select 
                value={filters.license}
                onChange={e => setFilters({...filters, license: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
              >
                <option>All</option>
                <option>Standard</option>
                <option>Commercial</option>
                <option>Exclusive</option>
                <option>Public Domain</option>
              </select>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                <History size={12} />
                Sequence
              </h3>
              <select 
                value={filters.sort}
                onChange={e => setFilters({...filters, sort: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-3xl">
            <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-2">Network Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
              <span className="text-[10px] text-white/60 font-mono uppercase tracking-widest">World Chain Mainnet</span>
            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <div className="flex-1 space-y-12">
          {/* Discovery Section */}
          {!filters.search && filters.category === 'All' && filters.model === 'All' && filters.type === 'All' && page === 1 && (
            <div className="space-y-12 mb-12">
              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Personalized for You</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Based on your activity</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recommendations.slice(0, 3).map(prompt => (
                      <PromptCard key={prompt.id} prompt={prompt} onBuy={() => handleBuy(prompt)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Curated Collections */}
              {collections.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <Star size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Curated Collections</h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Hand-picked by experts</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {collections.map(collection => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Available Assets</h2>
              <div className="h-px w-12 bg-white/10" />
              <span className="text-[10px] font-mono text-brand-primary">{totalResults} Results</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-32 bg-brand-card rounded-[40px] border border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-white/20 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Results Found</h3>
              <p className="text-white/40 max-w-xs mx-auto mb-8">Adjust your filters or try a different search term to find what you're looking for.</p>
              <button 
                onClick={() => setFilters({
                  search: '',
                  category: 'All',
                  model: 'All',
                  type: 'All',
                  minPrice: '',
                  maxPrice: '',
                  license: 'All',
                  sort: 'newest'
                })}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {prompts.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} onBuy={() => handleBuy(prompt)} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                      // Show only a few page numbers if there are too many
                      if (
                        p === 1 || 
                        p === totalPages || 
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl text-[10px] font-bold transition-all border ${
                              page === p 
                                ? 'bg-brand-primary border-brand-primary text-black' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === page - 2 || p === page + 2) {
                        return <span key={p} className="text-white/20">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AssetsView = () => {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  const generateCard = async () => {
    setIsGeneratingCard(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: "A high-quality, professional content card for a mobile app called 'Prompt Vault'. The image features a futuristic, glowing green shield and a lightning bolt icon integrated into a sleek, dark metallic vault door. Subtle digital data streams and human iris patterns are visible in the background, symbolizing human verification and AI prompts. The style is cinematic, clean, and modern with a dark mode aesthetic. No text.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "4:3",
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setCardUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate card. Please ensure your Gemini API key is configured.');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const generateLogo = async () => {
    setIsGeneratingLogo(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: "A futuristic, glowing green shield logo for a Web3 app called 'Prompt Vault'. The icon is a minimalist, sleek shield with a subtle lightning bolt integrated into the center. It has a clean, modern aesthetic with neon green glows against a deep black background. The style is high-tech, professional, and suitable for a crypto marketplace. Centered composition, high resolution, no text.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setLogoUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate logo. Please ensure your Gemini API key is configured.');
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 uppercase">Developer Portal Assets</h1>
        <p className="text-white/60">Generate and download the required visual assets for your World Developer Portal submission.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          {/* Content Card Section */}
          <div className="p-8 bg-brand-card border border-white/5 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary">Content Card Image</h3>
              <span className="text-[10px] text-white/30 font-mono">345 x 240 (4:3)</span>
            </div>
            
            <div className="aspect-[4/3] bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
              {cardUrl ? (
                <>
                  <img src={cardUrl} alt="Content Card" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={cardUrl} 
                      download="prompt-vault-content-card.png"
                      className="px-6 py-3 bg-brand-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Download PNG
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 p-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="text-white/20" size={24} />
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                    No card generated yet.
                  </p>
                </div>
              )}
              
              {isGeneratingCard && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Loader2 className="text-brand-primary animate-spin" size={32} />
                  <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] animate-pulse">Synthesizing Card...</p>
                </div>
              )}
            </div>

            <button 
              onClick={generateCard}
              disabled={isGeneratingCard}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              {cardUrl ? 'Regenerate Card' : 'Generate Content Card'}
            </button>
          </div>

          {/* Logo Section */}
          <div className="p-8 bg-brand-card border border-white/5 rounded-[32px] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary">App Logo / Icon</h3>
              <span className="text-[10px] text-white/30 font-mono">1024 x 1024 (1:1)</span>
            </div>
            
            <div className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative group">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={logoUrl} 
                      download="prompt-vault-logo.png"
                      className="px-6 py-3 bg-brand-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Download PNG
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 p-6">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="text-white/20" size={24} />
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                    No logo generated yet.
                  </p>
                </div>
              )}
              
              {isGeneratingLogo && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Loader2 className="text-brand-primary animate-spin" size={32} />
                  <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] animate-pulse">Synthesizing Logo...</p>
                </div>
              )}
            </div>

            <button 
              onClick={generateLogo}
              disabled={isGeneratingLogo}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              {logoUrl ? 'Regenerate Logo' : 'Generate App Logo'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl flex items-start gap-4">
            <Shield className="text-brand-primary shrink-0 mt-1" size={18} />
            <div className="space-y-1">
              <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">Portal Requirement</p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                This image will be used when featuring your app in the Mini App Store. It is designed to capture the "Human-Verified" and "Secure Vault" essence of your protocol.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Submission Tips</h4>
            <div className="space-y-4">
              {[
                { title: "High Contrast", desc: "The dark mode aesthetic ensures your app stands out in the World App's light-themed store." },
                { title: "No Text Policy", desc: "Mini App Store guidelines recommend avoiding text in content cards for better internationalization." },
                { title: "Brand Consistency", desc: "The neon green accents match your protocol's primary interaction color." }
              ].map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-brand-primary font-mono text-xs">0{i+1}</div>
                  <div>
                    <p className="text-xs font-bold text-white/80 mb-1">{tip.title}</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MintForm = ({ onComplete }: { onComplete: () => void }) => {
  const { address, isConnected, isHuman, signInWithWorldID } = useWallet();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ score: number, status: string, feedback: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    price: '0.05',
    category: 'Creative',
    tags: '',
    model_compatibility: 'GPT-4',
    prompt_type: 'Creative Writing',
    license_type: 'Standard'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return alert('Connect wallet to mint');
    if (!isHuman) return alert('World ID verification required to mint prompts on PromptVault.');
    setShowConfirm(true);
  };

  const confirmMint = async () => {
    setShowConfirm(false);
    const id = `p_${Date.now()}`;
    const tokenId = `TKN_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const res = await fetch('/api/prompts/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        id,
        creator_address: address,
        token_id: tokenId,
        price: parseFloat(formData.price),
        rating: aiFeedback ? aiFeedback.score / 20 : 0 // Initial rating based on AI score
      })
    });

    if (res.ok) {
      alert('Prompt minted successfully!');
      onComplete();
    }
  };

  const handleVerify = async () => {
    if (!formData.content) return alert('Please enter prompt content first');
    setIsVerifying(true);
    setAiFeedback(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content })
      });
      const data = await res.json();
      setAiFeedback(data);
    } catch (err) {
      console.error(err);
      alert('AI Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">MINT NEW PROMPT</h1>
        <p className="text-white/60">Turn your expertise into a liquid on-chain asset.</p>
        
        {!isHuman && isConnected && (
          <div className="mt-6 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="text-brand-primary" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-brand-primary tracking-tight">Human Verification Required</p>
                <p className="text-sm text-white/50 leading-relaxed max-w-md">To maintain protocol integrity, all creators must verify their personhood via World ID. This prevents bot spam and ensures high-quality human-authored prompts.</p>
              </div>
            </div>
            <button 
              onClick={signInWithWorldID}
              className="px-8 py-4 bg-brand-primary text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]"
            >
              Verify Personhood
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`space-y-6 bg-brand-card p-8 rounded-3xl border border-white/5 transition-opacity ${!isHuman ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all"
              placeholder="e.g. Hyper-Realistic Portrait Generator"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all appearance-none"
            >
              <option>Creative</option>
              <option>Technical</option>
              <option>Code</option>
              <option>Business</option>
              <option>Academic</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tags (comma separated)</label>
            <input 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all"
              placeholder="e.g. art, realism, portrait"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">License Type</label>
            <select 
              value={formData.license_type}
              onChange={e => setFormData({...formData, license_type: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all appearance-none"
            >
              <option>Standard</option>
              <option>Commercial</option>
              <option>Exclusive</option>
              <option>Public Domain</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Model Compatibility</label>
            <select 
              value={formData.model_compatibility}
              onChange={e => setFormData({...formData, model_compatibility: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
            >
              <option>GPT-4</option>
              <option>GPT-3.5</option>
              <option>Claude 3</option>
              <option>Gemini Pro</option>
              <option>Midjourney</option>
              <option>Stable Diffusion</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Prompt Type</label>
            <select 
              value={formData.prompt_type}
              onChange={e => setFormData({...formData, prompt_type: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
            >
              <option>Text-to-Image</option>
              <option>Code Generation</option>
              <option>Creative Writing</option>
              <option>Technical Specification</option>
              <option>Business/Marketing</option>
              <option>Academic/Research</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-all h-24 resize-none"
            placeholder="What does this prompt do? Why is it valuable?"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Prompt Content (Vaulted)</label>
            <button 
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !formData.content}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-primary font-bold hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              {isVerifying ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              {isVerifying ? 'Analyzing...' : 'Get AI Feedback'}
            </button>
          </div>
          <textarea 
            required
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-brand-primary transition-all h-48 resize-none"
            placeholder="Paste your prompt here. This will only be visible to owners."
          />
          
          <AnimatePresence>
            {aiFeedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">AI Analysis Result</span>
                    <span className="text-lg font-bold text-brand-primary">{aiFeedback.score}/100</span>
                  </div>
                  <p className="text-xs text-white/80 mb-2 font-bold">{aiFeedback.status}</p>
                  <p className="text-[11px] text-white/60 leading-relaxed italic">"{aiFeedback.feedback}"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Listing Price (ETH)</label>
            <input 
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-32 focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 bg-brand-primary text-black rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} />
            Mint Prompt NFT
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-brand-card border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-brand-primary w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Confirm Minting</h2>
              <p className="text-white/60 mb-8">
                You are about to mint <span className="text-white font-bold">"{formData.title}"</span> for <span className="text-brand-primary font-bold">{formData.price} WLD</span>. 
                This action will record your prompt on the World Chain.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmMint}
                  className="w-full py-4 bg-brand-primary text-black font-bold rounded-2xl hover:scale-[1.02] transition-all active:scale-95"
                >
                  Confirm & Mint
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Vault = () => {
  const { address, isConnected } = useWallet();
  const [owned, setOwned] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetch(`/api/users/${address}/vault`)
        .then(res => res.json())
        .then(data => {
          setOwned(data);
          setLoading(false);
        });
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-white/20 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Vault is Locked</h2>
        <p className="text-white/40 max-w-xs mb-8">Connect your wallet to access your private collection of prompts.</p>
        <button className="px-6 py-3 bg-brand-primary text-black font-bold rounded-full">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tighter mb-4">YOUR VAULT</h1>
        <div className="flex items-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-1">
            <Shield size={14} className="text-brand-primary" />
            <span>{owned.length} Assets Secured</span>
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Verified Provenance</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2].map(i => <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : owned.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-20 text-center">
          <ShoppingBag className="mx-auto mb-4 text-white/20" size={48} />
          <p className="text-white/40">No prompts in your vault yet.</p>
          <button className="mt-4 text-brand-primary font-bold hover:underline">Browse Marketplace</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {owned.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} isOwned />
          ))}
        </div>
      )}
    </div>
  );
};

const Favorites = () => {
  const { address, isConnected } = useWallet();
  const [favorites, setFavorites] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetch(`/api/users/${address}/favorites`)
        .then(res => res.json())
        .then(data => {
          setFavorites(data);
          setLoading(false);
        });
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Heart className="text-white/20 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Wishlist is Locked</h2>
        <p className="text-white/40 max-w-xs mb-8">Connect your wallet to access your saved prompts.</p>
        <button className="px-6 py-3 bg-brand-primary text-black font-bold rounded-full">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tighter mb-4">WISHLIST</h1>
        <div className="flex items-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-1">
            <Heart size={14} className="text-brand-primary" fill="currentColor" />
            <span>{favorites.length} Saved Prompts</span>
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Protocol Watchlist</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2].map(i => <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-20 text-center">
          <Heart className="mx-auto mb-4 text-white/20" size={48} />
          <p className="text-white/40">Your wishlist is empty.</p>
          <button className="mt-4 text-brand-primary font-bold hover:underline">Explore Marketplace</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
};

const SupportModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { address, isConnected } = useWallet();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setMessage('');
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-brand-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter mb-1">CONTACT SUPPORT</h2>
                  <p className="text-white/40 text-sm">Our team typically responds within 24 hours.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {sent ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="text-brand-primary w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-white/40">Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Wallet Address</label>
                    <input 
                      type="text" 
                      value={isConnected ? address : 'Not Connected'} 
                      disabled 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-primary/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you today?"
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-primary/50 outline-none transition-all resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-brand-primary text-black font-bold rounded-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Account = () => {
  const { address, isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <UserIcon className="text-white/20 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Account Locked</h2>
        <p className="text-white/40 max-w-xs mb-8">Connect your wallet to view your account and staking status.</p>
        <button className="px-6 py-3 bg-brand-primary text-black font-bold rounded-full">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tighter mb-4">ACCOUNT</h1>
        <div className="flex items-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-1">
            <Wallet size={14} className="text-brand-primary" />
            <span className="font-mono">{address}</span>
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span className="uppercase tracking-widest">Protocol Member</span>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Zap size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">STAKING DASHBOARD</h2>
          </div>
          <StakingDashboard />
        </section>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#05060b] text-white selection:bg-blue-500 selection:text-white">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && <LandingPage onStart={() => setActiveTab('market')} />}
              {activeTab === 'market' && <Marketplace />}
              {activeTab === 'mint' && <MintForm onComplete={() => setActiveTab('market')} />}
              {activeTab === 'vault' && <Vault />}
              {activeTab === 'favorites' && <Favorites />}
              {activeTab === 'account' && <Account />}
              {activeTab === 'assets' && <AssetsView />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-white/5 py-12 px-6 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="text-brand-primary w-5 h-5" />
              <span className="font-bold tracking-tighter">PROMPTVAULT</span>
            </div>
            <div className="flex gap-8 text-xs font-medium text-white/40 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <button 
                onClick={() => setIsSupportOpen(true)}
                className="hover:text-white transition-colors uppercase"
              >
                Support
              </button>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <p className="text-[10px] text-white/20 font-mono">© 2026 PROMPTVAULT PROTOCOL V1.0.4</p>
          </div>
        </footer>

        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </div>
    </WalletProvider>
  );
}
