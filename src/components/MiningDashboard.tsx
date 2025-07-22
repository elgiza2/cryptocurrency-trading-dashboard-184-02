
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Gift, 
  Coins, 
  Star,
  Server,
  TrendingUp,
  Zap,
  Info,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MiningDashboardProps {
  onNavigateToNFT?: () => void;
  onNavigateToServers?: () => void;
  onNavigateToActivityRewards?: () => void;
  onNavigateToExchange?: () => void;
  onNavigateToAboutServers?: () => void;
  onNavigateToWallet?: () => void;
  userBalance?: { space: number; ton: number };
  userServers?: any[];
}

const MiningDashboard = ({ 
  onNavigateToNFT, 
  onNavigateToServers,
  onNavigateToActivityRewards,
  onNavigateToExchange,
  onNavigateToAboutServers,
  onNavigateToWallet,
  userBalance = { space: 0.8001, ton: 0.1175 },
  userServers = []
}: MiningDashboardProps) => {
  const [dailyIncome, setDailyIncome] = useState(0);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { toast } = useToast();

  // Sample income sources
  const incomeSources = [
    { source: "Server Mining", amount: 450, type: "server" },
    { source: "NFT Mining", amount: 125, type: "nft" },
    { source: "Referral Bonus", amount: 50, type: "referral" },
    { source: "Activity Rewards", amount: 25, type: "activity" }
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

    // Load user servers and calculate income
    const income = userServers.reduce((total: number, server: any) => total + (server.income || 0), 0);
    setDailyIncome(income);
  }, []);

  const handleGetGifts = () => {
    if (onNavigateToActivityRewards) {
      onNavigateToActivityRewards();
    } else {
      toast({
        title: "Activity Rewards",
        description: "Opening rewards page..."
      });
    }
  };

  const handleSpaceBalanceClick = () => {
    if (onNavigateToExchange) {
      onNavigateToExchange();
    } else {
      toast({
        title: "Currency Exchange",
        description: "Opening exchange page..."
      });
    }
  };

  const handleAboutMining = () => {
    if (onNavigateToAboutServers) {
      onNavigateToAboutServers();
    } else {
      toast({
        title: "About Mining",
        description: "Mining with servers provides 24/7 passive income in $SPACE tokens."
      });
    }
  };

  const handleTopUpBalance = () => {
    if (onNavigateToWallet) {
      onNavigateToWallet();
    } else {
      toast({
        title: "Wallet",
        description: "Opening wallet page for deposit..."
      });
    }
  };

  const handleRentServer = () => {
    if (onNavigateToServers) {
      onNavigateToServers();
    } else {
      toast({
        title: "Servers",
        description: "Opening servers page..."
      });
    }
  };

  return (
    <ScrollArea className="h-screen bg-background unified-black-bg">
      <div className="min-h-screen text-foreground p-3 space-y-3">
        
        {/* Get Gifts Header with Glass Effect */}
        <Card 
          className="bg-gradient-to-r from-purple-500/80 to-purple-600/80 border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-colors rounded-xl backdrop-blur-xl bg-opacity-80"
          onClick={handleGetGifts}
        >
          <div className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <img 
                src="https://cdn.changes.tg/gifts/models/Gem%20Signet/png/Render.png?v=1" 
                alt="Gift" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white mb-1">Get gifts for free!</h2>
              <p className="text-xs text-purple-100">
                Participate in weekly sweepstakes
              </p>
            </div>
          </div>
        </Card>

        {/* User Balance - Compact Design */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
              onClick={handleSpaceBalanceClick}
            >
              <div className="text-lg font-bold text-foreground">{userBalance.space.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                $SPACE balance
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-blue-300 mx-2" />
            <div className="flex-1 text-right">
              <div className="text-lg font-bold text-blue-100">{userBalance.ton.toFixed(4)}</div>
              <div className="text-xs text-blue-200 flex items-center justify-end gap-1">
                <img 
                  src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                  alt="TON" 
                  className="w-3 h-3"
                />
                TON balance
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions with Glass Effect */}
        <Card className="bg-secondary border-border p-2 rounded-2xl">
          <div className="space-y-2">
            <Button 
              onClick={onNavigateToNFT}
              className="w-full h-12 bg-secondary border-border text-foreground hover:bg-secondary/80 justify-between rounded-xl"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="text-base">NFT Miners</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Button>
            
            <Button 
              onClick={handleAboutMining}
              className="w-full h-12 bg-black/80 backdrop-blur-sm border-none text-white hover:bg-black/60 justify-between rounded-xl"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="text-base">About Mining</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </Card>

        {/* Your Servers - Compact Design */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-100">Your Servers</h3>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl">
            <div className="p-3">
              {userServers.length > 0 ? (
                <div className="space-y-3 mb-3">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-sm text-blue-100">Flux</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">28d 12h 46m</div>
                        <div className="text-xs text-blue-200">Time Left</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold flex items-center gap-1 text-white">
                          ~ 0.02 
                          <img 
                            src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                            alt="TON" 
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="text-xs text-blue-200">Income Per Day</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 mb-3">
                  <Server className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                  <p className="text-blue-200 mb-2 text-sm">No servers rented yet</p>
                </div>
              )}
              
              <Button 
                onClick={handleRentServer}
                className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base rounded-2xl font-medium"
              >
                Rent Server
              </Button>
            </div>
          </Card>
        </div>

        {/* Your Income - Borderless Design */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-100">Your Income</h3>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4">
            <div className="space-y-3">
              {incomeSources.map((income, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      income.type === 'server' ? 'bg-purple-400' :
                      income.type === 'nft' ? 'bg-pink-400' :
                      income.type === 'referral' ? 'bg-blue-400' : 'bg-green-400'
                    }`} />
                    <span className="font-medium text-sm text-blue-100">{income.source}</span>
                  </div>
                  <span className="font-semibold text-green-300 text-sm">
                    +{income.amount} SPACE
                  </span>
                </div>
              ))}
              
              <div className="border-t border-white/20 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base text-blue-100">Total Daily Income</span>
                  <span className="font-bold text-green-300 text-base">
                    +{incomeSources.reduce((total, income) => total + income.amount, 0)} SPACE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-16"></div>
      </div>
    </ScrollArea>
  );
};

export default MiningDashboard;
