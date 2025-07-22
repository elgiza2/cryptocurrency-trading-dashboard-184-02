import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTonWallet } from './useTonWallet';
import { useTonPrice } from './useTonPrice';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTonTransactionService, TransactionResult } from '@/services/enhancedTonTransactionService';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const useEnhancedTonTransactions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const { isConnected } = useTonWallet();
  const { tonPrice } = useTonPrice();
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();

  const PLATFORM_ADDRESS = "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq";
  const NETWORK_FEE = 0.005;

  // Initialize service
  const getTransactionService = useCallback(() => {
    if (!tonConnectUI) {
      throw new Error('TON Connect UI not initialized');
    }
    return new EnhancedTonTransactionService(tonConnectUI);
  }, [tonConnectUI]);

  // Enhanced error handling with user-friendly messages
  const handleTransactionError = useCallback((error: string) => {
    console.error('Transaction error:', error);
    
    let userMessage = 'حدث خطأ في المعاملة';
    let description = error;

    if (error.includes('not connected')) {
      userMessage = 'المحفظة غير متصلة';
      description = 'يرجى ربط محفظة TON أولاً';
    } else if (error.includes('insufficient')) {
      userMessage = 'رصيد غير كافي';
      description = 'الرصيد في محفظتك غير كافي لإتمام هذه المعاملة';
    } else if (error.includes('rate limit')) {
      userMessage = 'تم تجاوز الحد المسموح';
      description = 'يرجى الانتظار قبل إرسال معاملة أخرى';
    } else if (error.includes('invalid address')) {
      userMessage = 'عنوان غير صحيح';
      description = 'عنوان المحفظة المستقبلة غير صحيح';
    } else if (error.includes('cancelled')) {
      userMessage = 'تم إلغاء المعاملة';
      description = 'تم إلغاء المعاملة من قبل المستخدم';
    }

    toast({
      title: userMessage,
      description: description,
      variant: "destructive"
    });

    setTransactionStatus('failed');
  }, [toast]);

  // Enhanced success handling
  const handleTransactionSuccess = useCallback((result: TransactionResult) => {
    console.log('Transaction successful:', result);
    
    toast({
      title: "تمت المعاملة بنجاح! ✅",
      description: `تم إرسال المعاملة بنجاح. معرف المعاملة: ${result.transactionHash?.substring(0, 8)}...`,
    });

    setTransactionStatus('confirmed');
  }, [toast]);

  // Enhanced buy crypto with better user experience
  const buyCrypto = useCallback(async (
    token: any,
    tonAmount: number
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!tonAmount || tonAmount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!tonPrice || tonPrice <= 0) {
      throw new Error('TON price not available. Please try again.');
    }

    setIsProcessing(true);
    setTransactionStatus('pending');
    
    try {
      const transactionService = getTransactionService();
      
      // Calculate token amount using real-time prices
      const tokenPriceInUSD = token.current_price || 1;
      const tonValueInUSD = tonAmount * tonPrice;
      const tokenAmount = tonValueInUSD / tokenPriceInUSD;
      const totalCostWithFee = tonAmount + NETWORK_FEE;
      
      console.log('Enhanced buying crypto transaction:', {
        token: token.symbol,
        tonAmount,
        tokenAmount,
        tokenPriceInUSD,
        tonPrice,
        totalCostWithFee
      });

      // Send transaction using enhanced service
      const result = await transactionService.buyCrypto(
        token.id,
        totalCostWithFee,
        tokenPriceInUSD,
        PLATFORM_ADDRESS
      );

      if (result.success) {
        // Update user balance and holdings
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          // Update wallet holdings
          const { data: existingHolding } = await supabase
            .from('wallet_holdings')
            .select()
            .eq('user_id', user.data.user.id)
            .eq('cryptocurrency_id', token.id)
            .single();

          if (existingHolding) {
            await supabase
              .from('wallet_holdings')
              .update({
                balance: existingHolding.balance + tokenAmount,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingHolding.id);
          } else {
            await supabase.from('wallet_holdings').insert({
              user_id: user.data.user.id,
              cryptocurrency_id: token.id,
              balance: tokenAmount
            });
          }

          // Update user total balance
          const { data: userData } = await supabase
            .from('users')
            .select('total_balance')
            .eq('id', user.data.user.id)
            .single();

          if (userData) {
            await supabase
              .from('users')
              .update({
                total_balance: userData.total_balance + tokenAmount
              })
              .eq('id', user.data.user.id);
          }
        }

        handleTransactionSuccess(result);
        return { tokenAmount, tonAmount };
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleTransactionError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, tonPrice, getTransactionService, handleTransactionSuccess, handleTransactionError]);

  // Enhanced sell crypto
  const sellCrypto = useCallback(async (
    token: any,
    tokenAmount: number
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!tonPrice || tonPrice <= 0) {
      throw new Error('TON price not available. Please try again.');
    }

    setIsProcessing(true);
    setTransactionStatus('pending');
    
    try {
      // Calculate TON amount using real-time prices
      const tokenPriceInUSD = token.current_price || 1;
      const tokenValueInUSD = tokenAmount * tokenPriceInUSD;
      const tonAmount = tokenValueInUSD / tonPrice;
      const netReceived = Math.max(0, tonAmount - NETWORK_FEE);
      
      console.log('Enhanced selling crypto transaction:', {
        token: token.symbol,
        tokenAmount,
        tonAmount,
        tokenPriceInUSD,
        tonPrice,
        netReceived
      });

      // For selling, we simulate the transaction for now
      // In production, this would involve a more complex flow
      const simulatedResult: TransactionResult = {
        success: true,
        transactionHash: `sim_${Date.now()}`,
        details: {
          toAddress: PLATFORM_ADDRESS,
          amountTON: tonAmount,
          amountNanotons: (tonAmount * 1_000_000_000).toString(),
          comment: `Sell ${token.symbol}`,
          timestamp: Date.now(),
          status: 'confirmed'
        }
      };

      // Update database
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Record sell transaction
        await supabase.from('transactions').insert({
          user_id: user.data.user.id,
          cryptocurrency_id: token.id,
          transaction_type: 'sell',
          amount: tokenAmount,
          price_usd: tokenPriceInUSD,
          total_usd: tokenValueInUSD,
          status: 'completed'
        });

        // Update wallet holdings
        const { data: existingHolding } = await supabase
          .from('wallet_holdings')
          .select()
          .eq('user_id', user.data.user.id)
          .eq('cryptocurrency_id', token.id)
          .single();

        if (existingHolding && existingHolding.balance >= tokenAmount) {
          await supabase
            .from('wallet_holdings')
            .update({
              balance: existingHolding.balance - tokenAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingHolding.id);
        }

        // Update user total balance
        const { data: userData } = await supabase
          .from('users')
          .select('total_balance')
          .eq('id', user.data.user.id)
          .single();

        if (userData) {
          await supabase
            .from('users')
            .update({
              total_balance: userData.total_balance + netReceived
            })
            .eq('id', user.data.user.id);
        }
      }

      handleTransactionSuccess(simulatedResult);
      return { tokenAmount, tonAmount: netReceived };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleTransactionError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, tonPrice, handleTransactionSuccess, handleTransactionError]);

  // Send TON to another address
  const sendTon = useCallback(async (
    toAddress: string,
    amount: number,
    comment?: string
  ) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    setTransactionStatus('pending');

    try {
      const transactionService = getTransactionService();
      const result = await transactionService.sendTransaction(toAddress, amount, comment);

      if (result.success) {
        handleTransactionSuccess(result);
        return result;
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      handleTransactionError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, getTransactionService, handleTransactionSuccess, handleTransactionError]);

  // Get transaction history
  const getTransactionHistory = useCallback(async (limit: number = 10) => {
    try {
      const transactionService = getTransactionService();
      return await transactionService.getTransactionHistory(limit);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }, [getTransactionService]);

  return {
    buyCrypto,
    sellCrypto,
    sendTon,
    getTransactionHistory,
    isProcessing,
    transactionStatus,
    NETWORK_FEE
  };
};