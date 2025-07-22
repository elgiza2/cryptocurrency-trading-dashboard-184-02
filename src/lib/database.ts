import { supabase } from "@/integrations/supabase/client";

// Database service functions for the app
export class DatabaseService {
  
  // User Management
  static async createOrUpdateUser(telegramUser: any) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id.toString())
        .single();

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            telegram_username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium,
            updated_at: new Date().toISOString()
          })
          .eq('telegram_id', telegramUser.id.toString())
          .select()
          .single();

        return { data, error };
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            telegram_id: telegramUser.id.toString(),
            telegram_username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium
          })
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return { data: null, error };
    }
  }

  // Mining Sessions
  static async createMiningSession(userId: string, durationHours: number = 8, rewardAmount: number = 125.5) {
    try {
      const { data, error } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          duration_hours: durationHours,
          reward_amount: rewardAmount,
          is_active: true
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating mining session:', error);
      return { data: null, error };
    }
  }

  static async getMiningSession(userId: string) {
    try {
      const { data, error } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async completeMiningSession(sessionId: string) {
    try {
      // First get the session to find user and reward amount
      const { data: session } = await supabase
        .from('mining_sessions')
        .select('user_id, reward_amount')
        .eq('id', sessionId)
        .single();

      if (session) {
        // Update user's total balance with mining reward
        const { data: userData } = await supabase
          .from('users')
          .select('total_balance')
          .eq('telegram_id', session.user_id)
          .single();

        if (userData) {
          await supabase
            .from('users')
            .update({
              total_balance: userData.total_balance + session.reward_amount
            })
            .eq('telegram_id', session.user_id);
        }
      }

      // Complete the mining session
      const { data, error } = await supabase
        .from('mining_sessions')
        .update({
          is_completed: true,
          is_claimed: true,
          is_active: false,
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error completing mining session:', error);
      return { data: null, error };
    }
  }

  // Missions and Tasks
  static async getMissions() {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          cryptocurrency:cryptocurrencies(symbol)
        `)
        .eq('is_active', true);

      return { data, error };
    } catch (error) {
      console.error('Error getting missions:', error);
      return { data: null, error };
    }
  }

  static async getUserMissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error getting user missions:', error);
      return { data: null, error };
    }
  }

  static async completeMission(userId: string, missionId: string) {
    try {
      // First check if mission is already completed
      const { data: existingMission } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .single();

      if (existingMission) {
        return { data: existingMission, error: null };
      }

      // Insert new completion
      const { data, error } = await supabase
        .from('user_missions')
        .insert({
          user_id: userId,
          mission_id: missionId,
          reward_claimed: true
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error completing mission:', error);
      return { data: null, error };
    }
  }

  // Wallet and Holdings
  static async getWalletHoldings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wallet_holdings')
        .select(`
          *,
          cryptocurrency:cryptocurrencies(*)
        `)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error getting wallet holdings:', error);
      return { data: null, error };
    }
  }

  static async getTransactions(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          cryptocurrency:cryptocurrencies(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error getting transactions:', error);
      return { data: null, error };
    }
  }

  // Trading
  static async getCryptocurrencies() {
    try {
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .select(`
          *,
          crypto_daily_stats(
            market_cap,
            volume_usd_24h,
            holders_count,
            transactions_count
          )
        `)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error getting cryptocurrencies:', error);
      return { data: null, error };
    }
  }

  static async createTransaction(
    userId: string,
    cryptoId: string,
    amount: number,
    transactionType: 'buy' | 'sell',
    priceUsd: number
  ) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          cryptocurrency_id: cryptoId,
          amount,
          transaction_type: transactionType,
          price_usd: priceUsd,
          total_usd: amount * priceUsd,
          status: 'completed'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { data: null, error };
    }
  }

  // Update crypto holdings after transaction
  static async updateCryptoHolding(userId: string, cryptoId: string, amount: number, isAdd: boolean = true) {
    try {
      // First check if holding exists
      const { data: existingHolding } = await supabase
        .from('crypto_holders')
        .select('*')
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptoId)
        .single();

      if (existingHolding) {
        // Update existing holding
        const newBalance = isAdd 
          ? existingHolding.balance + amount 
          : Math.max(0, existingHolding.balance - amount);

        const { data, error } = await supabase
          .from('crypto_holders')
          .update({
            balance: newBalance,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', existingHolding.id)
          .select()
          .single();

        return { data, error };
      } else if (isAdd) {
        // Create new holding
        const { data, error } = await supabase
          .from('crypto_holders')
          .insert({
            user_id: userId,
            cryptocurrency_id: cryptoId,
            balance: amount,
            first_purchase_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .select()
          .single();

        return { data, error };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating crypto holding:', error);
      return { data: null, error };
    }
  }

  // Update user balance
  static async updateUserBalance(userId: string, amount: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          total_balance: amount
        })
        .eq('telegram_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating user balance:', error);
      return { data: null, error };
    }
  }

  // Crypto Reactions
  static async getCryptoReactionCounts(cryptoId: string) {
    try {
      const { data, error } = await supabase.rpc('get_crypto_reaction_counts', {
        crypto_id: cryptoId
      });

      return { data: data?.[0] || { love_count: 0, fire_count: 0, broken_heart_count: 0 }, error };
    } catch (error) {
      console.error('Error getting reaction counts:', error);
      return { data: { love_count: 0, fire_count: 0, broken_heart_count: 0 }, error };
    }
  }

  static async toggleCryptoReaction(cryptoId: string, userId: string, reactionType: 'love' | 'fire' | 'broken_heart') {
    try {
      const { data, error } = await supabase.rpc('toggle_crypto_reaction', {
        crypto_id: cryptoId,
        user_identifier: userId,
        reaction: reactionType
      });

      return { data, error };
    } catch (error) {
      console.error('Error toggling reaction:', error);
      return { data: null, error };
    }
  }

  static async getUserReactions(cryptoId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('crypto_reactions')
        .select('reaction_type')
        .eq('cryptocurrency_id', cryptoId)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error getting user reactions:', error);
      return { data: null, error };
    }
  }

  // Referral System
  static async registerReferral(referrerIdentifier: string, referredUserId: string, rewardAmount: number = 10.0) {
    try {
      const { data, error } = await supabase.rpc('register_referral', {
        p_referrer_identifier: referrerIdentifier,
        p_referred_user_id: referredUserId,
        p_reward_amount: rewardAmount
      });

      return { data, error };
    } catch (error) {
      console.error('Error registering referral:', error);
      return { data: null, error };
    }
  }

  static async getUserReferralStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        p_user_id: userId
      });

      return { data: data?.[0] || { total_referrals: 0, total_earned: 0 }, error };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return { data: { total_referrals: 0, total_earned: 0 }, error };
    }
  }

  // NFT Management - Using localStorage temporarily until database is updated
  static async createNFTPurchase(userId: string, nftId: string, price: number, miningPower: number) {
    try {
      const userNFTs = this.getUserNFTsFromStorage(userId);
      const newNFT = {
        id: Date.now().toString(),
        user_id: userId,
        nft_id: nftId,
        purchase_price: price,
        mining_power: miningPower,
        purchased_at: new Date().toISOString()
      };
      
      userNFTs.push(newNFT);
      localStorage.setItem(`user_nfts_${userId}`, JSON.stringify(userNFTs));
      
      return { data: newNFT, error: null };
    } catch (error) {
      console.error('Error creating NFT purchase:', error);
      return { data: null, error };
    }
  }

  static async getUserNFTs(userId: string) {
    try {
      const data = this.getUserNFTsFromStorage(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return { data: null, error };
    }
  }

  static getUserNFTsFromStorage(userId: string) {
    try {
      const stored = localStorage.getItem(`user_nfts_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static async getUserMiningPower(userId: string) {
    try {
      const userNFTs = this.getUserNFTsFromStorage(userId);
      const totalPower = userNFTs.reduce((sum: number, nft: any) => sum + nft.mining_power, 0);
      return { data: totalPower || 1, error: null };
    } catch (error) {
      console.error('Error getting mining power:', error);
      return { data: 1, error: null };
    }
  }
}
