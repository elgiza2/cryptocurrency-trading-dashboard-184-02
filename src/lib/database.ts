import { supabase } from '@/integrations/supabase/client';

export class DatabaseService {
  
  // User Management
  static async createOrUpdateUser(telegramUser: any) {
    try {
      console.log('Creating/updating user:', telegramUser);
      
      const userData = {
        telegram_id: telegramUser.id?.toString() || '',
        telegram_username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        photo_url: telegramUser.photo_url || null,
        language_code: telegramUser.language_code || 'en',
        is_premium: telegramUser.is_premium || false,
        total_balance: 0
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, {
          onConflict: 'telegram_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user:', error);
        throw error;
      }

      console.log('User created/updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      return { data: null, error };
    }
  }

  static async getUser(telegramId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error) {
        console.error('Error getting user:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getUser:', error);
      return { data: null, error };
    }
  }

  // Mining Sessions
  static async createMiningSession(userId: string, durationHours: number = 8, rewardAmount: number = 125.5) {
    try {
      // Check if user already has an active mining session
      const { data: existingSession } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingSession) {
        return { data: existingSession, error: null };
      }

      const sessionData = {
        user_id: userId,
        duration_hours: durationHours,
        reward_amount: rewardAmount,
        is_active: true,
        is_completed: false,
        is_claimed: false,
        end_time: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('mining_sessions')
        .insert(sessionData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createMiningSession:', error);
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
        .maybeSingle();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async completeMiningSession(sessionId: string) {
    try {
      // Get the session first
      const { data: session, error: sessionError } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      // Update the session
      const { error: updateError } = await supabase
        .from('mining_sessions')
        .update({
          is_active: false,
          is_completed: true,
          is_claimed: true
        })
        .eq('id', sessionId);

      if (updateError) {
        throw updateError;
      }

      // Update user balance by adding reward amount
      await this.updateUserBalance(session.user_id, Number(session.reward_amount));

      return { data: session, error: null };
    } catch (error) {
      console.error('Error in completeMiningSession:', error);
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
          cryptocurrencies!reward_cryptocurrency_id (
            symbol,
            name,
            icon_url
          )
        `)
        .eq('is_active', true);

      return { data, error };
    } catch (error) {
      console.error('Error in getMissions:', error);
      return { data: null, error };
    }
  }

  static async getUserMissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select(`
          *,
          missions!mission_id (
            title,
            description,
            reward_amount,
            mission_type,
            url
          )
        `)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getUserMissions:', error);
      return { data: null, error };
    }
  }

  static async completeMission(userId: string, missionId: string) {
    try {
      // Check if mission already completed
      const { data: existing } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_id', missionId)
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create completion record
      const { data, error } = await supabase
        .from('user_missions')
        .insert({
          user_id: userId,
          mission_id: missionId,
          reward_claimed: false
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in completeMission:', error);
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
          cryptocurrencies!cryptocurrency_id (
            symbol,
            name,
            icon_url,
            current_price
          )
        `)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getWalletHoldings:', error);
      return { data: null, error };
    }
  }

  static async getTransactions(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          cryptocurrencies!cryptocurrency_id (
            symbol,
            name,
            icon_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return { data: null, error };
    }
  }

  // Trading
  static async getCryptocurrencies() {
    try {
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .select(`
          *
        `)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error in getCryptocurrencies:', error);
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
      const transactionData = {
        user_id: userId,
        cryptocurrency_id: cryptoId,
        transaction_type: transactionType,
        amount: amount,
        price_usd: priceUsd,
        total_usd: amount * priceUsd,
        status: 'completed'
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return { data: null, error };
      }

      // Update user's crypto holding
      await this.updateCryptoHolding(userId, cryptoId, amount, transactionType === 'buy');

      return { data, error: null };
    } catch (error) {
      console.error('Error in createTransaction:', error);
      return { data: null, error };
    }
  }

  static async updateCryptoHolding(
    userId: string,
    cryptoId: string,
    amount: number,
    isAdd: boolean = true
  ) {
    try {
      // Check if holding exists
      const { data: existing } = await supabase
        .from('wallet_holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptoId)
        .maybeSingle();

      if (existing) {
        // Update existing holding
        const newBalance = isAdd 
          ? Number(existing.balance) + amount 
          : Number(existing.balance) - amount;

        const { error } = await supabase
          .from('wallet_holdings')
          .update({ balance: Math.max(0, newBalance) })
          .eq('id', existing.id);

        if (error) throw error;
      } else if (isAdd) {
        // Create new holding
        const { error } = await supabase
          .from('wallet_holdings')
          .insert({
            user_id: userId,
            cryptocurrency_id: cryptoId,
            balance: amount
          });

        if (error) throw error;
      }
      return { data: true, error: null };
    } catch (error) {
      console.error('Error updating crypto holding:', error);
      return { data: null, error };
    }
  }

  static async updateUserBalance(userId: string, amount: number) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('total_balance')
        .eq('telegram_id', userId)
        .maybeSingle();

      if (user) {
        const newBalance = Number(user.total_balance) + amount;
        const { data, error } = await supabase
          .from('users')
          .update({ total_balance: newBalance })
          .eq('telegram_id', userId)
          .select()
          .single();

        return { data, error };
      }
      return { data: null, error: 'User not found' };
    } catch (error) {
      console.error('Error updating user balance:', error);
      return { data: null, error };
    }
  }

  // Crypto Reactions
  static async getCryptoReactionCounts(cryptoId: string) {
    try {
      const { data, error } = await supabase
        .from('crypto_reactions')
        .select('reaction_type')
        .eq('cryptocurrency_id', cryptoId);

      if (error) {
        console.error('Error getting crypto reactions:', error);
        return { data: { love: 0, fire: 0, broken_heart: 0 }, error };
      }

      const counts = { love: 0, fire: 0, broken_heart: 0 };
      data?.forEach(reaction => {
        if (reaction.reaction_type in counts) {
          counts[reaction.reaction_type as keyof typeof counts]++;
        }
      });

      return { data: counts, error: null };
    } catch (error) {
      console.error('Error in getCryptoReactionCounts:', error);
      return { data: { love: 0, fire: 0, broken_heart: 0 }, error };
    }
  }

  static async toggleCryptoReaction(cryptoId: string, userId: string, reactionType: 'love' | 'fire' | 'broken_heart') {
    try {
      // Check if reaction exists
      const { data: existing, error: checkError } = await supabase
        .from('crypto_reactions')
        .select('*')
        .eq('cryptocurrency_id', cryptoId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing reaction:', checkError);
        return { data: false, error: checkError };
      }

      if (existing) {
        // Remove reaction
        const { error: deleteError } = await supabase
          .from('crypto_reactions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          console.error('Error deleting reaction:', deleteError);
          return { data: false, error: deleteError };
        }
        return { data: false, error: null }; // Reaction removed
      } else {
        // Add reaction
        const { error: insertError } = await supabase
          .from('crypto_reactions')
          .insert({
            cryptocurrency_id: cryptoId,
            user_id: userId,
            reaction_type: reactionType
          });

        if (insertError) {
          console.error('Error adding reaction:', insertError);
          return { data: false, error: insertError };
        }
        return { data: true, error: null }; // Reaction added
      }
    } catch (error) {
      console.error('Error in toggleCryptoReaction:', error);
      return { data: false, error };
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
      console.error('Error in getUserReactions:', error);
      return { data: null, error };
    }
  }

  // Referral System
  static async registerReferral(referrerIdentifier: string, referredUserId: string, rewardAmount: number = 150) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: referrerIdentifier,
          referred_user_id: referredUserId,
          reward_amount: rewardAmount,
          is_claimed: true
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in registerReferral:', error);
      return { data: null, error };
    }
  }

  static async getUserReferralStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', userId);

      if (error) {
        console.error('Error getting referral stats:', error);
        return { data: { total_referrals: 0, total_earned: 0 }, error };
      }

      const totalReferrals = data?.length || 0;
      const totalEarned = data?.reduce((sum, ref) => sum + Number(ref.reward_amount), 0) || 0;

      return { data: { total_referrals: totalReferrals, total_earned: totalEarned }, error: null };
    } catch (error) {
      console.error('Error in getUserReferralStats:', error);
      return { data: { total_referrals: 0, total_earned: 0 }, error };
    }
  }

  // Servers
  static async getServers() {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error in getServers:', error);
      return { data: null, error };
    }
  }

  static async purchaseServer(userId: string, serverId: string, price: number, miningPower: number, durationHours: number) {
    try {
      const { data, error } = await supabase
        .from('user_servers')
        .insert({
          user_id: userId,
          server_id: serverId,
          purchase_price: price,
          mining_power: miningPower,
          end_time: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in purchaseServer:', error);
      return { data: null, error };
    }
  }

  // NFTs
  static async getNFTCollections() {
    try {
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        .eq('is_active', true)
        .order('base_price', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Error in getNFTCollections:', error);
      return { data: null, error };
    }
  }

  static async createNFTPurchase(userId: string, nftId: string, price: number, miningPower: number) {
    try {
      const { data, error } = await supabase
        .from('user_nfts')
        .insert({
          user_id: userId,
          nft_id: nftId,
          purchase_price: price,
          mining_power: miningPower
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in createNFTPurchase:', error);
      return { data: null, error };
    }
  }

  static async getUserNFTs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_nfts')
        .select(`
          *,
          nft_collections!nft_id (
            name,
            description,
            rarity,
            image_url
          )
        `)
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      console.error('Error in getUserNFTs:', error);
      return { data: null, error };
    }
  }

  static async getUserMiningPower(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_nfts')
        .select('mining_power')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user mining power:', error);
        return { data: 1, error };
      }

      const totalPower = data?.reduce((sum, nft) => sum + (nft.mining_power || 1), 0) || 1;
      return { data: Math.max(1, totalPower), error: null };
    } catch (error) {
      console.error('Error in getUserMiningPower:', error);
      return { data: 1, error };
    }
  }

  // Admin functions
  static async addMission(missionData: any) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert(missionData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in addMission:', error);
      return { data: null, error };
    }
  }

  static async addCryptocurrency(cryptoData: any) {
    try {
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .insert(cryptoData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in addCryptocurrency:', error);
      return { data: null, error };
    }
  }

  static async updateCryptocurrencyPrice(cryptoId: string, newPrice: number) {
    try {
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .update({ current_price: newPrice })
        .eq('id', cryptoId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error in updateCryptocurrencyPrice:', error);
      return { data: null, error };
    }
  }
}