
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActivityRewardsPageProps {
  onNavigateToReferral?: () => void;
  onNavigateToServers?: () => void;
  onBack?: () => void;
  activityStreak?: number;
}

const ActivityRewardsPage = ({ 
  onNavigateToReferral, 
  onNavigateToServers,
  onBack,
  activityStreak = 0 
}: ActivityRewardsPageProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 22, minutes: 54, seconds: 3 });
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { toast } = useToast();

  const prizes = [
    {
      name: "Lollipop NFT",
      value: "2",
      quantity: 20,
      image: "https://nft.fragment.com/collection/lolpop.webp"
    },
    {
      name: "Desk Calendar NFT", 
      value: "2",
      quantity: 20,
      image: "https://nft.fragment.com/collection/deskcalendar.webp"
    },
    {
      name: "Spy Agaric NFT",
      value: "2.8",
      quantity: 20,
      image: "https://nft.fragment.com/collection/spyagaric.webp"
    },
    {
      name: "Diamond Ring NFT",
      value: "14",
      quantity: 5,
      image: "https://nft.fragment.com/collection/diamondring.webp"
    }
  ];

  useEffect(() => {
    // Get Telegram user data
    if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      setTelegramUser((window as any).Telegram.WebApp.initDataUnsafe.user);
    } else {
      setTelegramUser({
        id: 123456789,
        first_name: "Demo",
        last_name: "User",
        username: "demo_user"
      });
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInviteFriends = () => {
    if (onNavigateToReferral) {
      onNavigateToReferral();
    } else {
      toast({
        title: "Referral System",
        description: "Opening referral page..."
      });
    }
  };

  const handleRentServers = () => {
    if (onNavigateToServers) {
      onNavigateToServers();
    } else {
      toast({
        title: "Server Rental",
        description: "Opening server rental page..."
      });
    }
  };

  const handleTaskConfirm = () => {
    toast({
      title: "Tasks Completed!",
      description: "Your daily streak has been updated.",
      className: "bg-green-900 border-green-700 text-green-100"
    });
  };

  return (
    <ScrollArea className="h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="min-h-screen text-foreground p-3 space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 pt-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Activity Rewards</h1>
            <p className="text-gray-400 text-sm mt-1">
              Stay active and earn collectible Telegram gifts every 5 days!
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-gray-400">days</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.hours}</div>
              <div className="text-xs text-gray-400">hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.minutes}</div>
              <div className="text-xs text-gray-400">minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{timeLeft.seconds}</div>
              <div className="text-xs text-gray-400">seconds</div>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-3 text-xs">
            Time remaining until this week's results and prize distribution.
          </p>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-slate-700 rounded-none">
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none pb-2"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none pb-2"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="mining" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none pb-2"
            >
              Mining
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4 mt-4">
            {/* Activity Description */}
            <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
              <h3 className="text-base font-medium mb-2">Complete all tasks in this section every day without missing any!</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Prizes will be distributed randomly among participants. The higher your streak, the better your chances.
              </p>
            </Card>

            {/* User Profile */}
            <Card className="bg-slate-800/50 border-slate-700 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">🔥</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">You</h3>
                  <p className="text-gray-400 text-xs">Streak of {activityStreak} days</p>
                </div>
              </div>
            </Card>

            {/* Tasks Section */}
            <div>
              <h3 className="text-base font-semibold mb-3">Tasks</h3>
              <div className="space-y-2">
                {[
                  { name: "Share with friends", color: "bg-blue-500", completed: false },
                  { name: "Watch ad #1", color: "bg-green-500", completed: false },
                  { name: "Watch ad #2", color: "bg-gradient-to-r from-orange-500 to-red-500", completed: false },
                  { name: "Watch ad #3", color: "bg-cyan-500", completed: false },
                  { name: "Watch ad #4", color: "bg-gradient-to-r from-yellow-400 to-yellow-600", completed: false },
                  { name: "Watch ad #5", color: "bg-pink-500", completed: false }
                ].map((task, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600 p-3 rounded-xl hover:bg-slate-700/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${task.color} rounded-full`}></div>
                      <span className="flex-1 font-medium text-sm">{task.name}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button 
                onClick={handleTaskConfirm}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 h-12 text-base rounded-2xl font-medium"
              >
                Confirm
              </Button>
            </div>

            {/* Prizes Section */}
            <div>
              <h3 className="text-base font-semibold mb-3">Prizes</h3>
              <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
                <div className="grid grid-cols-4 gap-3">
                  {prizes.map((prize, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={prize.image} alt="Prize" className="w-14 h-14 object-contain" />
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-slate-700/30 rounded-lg px-1 py-1">
                        <img 
                          src="https://assets.pepecase.app/assets/ton2.png" 
                          alt="TON" 
                          className="w-3 h-3"
                        />
                        <span className="text-xs font-medium">{prize.value}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">x{prize.quantity}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4 mt-4">
            {/* Friends Description */}
            <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
              <h3 className="text-base font-medium mb-2">Invite as many friends as you can!</h3>
              <div className="space-y-2 text-gray-400 text-xs leading-relaxed">
                <p>Only friends you've invited recently and who have rented servers for at least 2 TON are counted.</p>
                <p>Winners are chosen randomly. The more friends you invite, the higher your chances of winning.</p>
              </div>
              
              <Button 
                onClick={handleInviteFriends}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 h-12 text-base rounded-2xl font-medium"
              >
                Invite
              </Button>
            </Card>

            {/* User Friends Status */}
            <Card className="bg-slate-800/50 border-slate-700 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">🔥</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">You</h3>
                  <p className="text-gray-400 text-xs">0 friends</p>
                </div>
              </div>
            </Card>

            {/* Prizes Section */}
            <div>
              <h3 className="text-base font-semibold mb-3">Prizes</h3>
              <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
                <div className="grid grid-cols-4 gap-3">
                  {prizes.map((prize, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={prize.image} alt="Prize" className="w-14 h-14 object-contain" />
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-slate-700/30 rounded-lg px-1 py-1">
                        <img 
                          src="https://assets.pepecase.app/assets/ton2.png" 
                          alt="TON" 
                          className="w-3 h-3"
                        />
                        <span className="text-xs font-medium">{prize.value}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">x{prize.quantity}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mining" className="space-y-4 mt-4">
            {/* Mining Description */}
            <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
              <h3 className="text-base font-medium mb-2">Mine as much $SPACE as you can!</h3>
              <div className="space-y-2 text-gray-400 text-xs leading-relaxed">
                <p>To do this, rent servers. Only recent earnings are counted.</p>
                <p>Winners are chosen randomly. The higher your total earnings, the higher your chances of winning.</p>
              </div>
              
              <Button 
                onClick={handleRentServers}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 h-12 text-base rounded-2xl font-medium"
              >
                Rent servers
              </Button>
            </Card>

            {/* User Mining Status */}
            <Card className="bg-slate-800/50 border-slate-700 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">🔥</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">You</h3>
                  <p className="text-gray-400 text-xs">119.06 $SPACE</p>
                </div>
              </div>
            </Card>

            {/* Prizes Section */}
            <div>
              <h3 className="text-base font-semibold mb-3">Prizes</h3>
              <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-2xl">
                <div className="grid grid-cols-4 gap-3">
                  {prizes.map((prize, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                        <img src={prize.image} alt="Prize" className="w-14 h-14 object-contain" />
                      </div>
                      <div className="flex items-center justify-center gap-1 bg-slate-700/30 rounded-lg px-1 py-1">
                        <img 
                          src="https://assets.pepecase.app/assets/ton2.png" 
                          alt="TON" 
                          className="w-3 h-3"
                        />
                        <span className="text-xs font-medium">{prize.value}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">x{prize.quantity}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </ScrollArea>
  );
};

export default ActivityRewardsPage;
