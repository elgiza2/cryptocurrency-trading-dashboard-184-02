
import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { TonTransactionService } from '@/services/tonTransactionService';

export interface TonTransaction {
  to: string;
  value: string;
  data?: string;
}

export const useTonWallet = () => {
  const [tonConnectUI] = useTonConnectUI();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize transaction service
  const transactionService = new TonTransactionService(tonConnectUI);

  // Enhanced connection checking with better error handling
  const checkConnection = useCallback(async () => {
    if (!tonConnectUI) {
      console.log('❌ TonConnectUI not initialized');
      return;
    }

    try {
      console.log('🔍 Checking TON wallet connection...');
      console.log('📱 TonConnectUI instance:', !!tonConnectUI);
      console.log('🔗 Connection status:', tonConnectUI?.connected);
      console.log('💳 Current wallet:', tonConnectUI?.wallet);
      
      const connected = tonConnectUI.connected;
      const hasWallet = !!tonConnectUI.wallet;
      
      console.log('🎯 Connection check results:', { connected, hasWallet });
      
      // Update connection state
      setIsConnected(connected && hasWallet);
      setConnectionError(null);
      
      if (connected && hasWallet && tonConnectUI.wallet?.account) {
        const address = tonConnectUI.wallet.account.address;
        console.log('✅ Wallet connected successfully');
        console.log('📍 Wallet address:', address);
        
        setWalletAddress(address);
        
        // Fetch balance with improved error handling
        try {
          console.log('💰 Fetching wallet balance...');
          const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('📊 Balance API response:', data);
          
          if (data.ok && data.result) {
            const balanceInTon = (parseInt(data.result) / 1_000_000_000).toFixed(4);
            setBalance(balanceInTon);
            console.log('✅ Balance fetched successfully:', balanceInTon, 'TON');
          } else {
            console.warn('⚠️ Balance API returned error:', data);
            setBalance('0.0000');
          }
        } catch (balanceError) {
          console.error('❌ Failed to fetch balance:', balanceError);
          setBalance('0.0000');
        }
      } else {
        console.log('❌ Wallet not connected or no account info');
        setWalletAddress(null);
        setBalance(null);
      }
    } catch (error) {
      console.error('💥 Connection check error:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  }, [tonConnectUI]);

  // Enhanced effect for monitoring TON Connect UI changes
  useEffect(() => {
    if (!tonConnectUI) {
      console.log('⏳ Waiting for TonConnectUI initialization...');
      return;
    }

    console.log('🚀 TonConnectUI initialized, setting up listeners...');
    
    // Initial connection check
    checkConnection();
    
    // Enhanced status change listener
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      console.log('🔄 === Wallet status changed ===');
      console.log('🔄 New wallet object:', wallet);
      console.log('🔄 Connection status:', !!wallet);
      
      // Immediate state updates
      const connected = !!wallet;
      setIsConnected(connected);
      
      if (wallet?.account) {
        const address = wallet.account.address;
        setWalletAddress(address);
        setConnectionError(null);
        console.log('✅ Wallet connected via status change:', address);
        
        // Show success toast
        toast({
          title: "Connection Successful",
          description: "TON wallet connected successfully",
        });
      } else {
        setWalletAddress(null);
        setBalance(null);
        console.log('❌ Wallet disconnected via status change');
      }
      
      // Re-check connection after a short delay
      setTimeout(() => {
        checkConnection();
      }, 200);
    });
    
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up wallet status listener');
        unsubscribe();
      }
    };
  }, [tonConnectUI, checkConnection, toast]);

  // Enhanced connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      if (!tonConnectUI) {
        throw new Error('TonConnect UI not initialized');
      }

      console.log('🚀 === Attempting wallet connection ===');
      console.log('🔍 Current connection status:', tonConnectUI.connected);
      console.log('💳 Current wallet:', tonConnectUI.wallet);
      
      // Check if already connected properly
      if (tonConnectUI.connected && tonConnectUI.wallet?.account) {
        console.log('✅ Wallet already connected, forcing UI update');
        setIsConnected(true);
        setWalletAddress(tonConnectUI.wallet.account.address);
        
        toast({
          title: "Wallet Already Connected",
          description: "TON wallet is connected and ready to use",
        });
        return;
      }

      setIsLoading(true);
      setConnectionError(null);
      
      console.log('📱 Opening connection modal...');
      
      // Open the modal and wait for user interaction
      await tonConnectUI.openModal();
      
      console.log('✅ Connection modal opened successfully');
      
    } catch (error) {
      console.error('💥 Connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Failed",
        description: `Failed to connect TON wallet: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI, toast]);

  // Enhanced disconnect function
  const disconnectWallet = useCallback(async () => {
    try {
      if (!tonConnectUI) {
        throw new Error('TonConnect UI not initialized');
      }

      console.log('🔌 Disconnecting wallet...');
      setIsLoading(true);
      
      await tonConnectUI.disconnect();
      
      // Reset state immediately
      setWalletAddress(null);
      setBalance(null);
      setIsConnected(false);
      setConnectionError(null);
      
      console.log('✅ Wallet disconnected successfully');
      
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error) {
      console.error('💥 Failed to disconnect wallet:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tonConnectUI, toast]);

  // Enhanced sendTransaction with better error handling
  const sendTransaction = useCallback(async (
    toAddress: string, 
    amountTon: number, 
    comment?: string
  ) => {
    console.log('🎬 === Starting transaction from wallet ===');
    console.log('📤 Transaction details:', { toAddress, amountTon, comment });

    if (!isConnected || !tonConnectUI) {
      const error = 'Wallet not connected';
      console.error('❌', error);
      throw new Error(error);
    }

    if (!amountTon || amountTon <= 0) {
      const error = `Invalid amount: ${amountTon}`;
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      setIsLoading(true);
      
      console.log('💸 Sending transaction via service...');
      const result = await transactionService.sendTransaction(toAddress, amountTon, comment);
      
      console.log('✅ Transaction sent successfully:', result);
      toast({
        title: "Transaction Sent",
        description: `${amountTon} TON sent successfully`,
      });

      return result;
      
    } catch (error) {
      console.error('💥 Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown transaction error';
      
      toast({
        title: "Transaction Failed",
        description: `Failed to send TON: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 === Transaction from wallet ended ===');
    }
  }, [isConnected, transactionService, toast, tonConnectUI]);

  // Format address for display
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    isConnected,
    walletAddress,
    balance,
    isLoading,
    connectionError,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    formatAddress,
    tonConnectUI
  };
};
