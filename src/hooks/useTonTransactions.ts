
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
      
      // Update price using database function
      const { error: priceError } = await supabase.rpc('update_crypto_price', {
        crypto_id: token.id,
        trade_volume: totalCostWithFee,
        trade_type: 'buy'
      });

      if (priceError) {
        console.error('Error updating price:', priceError);
      }
      
      // Record transaction in database and update user balance
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Insert detailed transaction with accurate values
        const { error: transactionError } = await supabase.from('detailed_transactions').insert({
          user_id: user.data.user.id,
          cryptocurrency_id: token.id,
          transaction_type: 'buy',
          amount: tokenAmount,
          price_per_token: tokenPriceInTON,
          total_value_usd: tonValueInUSD,
          fee_amount: NETWORK_FEE,
          fee_usd: NETWORK_FEE * tonPrice,
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

        // Update or create crypto holder
        const { data: existingHolder } = await supabase
          .from('crypto_holders')
          .select()
          .eq('user_id', user.data.user.id)
          .eq('cryptocurrency_id', token.id)
          .single();

        if (existingHolder) {
          const newBalance = existingHolder.balance + tokenAmount;
          const newTotalInvested = existingHolder.total_invested_usd + tonValueInUSD;
          const newAveragePrice = newTotalInvested / newBalance;
          
          await supabase
            .from('crypto_holders')
            .update({
              balance: newBalance,
              total_invested_usd: newTotalInvested,
              average_buy_price: newAveragePrice,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', existingHolder.id);
        } else {
          await supabase.from('crypto_holders').insert({
            user_id: user.data.user.id,
            cryptocurrency_id: token.id,
            balance: tokenAmount,
            total_invested_usd: tonValueInUSD,
            average_buy_price: tokenPriceInTON,
            first_purchase_at: new Date().toISOString()
          });
        }

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

        await updateTradingVolume(token.id, 'buy', tokenAmount, tonValueInUSD);
        await updateComprehensiveMetrics(token.id);
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
      
      // Update price using database function
      const { error: priceError } = await supabase.rpc('update_crypto_price', {
        crypto_id: token.id,
        trade_volume: tonAmount,
        trade_type: 'sell'
      });

      if (priceError) {
        console.error('Error updating price:', priceError);
      }
      
      // Record transaction in database and update user balance
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        // Insert detailed transaction with actual values
        const { error: transactionError } = await supabase.from('detailed_transactions').insert({
          user_id: user.data.user.id,
          cryptocurrency_id: token.id,
          transaction_type: 'sell',
          amount: tokenAmount,
          price_per_token: tokenPriceInTON,
          total_value_usd: tokenValueInUSD,
          fee_amount: NETWORK_FEE,
          fee_usd: NETWORK_FEE * tonPrice,
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

        // Update holder balance
        const { data: existingHolder } = await supabase
          .from('crypto_holders')
          .select()
          .eq('user_id', user.data.user.id)
          .eq('cryptocurrency_id', token.id)
          .single();

        if (existingHolder && existingHolder.balance >= tokenAmount) {
          await supabase
            .from('crypto_holders')
            .update({
              balance: existingHolder.balance - tokenAmount,
              last_activity_at: new Date().toISOString()
            })
            .eq('id', existingHolder.id);
        }

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

        await updateTradingVolume(token.id, 'sell', tokenAmount, tokenValueInUSD);
        await updateComprehensiveMetrics(token.id);
      }
      
      return { tokenAmount, tonAmount };
    } catch (error) {
      console.error('Sell transaction failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, sendTransaction, tonPrice]);

  // Helper function to update trading volume
  const updateTradingVolume = async (
    cryptoId: string,
    type: 'buy' | 'sell',
    tokenAmount: number,
    usdAmount: number
  ) => {
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    
    const { data: existingVolume } = await supabase
      .from('trading_volumes')
      .select()
      .eq('cryptocurrency_id', cryptoId)
      .eq('hour_timestamp', currentHour.toISOString())
      .single();

    if (existingVolume) {
      const updateData: any = {
        transactions_count: existingVolume.transactions_count + 1,
      };

      if (type === 'buy') {
        updateData.buy_volume = existingVolume.buy_volume + tokenAmount;
        updateData.buy_volume_usd = existingVolume.buy_volume_usd + usdAmount;
        updateData.net_volume = existingVolume.net_volume + tokenAmount;
      } else {
        updateData.sell_volume = existingVolume.sell_volume + tokenAmount;
        updateData.sell_volume_usd = existingVolume.sell_volume_usd + usdAmount;
        updateData.net_volume = existingVolume.net_volume - tokenAmount;
      }

      await supabase
        .from('trading_volumes')
        .update(updateData)
        .eq('id', existingVolume.id);
    } else {
      const insertData: any = {
        cryptocurrency_id: cryptoId,
        hour_timestamp: currentHour.toISOString(),
        transactions_count: 1,
        unique_traders: 1
      };

      if (type === 'buy') {
        insertData.buy_volume = tokenAmount;
        insertData.buy_volume_usd = usdAmount;
        insertData.net_volume = tokenAmount;
      } else {
        insertData.sell_volume = tokenAmount;
        insertData.sell_volume_usd = usdAmount;
        insertData.net_volume = -tokenAmount;
      }

      await supabase.from('trading_volumes').insert(insertData);
    }
  };

  // Helper function to update comprehensive metrics
  const updateComprehensiveMetrics = async (cryptoId: string) => {
    await supabase.rpc('update_comprehensive_metrics', {
      crypto_id: cryptoId
    });
  };

  return {
    buyCrypto,
    sellCrypto,
    isProcessing,
    NETWORK_FEE
  };
};
