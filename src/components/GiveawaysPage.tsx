import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, Clock, Users, Trophy, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MobileNav from '@/components/MobileNav';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { TonTransactionService } from '@/services/tonTransactionService';
import { useApp } from '@/contexts/AppContext';
import { useOptimizedGiveaways } from '@/hooks/useOptimizedGiveaways';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import SkeletonLoader from '@/components/SkeletonLoader';

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

const GiveawaysPage = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { telegramUser } = useApp();
  const { toast } = useToast();
  
  // Performance monitoring
  const { markRenderStart, markRenderEnd } = usePerformanceMonitor('GiveawaysPage');
  
  // Optimized data fetching
  const {
    activeGiveaways,
    isLoading,
    error,
    joinedGiveawaysSet,
    joinGiveaway: optimizedJoinGiveaway
  } = useOptimizedGiveaways(telegramUser?.id.toString());

  // Mark render start
  markRenderStart();

  // Optimized join giveaway function with memoization
  const joinGiveaway = useCallback(async (giveaway: Giveaway) => {
    if (!telegramUser) {
      toast({
        title: "Login Required",
        description: "Please login to join giveaways",
        variant: "destructive"
      });
      return;
    }

    try {
      if (giveaway.is_free || giveaway.entry_fee_ton === 0) {
        await optimizedJoinGiveaway(giveaway, telegramUser.id.toString());
        toast({
          title: "Successfully Joined! 🎉",
          description: `You have joined ${giveaway.title} for free!`,
          className: "bg-green-900 border-green-700 text-green-100"
        });
        return;
      }

      // Handle paid giveaways
      if (!tonConnectUI.wallet) {
        toast({
          title: "Wallet Required",
          description: "Please connect your TON wallet to join paid giveaways",
          variant: "destructive"
        });
        return;
      }

      const transactionService = new TonTransactionService(tonConnectUI);
      toast({
        title: "Processing Transaction",
        description: "Please confirm the TON transaction in your wallet...",
      });

      await transactionService.sendTransaction(
        "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq",
        giveaway.entry_fee_ton,
        `Giveaway Entry: ${giveaway.title}`
      );

      await optimizedJoinGiveaway(giveaway, telegramUser.id.toString());
      
      toast({
        title: "Successfully Joined! 🎉",
        description: `You have joined ${giveaway.title}! Transaction: ${giveaway.entry_fee_ton} TON`,
        className: "bg-green-900 border-green-700 text-green-100"
      });

    } catch (error: any) {
      console.error('Error joining giveaway:', error);
      
      if (error.message?.includes('User declined')) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction. No charges were made.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Insufficient')) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${giveaway.entry_fee_ton} TON to join this giveaway.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to Join",
          description: error.message || "An error occurred while joining the giveaway",
          variant: "destructive"
        });
      }
    }
  }, [telegramUser, tonConnectUI, optimizedJoinGiveaway, toast]);


  // Memoized time formatting function
  const formatTimeRemaining = useCallback((endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  const GiveawayCard = ({ giveaway, isFinished = false }: { giveaway: Giveaway; isFinished?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/20">
      <CardHeader className="pb-1 pt-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-bold text-primary leading-tight">{giveaway.title}</CardTitle>
            <Badge variant={isFinished ? "secondary" : "default"} className="shrink-0 text-xs px-1 py-0">
              {isFinished ? "Ended" : "Active"}
            </Badge>
          </div>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 pb-3">
        {/* Prize Image */}
        <div className="relative aspect-square w-16 mx-auto">
          <img 
            src={giveaway.prize_image_url} 
            alt={giveaway.title}
            className="w-full h-full object-contain rounded border border-primary/10"
          />
        </div>

        {/* Giveaway Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-2.5 h-2.5" />
              <span>Participants</span>
            </div>
            <span className="font-medium text-xs">{giveaway.current_participants}/{giveaway.max_participants}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              <span>Time Left</span>
            </div>
            <span className="font-medium text-xs">{formatTimeRemaining(giveaway.end_time)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              <span>Entry Fee</span>
            </div>
            <span className={`font-bold text-xs ${giveaway.is_free || giveaway.entry_fee_ton === 0 ? 'text-green-400' : 'text-primary'}`}>
              {giveaway.is_free || giveaway.entry_fee_ton === 0 ? 'FREE' : `${giveaway.entry_fee_ton} TON`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(giveaway.current_participants / giveaway.max_participants) * 100}%` }}
          />
        </div>

        {/* Join Button */}
        {!isFinished && giveaway.current_participants < giveaway.max_participants && (
          <>
            {joinedGiveawaysSet.has(giveaway.id) ? (
              <Button 
                disabled
                className="w-full bg-green-600 hover:bg-green-600 h-7 text-xs"
                size="sm"
              >
                <Check className="w-2.5 h-2.5 mr-1" />
                Joined
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (!giveaway.is_free && giveaway.entry_fee_ton > 0 && !tonConnectUI?.wallet) {
                    tonConnectUI.openModal();
                  } else {
                    joinGiveaway(giveaway);
                  }
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-7 text-xs"
                size="sm"
              >
                {!tonConnectUI?.wallet && !giveaway.is_free && giveaway.entry_fee_ton > 0 ? (
                  <span>Connect Wallet</span>
                ) : giveaway.is_free || giveaway.entry_fee_ton === 0 ? (
                  <span>Join Free</span>
                ) : (
                  <span>Join {giveaway.entry_fee_ton} TON</span>
                )}
                <ArrowRight className="w-2.5 h-2.5 ml-1" />
              </Button>
            )}
          </>
        )}

        {!isFinished && giveaway.current_participants >= giveaway.max_participants && (
          <Button disabled className="w-full h-7 text-xs" size="sm">
            Giveaway Full
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Mark render end
  markRenderEnd();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader count={6} type="giveaway" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Giveaways</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      

      <div className="space-y-6">
        {activeGiveaways.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Giveaways</h3>
            <p className="text-muted-foreground">Follow us to get notifications about new giveaways</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGiveaways.map((giveaway) => (
              <GiveawayCard key={giveaway.id} giveaway={giveaway} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        activeTab="giveaways" 
        onTabChange={(tab) => {
          // Handle navigation to other pages
          if (tab === 'home') window.location.hash = '';
          else if (tab === 'referral') window.location.hash = 'referral';
          else if (tab === 'roulette') window.location.hash = 'roulette';
          else if (tab === 'missions') window.location.hash = 'missions';
          else if (tab === 'nft') window.location.hash = 'nft';
          else if (tab === 'wallet') window.location.hash = 'wallet';
        }}
      />
      
      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default GiveawaysPage;