
import { useState, useCallback } from 'react';
import { DatabaseService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface UserNFT {
  id: string;
  nft_id: string;
  name: string;
  image: string;
  mining_power: number;
  price: number;
  rarity: string;
  purchase_date: string;
}

export const useNFT = () => {
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [totalMiningPower, setTotalMiningPower] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadUserNFTs = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await DatabaseService.getUserNFTs(userId);
      
      if (error) throw error;
      
      setUserNFTs(data || []);
      
      // Calculate total mining power
      const totalPower = (data || []).reduce((sum, nft) => sum + nft.mining_power, 0);
      setTotalMiningPower(totalPower);
      
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to load your NFTs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getMiningMultiplier = useCallback(() => {
    if (totalMiningPower === 0) return 1; // Default mining rate without NFT
    return totalMiningPower;
  }, [totalMiningPower]);

  return {
    userNFTs,
    totalMiningPower,
    isLoading,
    loadUserNFTs,
    getMiningMultiplier
  };
};
