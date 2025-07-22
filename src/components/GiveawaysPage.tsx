import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MobileNav from '@/components/MobileNav';

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
}

const GiveawaysPage = () => {
  const [activeGiveaways, setActiveGiveaways] = useState<Giveaway[]>([]);
  const [finishedGiveaways, setFinishedGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGiveaways();
    
    // تحديث البيانات كل دقيقة لفحص الأحداث المنتهية
    const interval = setInterval(loadGiveaways, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadGiveaways = async () => {
    try {
      setLoading(true);
      
      // Update expired giveaways first
      await supabase.rpc('finish_expired_giveaways');
      
      // Fetch active giveaways
      const { data: active, error: activeError } = await supabase
        .from('giveaways')
        .select('*')
        .eq('is_active', true)
        .eq('is_finished', false)
        .order('end_time', { ascending: true });

      if (activeError) throw activeError;

      // Fetch finished giveaways
      const { data: finished, error: finishedError } = await supabase
        .from('giveaways')
        .select('*')
        .eq('is_finished', true)
        .order('end_time', { ascending: false })
        .limit(10);

      if (finishedError) throw finishedError;

      setActiveGiveaways(active || []);
      setFinishedGiveaways(finished || []);
    } catch (error) {
      console.error('Error loading giveaways:', error);
      toast({
        title: "Error",
        description: "Failed to load giveaways",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGiveaway = async (giveaway: Giveaway) => {
    try {
      // TON payment logic should be added here
      const { data, error } = await supabase
        .from('giveaway_participants')
        .insert({
          giveaway_id: giveaway.id,
          user_id: 'demo_user', // Should be replaced with actual user ID
          entry_fee_paid: giveaway.entry_fee_ton
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `You joined ${giveaway.title} giveaway`,
        variant: "default"
      });

      loadGiveaways(); // Reload data
    } catch (error: any) {
      console.error('Error joining giveaway:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join giveaway",
        variant: "destructive"
      });
    }
  };

  const formatTimeRemaining = (endTime: string) => {
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
  };

  const GiveawayCard = ({ giveaway, isFinished = false }: { giveaway: Giveaway; isFinished?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-primary">{giveaway.title}</CardTitle>
          <Badge variant={isFinished ? "secondary" : "default"} className="shrink-0">
            {isFinished ? "Ended" : "Active"}
          </Badge>
        </div>
        {giveaway.description && (
          <p className="text-muted-foreground text-sm">{giveaway.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* صورة الجائزة */}
        <div className="relative aspect-square w-32 mx-auto">
          <img 
            src={giveaway.prize_image_url} 
            alt={giveaway.title}
            className="w-full h-full object-contain rounded-lg border border-primary/10"
          />
        </div>

        {/* معلومات المسابقة */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Participants</span>
            </div>
            <span className="font-medium">{giveaway.current_participants}/{giveaway.max_participants}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time Left</span>
            </div>
            <span className="font-medium">{formatTimeRemaining(giveaway.end_time)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Entry Fee</span>
            </div>
            <span className="font-bold text-primary">{giveaway.entry_fee_ton} TON</span>
          </div>

        </div>

        {/* شريط التقدم */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(giveaway.current_participants / giveaway.max_participants) * 100}%` }}
            />
          </div>
        </div>

        {/* زر الانضمام */}
        {!isFinished && giveaway.current_participants < giveaway.max_participants && (
          <Button 
            onClick={() => joinGiveaway(giveaway)}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            <span>Join Giveaway</span>
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        )}

        {!isFinished && giveaway.current_participants >= giveaway.max_participants && (
          <Button disabled className="w-full" size="lg">
            Giveaway Full
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading giveaways...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="active">Active ({activeGiveaways.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({finishedGiveaways.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="finished" className="space-y-6">
          {finishedGiveaways.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Finished Giveaways</h3>
              <p className="text-muted-foreground">Recently finished giveaways will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedGiveaways.map((giveaway) => (
                <GiveawayCard key={giveaway.id} giveaway={giveaway} isFinished />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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