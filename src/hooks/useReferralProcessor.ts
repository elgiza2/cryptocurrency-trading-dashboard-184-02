import { useEffect, useState } from 'react';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralProcessor {
  processReferral: (newUserId: string, referrerIdentifier?: string) => Promise<boolean>;
  getReferralFromUrl: () => string | null;
}

export const useReferralProcessor = (): ReferralProcessor => {
  const { toast } = useToast();

  const getReferralFromUrl = (): string | null => {
    try {
      // Check Telegram WebApp start parameter
      const tgWebApp = (window as any).Telegram?.WebApp;
      if (tgWebApp?.initDataUnsafe?.start_param) {
        return tgWebApp.initDataUnsafe.start_param;
      }

      // Check URL parameters as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const startapp = urlParams.get('startapp');
      
      return startapp;
    } catch (error) {
      console.error('Error getting referral from URL:', error);
      return null;
    }
  };

  const processReferral = async (newUserId: string, referrerIdentifier?: string): Promise<boolean> => {
    try {
      const referrer = referrerIdentifier || getReferralFromUrl();
      
      if (!referrer || referrer === newUserId) {
        return false; // No referrer or self-referral
      }

      // Check if referrer exists
      const referrerExists = await checkReferrerExists(referrer);
      if (!referrerExists) {
        console.log('Referrer not found:', referrer);
        return false;
      }

      // Check if referral already exists
      const existingReferral = await checkExistingReferral(referrer, newUserId);
      if (existingReferral) {
        console.log('Referral already exists');
        return false;
      }

      // Create referral record
      const referralResult = await DatabaseService.registerReferral(referrer, newUserId, 10);
      
      if (referralResult.data) {
        // Award referrer with TON
        await awardReferrer(referrer, 10);
        
        toast({
          title: "مرحباً بك!",
          description: "تم تسجيلك عبر دعوة صديق وحصل صديقك على 10 TON!",
          className: "bg-green-900 border-green-700 text-green-100"
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  };

  const checkReferrerExists = async (referrerIdentifier: string): Promise<boolean> => {
    try {
      // Check by telegram_id first
      const { data: userById } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', referrerIdentifier)
        .single();

      if (userById) return true;

      // Check by username as fallback
      const { data: userByUsername } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_username', referrerIdentifier)
        .single();

      return !!userByUsername;
    } catch (error) {
      console.error('Error checking referrer existence:', error);
      return false;
    }
  };

  const checkExistingReferral = async (referrerId: string, referredUserId: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_user_id', referrerId)
        .eq('referred_user_id', referredUserId)
        .single();

      return !!data;
    } catch (error) {
      return false; // No existing referral found
    }
  };

  const awardReferrer = async (referrerId: string, amount: number): Promise<void> => {
    try {
      // Add TON to referrer's wallet
      await supabase.rpc('update_user_wallet_balance', {
        user_telegram_id: referrerId,
        currency_symbol: 'TON',
        amount_change: amount,
        operation_type: 'add'
      });
      
      console.log(`Awarded ${amount} TON to referrer:`, referrerId);
    } catch (error) {
      console.error('Error awarding referrer:', error);
    }
  };

  return {
    processReferral,
    getReferralFromUrl
  };
};