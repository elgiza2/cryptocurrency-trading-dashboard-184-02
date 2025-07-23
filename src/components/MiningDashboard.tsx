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
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

interface MiningDashboardProps {
  onNavigateToNFT?: () => void;
  onNavigateToServers?: () => void;
  onNavigateToActivityRewards?: () => void;
  onNavigateToExchange?: () => void;
  onNavigateToAboutServers?: () => void;
  onNavigateToWallet?: () => void;
  userBalance?: { space: number; ton: number; si?: number };
  userServers?: any[];
}

const MiningDashboard = ({ 
  onNavigateToNFT, 
  onNavigateToServers,
  onNavigateToActivityRewards,
  onNavigateToExchange,
  onNavigateToAboutServers,
  onNavigateToWallet,
  userBalance = { space: 0, ton: 0, si: 0 },
  userServers = []
}: MiningDashboardProps) => {
  const [realUserBalance, setRealUserBalance] = useState({ space: 0, ton: 0, si: 0 });
  const [realUserServers, setRealUserServers] = useState<any[]>([]);
  const [incomeSources, setIncomeSources] = useState<any[]>([]);
  const [totalDailyIncome, setTotalDailyIncome] = useState(0);
  const { telegramUser } = useApp();
  const { toast } = useToast();

  // Fetch real user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!telegramUser?.id) return;

      try {
        // Fetch user balance
        const { data: walletData } = await supabase
          .from('wallet_holdings')
          .select('balance, cryptocurrencies(symbol)')
          .eq('user_id', telegramUser.id.toString());

        if (walletData) {
          const balances = { space: 0, ton: 0, si: 0 };
          walletData.forEach((holding: any) => {
            const symbol = holding.cryptocurrencies?.symbol?.toLowerCase();
            if (symbol === 'space') balances.space = Number(holding.balance);
            if (symbol === 'ton') balances.ton = Number(holding.balance);
            if (symbol === 'si') balances.si = Number(holding.balance);
          });
          setRealUserBalance(balances);
        }

        // Fetch user servers
        const { data: serversData } = await supabase
          .from('user_servers')
          .select(`
            *,
            servers(name, mining_power, price_ton)
          `)
          .eq('user_id', telegramUser.id.toString())
          .eq('is_active', true);

        setRealUserServers(serversData || []);

        // Calculate income sources
        const sources = [];
        let totalIncome = 0;

        // Server income - 130 SPACE per TON invested per day
        const serverIncome = (serversData || []).reduce((total, server) => {
          const tonInvestment = server.servers?.price_ton || 1;
          return total + (tonInvestment * 130); // 130 SPACE per TON per day
        }, 0);
        if (serverIncome > 0) {
          sources.push({ source: "Server Mining", amount: serverIncome, type: "server" });
          totalIncome += serverIncome;
        }

        // NFT income
        const { data: nftData } = await supabase
          .from('user_nfts')
          .select('mining_power')
          .eq('user_id', telegramUser.id.toString());

        const nftIncome = (nftData || []).reduce((total, nft) => {
          return total + (nft.mining_power * 24);
        }, 0);
        if (nftIncome > 0) {
          sources.push({ source: "NFT Mining", amount: nftIncome, type: "nft" });
          totalIncome += nftIncome;
        }

        // Referral income
        const { data: referralData } = await supabase
          .from('referrals')
          .select('reward_amount')
          .eq('referrer_user_id', telegramUser.id.toString())
          .eq('is_claimed', true);

        const referralIncome = (referralData || []).reduce((total, ref) => {
          return total + Number(ref.reward_amount);
        }, 0);
        if (referralIncome > 0) {
          sources.push({ source: "Referral Bonus", amount: referralIncome, type: "referral" });
        }

        setIncomeSources(sources);
        setTotalDailyIncome(totalIncome);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [telegramUser?.id]);

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
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          
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

          {/* User Balance - Black Design */}
          <Card className="bg-black backdrop-blur-xl border-white/20 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <div 
                className="flex-1 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors"
                onClick={handleSpaceBalanceClick}
              >
                <div className="text-lg font-bold text-white">{realUserBalance.space.toFixed(4)}</div>
                <div className="text-xs text-gray-300">
                  $SPACE balance
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-blue-300 mx-2" />
              <div className="flex-1 text-right">
                <div className="text-lg font-bold text-white">{realUserBalance.ton.toFixed(4)}</div>
                <div className="text-xs text-gray-300">
                  TON balance
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions with Glass Effect */}
          <Card className="bg-black border-border p-2 rounded-2xl">
            <div className="space-y-2">
              <Button 
                onClick={onNavigateToNFT}
                className="w-full h-12 bg-transparent border-none text-foreground hover:bg-transparent justify-between rounded-xl"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-base">NFT Miners</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
              
              <Button 
                onClick={handleAboutMining}
                className="w-full h-12 bg-transparent border-none text-white hover:bg-transparent justify-between rounded-xl"
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-base">About Mining</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
          </Card>

          {/* Your Servers - Black Design */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-100">Your Servers</h3>
            <Card className="bg-black backdrop-blur-xl border-white/20 rounded-2xl">
              <div className="p-3">
                {realUserServers.length > 0 ? (
                  <div className="space-y-3 mb-3">
                    {realUserServers.map((userServer, index) => {
                      const server = userServer.servers;
                      const timeLeft = userServer.end_time 
                        ? Math.max(0, new Date(userServer.end_time).getTime() - new Date().getTime())
                        : 0;
                      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                      const tonInvestment = userServer.servers?.price_ton || 1;
                      const dailyIncome = tonInvestment * 130; // 130 SPACE per TON per day

                      return (
                        <div key={index} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="font-semibold text-sm text-blue-100">{server?.name || 'Server'}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-bold text-white">
                                {timeLeft > 0 ? `${days}d ${hours}h ${minutes}m` : 'Expired'}
                              </div>
                              <div className="text-xs text-blue-200">Time Left</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold flex items-center gap-1 text-white">
                                + {dailyIncome.toFixed(0)} SPACE
                              </div>
                              <div className="text-xs text-blue-200">Income Per Day</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 mb-3">
                    <Server className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                    <p className="text-blue-200 mb-2 text-sm">No servers rented yet</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRentServer}
                    className="w-full bg-blue-600 hover:bg-blue-700 border-0 h-12 text-base rounded-2xl font-medium text-white"
                  >
                    Rent Server
                  </Button>
                </div>
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
                    +{totalDailyIncome} SPACE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Bottom spacing for mobile nav */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MiningDashboard;
