import React from 'react';
import { motion } from 'motion/react';
import { Zap, TrendingUp, Award, Gift, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useEconomy } from '../../hooks/economy/useEconomy';

export const StakingDashboard: React.FC = () => {
  const { 
    stakedAmount, 
    pendingRewards, 
    tier, 
    discount, 
    loading, 
    claimRewards,
    balance 
  } = useEconomy();

  const [isClaiming, setIsClaiming] = React.useState(false);

  const tierInfo = [
    { name: 'None', min: 0, discount: 0, color: 'text-white/40' },
    { name: 'Bronze', min: 100, discount: 5, color: 'text-orange-400' },
    { name: 'Silver', min: 1000, discount: 15, color: 'text-slate-300' },
    { name: 'Gold', min: 10000, discount: 40, color: 'text-yellow-400' }
  ];

  const currentTier = tierInfo[tier];

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await claimRewards();
      alert('Rewards claimed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to claim rewards.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="text-brand-primary animate-spin mb-4" size={32} />
        <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em]">Synchronizing Protocol Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-brand-card border border-white/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Current Tier</span>
          </div>
          <p className={`text-3xl font-bold tracking-tighter ${currentTier.color}`}>{currentTier.name.toUpperCase()}</p>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Protocol Status</p>
        </div>

        <div className="p-6 bg-brand-card border border-white/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Zap size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Staked</span>
          </div>
          <p className="text-3xl font-bold tracking-tighter">{parseFloat(stakedAmount).toLocaleString()} <span className="text-xs text-brand-primary">UNIQ</span></p>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Locked in Protocol</p>
        </div>

        <div className="p-6 bg-brand-card border border-white/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Discount</span>
          </div>
          <p className="text-3xl font-bold tracking-tighter text-brand-primary">{discount}% OFF</p>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">On All Prompt Unlocks</p>
        </div>

        <div className="p-6 bg-brand-card border border-white/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Gift size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pending Rewards</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tighter">{parseFloat(pendingRewards).toFixed(4)}</p>
            <span className="text-xs text-brand-primary font-bold">UNIQ</span>
          </div>
          <button 
            onClick={handleClaim}
            disabled={isClaiming || parseFloat(pendingRewards) <= 0}
            className="mt-4 w-full py-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-primary/20 transition-all disabled:opacity-30"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      </div>

      {/* Tier Progress / Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-brand-card border border-white/5 rounded-[32px]">
          <h3 className="text-xl font-bold tracking-tight mb-8">DISCOUNT TIERS</h3>
          <div className="space-y-6">
            {tierInfo.slice(1).map((t, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all ${tier === i + 1 ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier === i + 1 ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/10 text-white/40'}`}>
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${tier === i + 1 ? 'text-white' : 'text-white/60'}`}>{t.name.toUpperCase()}</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Min. Stake: {t.min.toLocaleString()} UNIQ</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold tracking-tighter ${tier === i + 1 ? 'text-brand-primary' : 'text-white/40'}`}>{t.discount}% OFF</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Marketplace Discount</p>
                  </div>
                </div>
                {tier === i + 1 && (
                  <div className="flex items-center gap-2 text-[10px] text-brand-primary font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                    Currently Active
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-brand-primary text-black rounded-[32px]">
            <h3 className="text-xl font-bold tracking-tight mb-2">STAKE $UNIQ</h3>
            <p className="text-sm font-medium opacity-70 mb-8">Increase your tier to unlock higher discounts and earn protocol rewards.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                <span>Available Balance</span>
                <span>{parseFloat(balance).toLocaleString()} UNIQ</span>
              </div>
              <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <ArrowUpRight size={16} />
                Stake Tokens
              </button>
              <button className="w-full py-4 bg-black/10 border border-black/20 text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/20 transition-all flex items-center justify-center gap-2">
                <ArrowDownRight size={16} />
                Unstake Tokens
              </button>
            </div>
          </div>

          <div className="p-8 bg-white/5 border border-white/5 rounded-[32px]">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Protocol Insights</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">Estimated APY</span>
                <span className="text-[11px] text-brand-primary font-bold">10.0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">Distribution</span>
                <span className="text-[11px] text-white/80">Daily</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/60">Unstaking Period</span>
                <span className="text-[11px] text-white/80">Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
