import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Check, X, Zap, Shield } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export const SubscriptionModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { address, isConnected, payWithMiniKit } = useWallet();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = {
    weekly: { id: 'sub_weekly', price: 5, label: 'Weekly Pass', duration: '7 Days' },
    monthly: { id: 'sub_monthly', price: 15, label: 'Monthly Pass', duration: '30 Days' }
  };

  const handleSubscribe = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const plan = plans[selectedPlan];
      const result = await payWithMiniKit({
        recipient: process.env.VITE_RECEIVER_WALLET || '{{RECEIVING_WALLET}}',
        amount: plan.price,
        currency: 'USDC',
        desc: `Subscription: ${plan.label}`
      });

      if (result.success) {
        await fetch('/api/economy/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: address,
            planId: plan.id,
            transactionId: result.transactionId
          })
        });
        onClose();
      }
    } catch (err) {
      console.error('Subscription failed:', err);
    } finally {
      setLoading(false);
    }
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
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0b10] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Benefits */}
              <div className="p-10 bg-brand-primary/5 border-r border-white/5">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="text-brand-primary w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tighter mb-6">PROMPTVAULT<br/><span className="text-brand-primary">PREMIUM</span></h2>
                
                <ul className="space-y-4">
                  {[
                    'Unlimited Access to Basic Prompts',
                    '20% Discount on Premium Packs',
                    'Early Access to New Releases',
                    'Exclusive "Verified Member" Badge',
                    'Priority Support'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <div className="w-5 h-5 bg-brand-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-brand-primary" />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Selection */}
              <div className="p-10 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-bold">Choose Plan</h3>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-10">
                  {(['weekly', 'monthly'] as const).map((planKey) => (
                    <button
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`w-full p-6 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                        selectedPlan === planKey 
                          ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(0,255,163,0.1)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{plans[planKey].duration}</p>
                          <h4 className="text-lg font-bold">{plans[planKey].label}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${plans[planKey].price}</p>
                          <p className="text-[10px] text-white/40 uppercase">One-time Payment</p>
                        </div>
                      </div>
                      {selectedPlan === planKey && (
                        <motion.div layoutId="activePlan" className="absolute inset-0 bg-brand-primary/5" />
                      )}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-5 bg-brand-primary text-black font-bold rounded-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap size={18} fill="currentColor" />
                  {loading ? 'Processing...' : 'Activate Premium'}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-white/20 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Shield size={10} />
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
