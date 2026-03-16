import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Zap, Shield, CreditCard, X, CheckCircle2 } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, item }) => {
  const { address, isConnected, payWithMiniKit } = useWallet();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handlePurchase = async (method: 'stable' | 'native') => {
    if (!isConnected) return;
    
    setStatus('processing');
    try {
      // Platform SDK call
      const result = await payWithMiniKit({
        recipient: process.env.VITE_RECEIVER_WALLET || '{{RECEIVING_WALLET}}',
        amount: item.price,
        currency: method === 'stable' ? 'USDC' : 'WLD',
        desc: `Unlock Prompt: ${item.title}`
      });

      if (result.success) {
        // Send to our backend webhook
        await fetch('/api/economy/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: result.transactionId,
            userId: address,
            itemId: item.id,
            amount: item.price,
            currency: method === 'stable' ? 'USDC' : 'WLD',
            receipt: result.receipt
          })
        });
        setStatus('success');
        setTimeout(onClose, 2000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      setStatus('error');
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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tighter mb-1">UNLOCK PROMPT</h2>
                  <p className="text-white/40 text-sm">Secure on-chain transaction</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">{item.title}</span>
                  <span className="font-bold text-brand-primary">{item.price} {item.currency}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                  <Shield size={12} />
                  <span>Instant Access Post-Payment</span>
                </div>
              </div>

              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                  <p className="text-white/40 text-sm">The prompt has been added to your vault.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => handlePurchase('stable')}
                    disabled={status === 'processing'}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    {status === 'processing' ? 'Processing...' : 'Pay with USDC'}
                  </button>
                  <button 
                    onClick={() => handlePurchase('native')}
                    disabled={status === 'processing'}
                    className="w-full py-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold rounded-xl hover:bg-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Zap size={18} />
                    {status === 'processing' ? 'Processing...' : 'Pay with WLD'}
                  </button>
                  
                  {status === 'error' && (
                    <p className="text-red-500 text-xs text-center mt-4">
                      Transaction failed. Please check your balance or try again.
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-[10px] text-white/20 text-center mt-8 uppercase tracking-widest">
                Powered by PromptVault Protocol
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
