import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { ethers } from 'ethers';

// Contract ABIs (Simplified)
const UNIQ_ABI = ["function balanceOf(address) view returns (uint256)"];
const STAKING_ABI = [
  "function getTier(address) view returns (uint8)",
  "function getDiscount(address) view returns (uint256)",
  "function stakes(address) view returns (uint256 amount, uint256 since)",
  "function rewards(address) view returns (uint256)",
  "function claimReward() external"
];

export const useEconomy = () => {
  const { address, isConnected } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [tier, setTier] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const UNIQ_ADDRESS = process.env.VITE_UNIQ_TOKEN_ADDRESS || '';
  const STAKING_ADDRESS = process.env.VITE_STAKING_ADDRESS || '';

  const checkEconomy = async () => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const tokenContract = new ethers.Contract(UNIQ_ADDRESS, UNIQ_ABI, provider);
      const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);

      const [rawBalance, rawTier, rawDiscount, rawStake, rawRewards] = await Promise.all([
        tokenContract.balanceOf(address),
        stakingContract.getTier(address),
        stakingContract.getDiscount(address),
        stakingContract.stakes(address),
        stakingContract.rewards(address)
      ]);

      setBalance(ethers.utils.formatEther(rawBalance));
      setTier(rawTier);
      setDiscount(rawDiscount.toNumber());
      setStakedAmount(ethers.utils.formatEther(rawStake.amount));
      setPendingRewards(ethers.utils.formatEther(rawRewards));
    } catch (err) {
      console.error('Failed to fetch economy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEconomy();
    const interval = setInterval(checkEconomy, 60000);
    return () => clearInterval(interval);
  }, [address, isConnected]);

  const claimRewards = async () => {
    if (!isConnected || !address) return;
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      
      const tx = await stakingContract.claimReward();
      await tx.wait();
      await checkEconomy();
    } catch (err) {
      console.error('Claim failed:', err);
      throw err;
    }
  };

  const hasAccess = (requiredTier: number = 0) => {
    return tier >= requiredTier;
  };

  return { balance, stakedAmount, pendingRewards, tier, discount, loading, hasAccess, claimRewards, refresh: checkEconomy };
};
