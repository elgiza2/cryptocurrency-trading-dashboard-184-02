
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTonWallet } from './useTonWallet';
import { useTonPrice } from './useTonPrice';
import { useToast } from '@/hooks/use-toast';

export const useTonTransactions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendTransaction, isConnected } = useTonWallet();
  const { tonPrice } = useTonPrice();
  const { toast } = useToast();

  const PLATFORM_ADDRESS = "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq";
  const NETWORK_FEE = 0.005; // Reduced network fee

  // Buy cryptocurrency with TON using real-time prices
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
    
    try {
      // Calculate token amount using real-time prices
      const tokenPriceInUSD = token.current_price || 1; // Default to $1 if not set
      const tonValueInUSD = tonAmount * tonPrice;
      const tokenAmount = tonValueInUSD / tokenPriceInUSD;
      const totalCostWithFee = tonAmount + NETWORK_FEE;
      
      // Calculate the actual price per token in TON for database storage
      const tokenPriceInTON = tokenPriceInUSD / tonPrice;
      
      const comment = `Buy ${token.symbol}: ${tokenAmount.toFixed(4)} tokens for ${tonAmount.toFixed(4)} TON (Total: ${totalCostWithFee.toFixed(4)} TON)`;
      
      console.log('Buying crypto transaction details:', {
        token: token.symbol,
        tonAmountRequested: tonAmount,
        tokenAmount: tokenAmount,
        tokenPriceInUSD: tokenPriceInUSD,
        tokenPriceInTON: tokenPriceInTON,
        tonPrice: tonPrice,
        tonValueInUSD: tonValueInUSD,
        networkFee: NETWORK_FEE,
        totalCostWithFee: totalCostWithFee,
        comment: comment
      });

      // Send actual TON transaction
      const transactionResponse = await sendTransaction(PLATFORM_ADDRESS, totalCostWithFee, comment);
      console.log('TON transaction sent:', transactionResponse);
      
      // Price updates will be handled by admin or automated system
      
      // Record transaction in database and update user balance
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Insert transaction with available fields
        const { error: transactionError } = await supabase.from('transactions').insert({
          user_id: user.data.user.id,
          cryptocurrency_id: token.id,
          transaction_type: 'buy',
          amount: tokenAmount,
          price_usd: tokenPriceInUSD,
          total_usd: tonValueInUSD,
          status: 'completed'
        });

        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
        }

        // Update user's total balance after purchase
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

        // This section is no longer needed as we'll use wallet_holdings directly

        // Update wallet_holdings table automatically
        const { data: existingWalletHolding } = await supabase
          .from('wallet_holdings')
          .select()
          .eq('user_id', user.data.user.id)
          .eq('cryptocurrency_id', token.id)
          .single();

        if (existingWalletHolding) {
          await supabase
            .from('wallet_holdings')
            .update({
              balance: existingWalletHolding.balance + tokenAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingWalletHolding.id);
        } else {
          await supabase.from('wallet_holdings').insert({
            user_id: user.data.user.id,
            cryptocurrency_id: token.id,
            balance: tokenAmount
          });
        }

        // Trading volume updates will be handled separately if needed
      }
      
      return { tokenAmount, tonAmount };
    } catch (error) {
      console.error('Buy transaction failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, sendTransaction, tonPrice]);

  // Sell cryptocurrency for TON using real-time prices
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
    
    try {
      // Calculate TON amount using real-time prices
      const tokenPriceInUSD = token.current_price || 1; // Default to $1 if not set
      const tokenValueInUSD = tokenAmount * tokenPriceInUSD;
      const tonAmount = tokenValueInUSD / tonPrice;
      const netReceived = Math.max(0, tonAmount - NETWORK_FEE);
      
      // Calculate the actual price per token in TON for database storage
      const tokenPriceInTON = tokenPriceInUSD / tonPrice;
      
      const comment = `Sell ${token.symbol}: ${tokenAmount.toFixed(4)} tokens for ${tonAmount.toFixed(4)} TON (Net: ${netReceived.toFixed(4)} TON)`;
      
      console.log('Selling crypto transaction details:', {
        token: token.symbol,
        tokenAmountSold: tokenAmount,
        tonAmountReceived: tonAmount,
        tokenPriceInUSD: tokenPriceInUSD,
        tokenPriceInTON: tokenPriceInTON,
        tonPrice: tonPrice,
        tokenValueInUSD: tokenValueInUSD,
        networkFee: NETWORK_FEE,
        netReceived: netReceived,
        comment: comment
      });

      // For selling, we simulate the transaction (in a real implementation, this would trigger a different mechanism)
      console.log('Sell order processed (simulation):', comment);
      
      // Price updates will be handled by admin or automated system
      
      // Record transaction in database and update user balance
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Insert transaction with available fields
        const { error: transactionError } = await supabase.from('transactions').insert({
          user_id: user.data.user.id,
          cryptocurrency_id: token.id,
          transaction_type: 'sell',
          amount: tokenAmount,
          price_usd: tokenPriceInUSD,
          total_usd: tokenValueInUSD,
          status: 'completed'
        });

        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
        }

        // Update user's total balance after sale (add TON received)
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

        // This section is no longer needed as we'll use wallet_holdings directly

        // Update wallet_holdings table automatically
        const { data: existingWalletHolding } = await supabase
          .from('wallet_holdings')
          .select()
          .eq('user_id', user.data.user.id)
          .eq('cryptocurrency_id', token.id)
          .single();

        if (existingWalletHolding && existingWalletHolding.balance >= tokenAmount) {
          await supabase
            .from('wallet_holdings')
            .update({
              balance: existingWalletHolding.balance - tokenAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingWalletHolding.id);
        }

        // Trading volume updates will be handled separately if needed
      }
      
      return { tokenAmount, tonAmount };
    } catch (error) {
      console.error('Sell transaction failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, sendTransaction, tonPrice]);

  // Helper functions removed as they reference non-existent tables

  return {
    buyCrypto,
    sellCrypto,
    isProcessing,
    NETWORK_FEE
  };
};
