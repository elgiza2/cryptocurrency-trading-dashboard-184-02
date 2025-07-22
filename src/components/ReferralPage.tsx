import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
interface ReferralPageProps {
  onBack?: () => void;
  referralCount?: number;
}
interface ReferralFriend {
  id: string;
  referred_user_id: string;
  reward_amount: number;
  is_claimed: boolean;
  created_at: string;
  users?: {
    first_name?: string;
    telegram_username?: string;
  };
}
const ReferralPage = ({
  onBack,
  referralCount = 0
}: ReferralPageProps) => {
  const {
    toast
  } = useToast();
  const {
    telegramUser
  } = useApp();
  const [buttonText, setButtonText] = useState("Invite Your Friends");
  const [friends, setFriends] = useState<ReferralFriend[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate referral link with user's username or ID
  const referralLink = telegramUser?.username ? `https://t.me/Spacelbot?startapp=${telegramUser.username}` : `https://t.me/Spacelbot?startapp=${telegramUser?.id || 'user'}`;

  // Fetch user's referrals
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!telegramUser?.id) return;
      try {
        const {
          data: referralsData,
          error
        } = await supabase.from('referrals').select('*').eq('referrer_user_id', telegramUser.id.toString());
        if (error) throw error;

        // Get user details for each referral
        const referralsWithUsers = await Promise.all((referralsData || []).map(async referral => {
          const {
            data: userData
          } = await supabase.from('users').select('first_name, telegram_username').eq('telegram_id', referral.referred_user_id).single();
          return {
            ...referral,
            users: userData
          };
        }));
        setFriends(referralsWithUsers);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [telegramUser?.id]);

  // Button text animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonText("Get Free Ton");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Referral link has been copied to clipboard.",
      className: "bg-green-900 border-green-700 text-green-100"
    });
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join me on SpaceBot!",
        text: "Start mining $SPACE tokens with me!",
        url: referralLink
      });
    } else {
      handleCopyLink();
    }
  };
  return <div className="h-screen text-foreground">
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <h1 className="text-3xl font-bold">Friends</h1>
        </div>

        {/* Subtitle */}
          <div className="px-4 pb-4">
            <p className="text-gray-400 text-base">Get TON for every server rental by your friends !</p>
          </div>

        {/* Friends Level Info */}
        <div className="px-4 pb-4">
          <div className="bg-secondary/60 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-1">Friends</h3>
            <p className="text-gray-400 text-sm">Reward: 7% of each server rental</p>
          </div>
        </div>

        {/* Scrollable Friends List */}
        <div className="flex-1 px-4 pb-24">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-2">
              {loading ? <div className="text-center text-gray-400 py-8">Loading...</div> : friends.length === 0 ? <div className="text-center text-gray-400 py-8">
                  No friends invited yet. Start sharing your referral link!
                </div> : friends.map(friend => {
              const displayName = friend.users?.first_name || friend.users?.telegram_username || `User ${friend.referred_user_id.slice(-4)}`;
              const avatar = displayName.charAt(0).toUpperCase();
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-blue-400', 'bg-red-500', 'bg-gray-600', 'bg-purple-500'];
              const color = colors[parseInt(friend.id.slice(-1), 16) % colors.length];
              return <div key={friend.id} className="flex items-center justify-between bg-secondary/40 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {avatar}
                        </div>
                        <span className="text-white font-medium">{displayName}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        + {friend.reward_amount} TON
                      </div>
                    </div>;
            })}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Bottom Button above navigation */}
        <div className="fixed bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
          <div className="flex gap-2 items-center">
            <Button onClick={handleShare} className="flex-1 bg-primary hover:bg-primary/90 h-14 text-lg rounded-2xl font-medium transition-all duration-300">
              {buttonText}
            </Button>
            
            <Button onClick={handleCopyLink} variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border text-white hover:bg-secondary/50 shrink-0">
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default ReferralPage;