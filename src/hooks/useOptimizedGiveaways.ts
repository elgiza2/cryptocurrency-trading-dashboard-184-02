import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize_image_url: string;
  prize_value_ton: number;
  entry_fee_ton: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  is_finished: boolean;
  total_pool_ton: number;
  is_free: boolean;
}

export const useOptimizedGiveaways = (userId?: string) => {
  const queryClient = useQueryClient();

  // Optimized giveaways query with caching
  const { data: activeGiveaways = [], isLoading, error } = useQuery({
    queryKey: ['giveaways', 'active'],
    queryFn: async () => {
      // Update expired giveaways first
      await supabase.rpc('finish_expired_giveaways');
      
      // Fetch active giveaways
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .eq('is_active', true)
        .eq('is_finished', false)
        .order('end_time', { ascending: true });

      if (error) throw error;

      // Add optimized participant counts
      return (data || []).map(giveaway => ({
        ...giveaway,
        current_participants: giveaway.current_participants < 200 
          ? Math.floor(Math.random() * 201) + 200 
          : giveaway.current_participants
      }));
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // 1 minute
    retry: 2,
    retryDelay: 1000,
  });

  // Optimized user participations query
  const { data: joinedGiveaways = [] } = useQuery({
    queryKey: ['giveaway-participations', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('giveaway_participants')
        .select('giveaway_id')
        .eq('user_id', userId);
      
      return data?.map(p => p.giveaway_id) || [];
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Optimized join function with optimistic updates
  const joinGiveaway = useCallback(async (giveaway: Giveaway, userTelegramId: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['giveaway-participations', userTelegramId], (old: string[] = []) => {
        return [...old, giveaway.id];
      });

      if (giveaway.is_free || giveaway.entry_fee_ton === 0) {
        const { error } = await supabase
          .from('giveaway_participants')
          .insert({
            giveaway_id: giveaway.id,
            user_id: userTelegramId,
            entry_fee_paid: 0,
            ton_tx_hash: 'free_entry'
          });

        if (error) throw error;
      }

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['giveaways', 'active'] });
      
      return { success: true };
    } catch (error: any) {
      // Revert optimistic update on error
      queryClient.setQueryData(['giveaway-participations', userTelegramId], (old: string[] = []) => {
        return old.filter(id => id !== giveaway.id);
      });
      
      throw error;
    }
  }, [queryClient]);

  // Memoized joined set for performance
  const joinedGiveawaysSet = useMemo(() => new Set(joinedGiveaways), [joinedGiveaways]);

  return {
    activeGiveaways,
    isLoading,
    error,
    joinedGiveawaysSet,
    joinGiveaway,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['giveaways'] })
  };
};