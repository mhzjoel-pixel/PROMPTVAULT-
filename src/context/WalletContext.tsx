import React, { createContext, useContext, useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isHuman: boolean;
  isMiniKit: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  verifyHuman: (proof: any) => Promise<void>;
  signInWithWorldID: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (promptId: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(localStorage.getItem('wallet_address'));
  const [isHuman, setIsHuman] = useState<boolean>(false);
  const [isMiniKit, setIsMiniKit] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (address) {
      fetch(`/api/users/${address}/favorites`)
        .then(res => res.json())
        .then(data => setFavorites(data.map((p: any) => p.id)))
        .catch(err => console.error('Failed to fetch favorites:', err));
    } else {
      setFavorites([]);
    }
  }, [address]);

  const toggleFavorite = async (promptId: string) => {
    if (!address) return;
    const isFavorite = favorites.includes(promptId);
    
    if (isFavorite) {
      const res = await fetch(`/api/favorites/${promptId}?address=${address}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(id => id !== promptId));
      }
    } else {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, prompt_id: promptId })
      });
      if (res.ok) {
        setFavorites(prev => [...prev, promptId]);
      }
    }
  };

  useEffect(() => {
    // Install MiniKit
    if (typeof window !== 'undefined') {
      const appId = (import.meta as any).env?.VITE_WLD_APP_ID || 'app_staging_123';
      const result = MiniKit.install(appId);
      if (result.success) {
        setIsMiniKit(true);
        // If in World App, we might already have user info
        if (MiniKit.user?.walletAddress) {
          setAddress(MiniKit.user.walletAddress);
          localStorage.setItem('wallet_address', MiniKit.user.walletAddress);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetch(`/api/users/${address}`)
        .then(res => res.json())
        .then(data => setIsHuman(!!data.is_human))
        .catch(() => setIsHuman(false));
    }
  }, [address]);

  const connect = async () => {
    setIsConnecting(true);
    if (isMiniKit) {
      try {
        const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce: Math.random().toString(36).slice(2),
          requestId: 'auth_request_' + Date.now(),
          expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
          notBefore: new Date(),
          statement: 'Sign in to Prompt Vault to access your digital assets.',
        });

        if (finalPayload.status === 'success' && finalPayload.address) {
          setAddress(finalPayload.address);
          localStorage.setItem('wallet_address', finalPayload.address);
          
          // Register user in DB
          await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              address: finalPayload.address, 
              username: `User_${finalPayload.address.slice(2, 6)}` 
            }),
          });
        }
      } catch (err) {
        console.error('Wallet Auth failed:', err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Demo fallback for non-MiniKit environments
      // Simulate loading
      setTimeout(async () => {
        const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
        setAddress(mockAddress);
        localStorage.setItem('wallet_address', mockAddress);
        
        await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: mockAddress, username: `User_${mockAddress.slice(2, 6)}` }),
        });
        setIsConnecting(false);
      }, 1000);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsHuman(false);
    localStorage.removeItem('wallet_address');
  };

  const verifyHuman = async (proof: any) => {
    if (!address) return;
    const res = await fetch('/api/verify-world-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof, address }),
    });
    if (res.ok) {
      setIsHuman(true);
    }
  };

  const signInWithWorldID = async () => {
    if (isMiniKit) {
      // This is a simplified version of World ID verification via MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'verify_human',
        signal: address || 'anonymous'
      });

      if (finalPayload.status === 'success') {
        await verifyHuman(finalPayload);
      }
    } else {
      // Demo fallback for non-MiniKit environments
      console.log('Demo verification triggered');
      await verifyHuman({ nullifier_hash: 'demo_nullifier_' + Date.now() });
    }
  };

  return (
    <WalletContext.Provider value={{ 
      address, 
      isConnected: !!address, 
      isHuman, 
      isMiniKit, 
      isConnecting, 
      connect, 
      disconnect, 
      verifyHuman, 
      signInWithWorldID,
      favorites,
      toggleFavorite
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
