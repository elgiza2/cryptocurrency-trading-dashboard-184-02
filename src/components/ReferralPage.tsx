import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ReferralPageProps {
  onBack?: () => void;
  referralCount?: number;
}

const ReferralPage = ({ onBack, referralCount = 0 }: ReferralPageProps) => {
  const { toast } = useToast();
  const referralLink = "https://t.me/YourBot?start=ref_123456";
  const [buttonText, setButtonText] = useState("Invite Your Friends");

  // Mock friends data
  const friends = [
    { id: 1, name: "M3works", avatar: "M", reward: 0.07, color: "bg-blue-500" },
    { id: 2, name: "Maha9315i", avatar: "TH", reward: 0.07, color: "bg-green-500" },
    { id: 3, name: "Kit204", avatar: "A", reward: 0, color: "bg-blue-400" },
    { id: 4, name: "AboNagy", avatar: "G", reward: 0, color: "bg-red-500" },
    { id: 5, name: "MaghonaL", avatar: "ML", reward: 0, color: "bg-gray-600" },
    { id: 6, name: "bghan", avatar: "BG", reward: 0, color: "bg-gray-500" },
  ];

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

  return (
    <div className="h-screen text-foreground">
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <h1 className="text-3xl font-bold">Friends</h1>
        </div>

        {/* Subtitle */}
        <div className="px-4 pb-4">
          <p className="text-gray-400 text-base">
            Get TON for every server rental by your friends!
          </p>
        </div>

        {/* Friends Level Info */}
        <div className="px-4 pb-4">
          <div className="bg-secondary/60 rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-1">Level 1 Friends</h3>
            <p className="text-gray-400 text-sm">Reward: 7% of each server rental</p>
          </div>
        </div>

        {/* Scrollable Friends List */}
        <div className="flex-1 px-4 pb-24">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between bg-secondary/40 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${friend.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                      {friend.avatar}
                    </div>
                    <span className="text-white font-medium">{friend.name}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    + {friend.reward} TON
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Bottom Button above navigation */}
        <div className="fixed bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/80 to-transparent">
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleShare}
              className="flex-1 bg-primary hover:bg-primary/90 h-14 text-lg rounded-2xl font-medium transition-all duration-300"
            >
              {buttonText}
            </Button>
            
            <Button 
              onClick={handleCopyLink}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-2xl border-border text-white hover:bg-secondary/50 shrink-0"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;