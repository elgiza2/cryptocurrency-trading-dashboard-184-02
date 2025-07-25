import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Flame, HeartCrack } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReactionCounts {
  love_count: number;
  fire_count: number;
  broken_heart_count: number;
}

interface CryptoReactionsProps {
  cryptoId: string;
  userId?: string;
}

const CryptoReactions = ({ cryptoId, userId = "anonymous_user" }: CryptoReactionsProps) => {
  const [counts, setCounts] = useState<ReactionCounts>({
    love_count: 0,
    fire_count: 0,
    broken_heart_count: 0
  });
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReactionCounts();
    loadUserReactions();
    setupRealtimeSubscription();
  }, [cryptoId, userId]);

  const loadReactionCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_reactions')
        .select('reaction_type')
        .eq('cryptocurrency_id', cryptoId);

      if (error) throw error;

      const counts = { love_count: 0, fire_count: 0, broken_heart_count: 0 };
      data?.forEach(reaction => {
        if (reaction.reaction_type === 'love') counts.love_count++;
        else if (reaction.reaction_type === 'fire') counts.fire_count++;
        else if (reaction.reaction_type === 'broken_heart') counts.broken_heart_count++;
      });

      setCounts(counts);
    } catch (error) {
      console.error('Error loading reaction counts:', error);
    }
  };

  const loadUserReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_reactions')
        .select('reaction_type')
        .eq('cryptocurrency_id', cryptoId)
        .eq('user_id', userId);

      if (error) throw error;

      const reactions = new Set(data?.map(r => r.reaction_type) || []);
      setUserReactions(reactions);
    } catch (error) {
      console.error('Error loading user reactions:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`crypto-reactions-${cryptoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_reactions',
          filter: `cryptocurrency_id=eq.${cryptoId}`
        },
        () => {
          loadReactionCounts();
          loadUserReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReaction = async (reactionType: 'love' | 'fire' | 'broken_heart') => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Check if reaction exists
      const { data: existing, error: checkError } = await supabase
        .from('crypto_reactions')
        .select('*')
        .eq('cryptocurrency_id', cryptoId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (checkError) throw checkError;

      let action = '';
      if (existing) {
        // Remove reaction
        const { error: deleteError } = await supabase
          .from('crypto_reactions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;
        action = 'removed';
      } else {
        // Add reaction
        const { error: insertError } = await supabase
          .from('crypto_reactions')
          .insert({
            cryptocurrency_id: cryptoId,
            user_id: userId,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;
        action = 'added';
      }

      const emoji = reactionType === 'love' ? '♥️' : reactionType === 'fire' ? '🔥' : '💔';
      
      toast({
        title: `Reaction ${action}`,
        description: `${emoji} reaction ${action} successfully`,
      });

      // Refresh data
      loadReactionCounts();
      loadUserReactions();

    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonClass = (reactionType: string, isActive: boolean) => {
    const baseClass = "h-6 px-2 py-1 text-xs font-medium rounded-full border-0 bg-transparent transition-all duration-200 hover:scale-110 hover:bg-white/5";
    const activeClass = isActive ? "bg-white/10" : "";
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        className={getButtonClass('love', userReactions.has('love'))}
        onClick={() => handleReaction('love')}
        disabled={loading}
      >
        <span className="text-red-400">♥️</span>
        <span className="ml-1 text-muted-foreground">{counts.love_count}</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className={getButtonClass('fire', userReactions.has('fire'))}
        onClick={() => handleReaction('fire')}
        disabled={loading}
      >
        <span className="text-orange-400">🔥</span>
        <span className="ml-1 text-muted-foreground">{counts.fire_count}</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className={getButtonClass('broken_heart', userReactions.has('broken_heart'))}
        onClick={() => handleReaction('broken_heart')}
        disabled={loading}
      >
        <span className="text-blue-400">💔</span>
        <span className="ml-1 text-muted-foreground">{counts.broken_heart_count}</span>
      </Button>
    </div>
  );
};

export default CryptoReactions;