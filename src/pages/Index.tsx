
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Coins, Users, Zap, Gift } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import MiningDashboard from "@/components/MiningDashboard";
import WalletPage from "@/components/WalletPage";
import TradingPage from "@/components/TradingPage";
import TasksPage from "@/components/TasksPage";
import CurrencyExchange from "@/components/CurrencyExchange";
import NFTPage from "@/components/NFTPage";
import ServersPage from "@/components/ServersPage";
import { useApp } from "@/contexts/AppContext";
import { DatabaseService } from "@/lib/database";

const Index = () => {
  const { userData, isLoading } = useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalMiningPower: 0,
    activeMiners: 0
  });

  useEffect(() => {
    loadAppStats();
  }, []);

  const loadAppStats = async () => {
    try {
      // These would be real queries to get app statistics
      // For now, using placeholder values that could be fetched from database
      setStats({
        totalUsers: 12500,
        totalTransactions: 45230,
        totalMiningPower: 8945,
        activeMiners: 3421
      });
    } catch (error) {
      console.error('Error loading app stats:', error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'wallet':
        return <WalletPage />;
      case 'trading':
        return <TradingPage />;
      case 'tasks':
        return <TasksPage />;
      case 'exchange':
        return <CurrencyExchange onBack={() => setCurrentPage('home')} />;
      case 'nft':
        return <NFTPage onBack={() => setCurrentPage('home')} />;
      case 'servers':
        return <ServersPage onBack={() => setCurrentPage('home')} />;
      case 'home':
      default:
        return (
          <div className="space-y-6 p-4">
            {/* Welcome Section */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">
                  مرحباً {userData?.first_name || 'بك'}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ابدأ رحلتك في التعدين واكسب العملات الرقمية يومياً
                </p>
              </CardContent>
            </Card>

            {/* App Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {stats.totalUsers.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        إجمالي المستخدمين
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {stats.activeMiners.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        المعدنون النشطون
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mining Dashboard */}
            <MiningDashboard />

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Gift className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => setCurrentPage('exchange')}
                >
                  تبديل العملات
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => setCurrentPage('nft')}
                >
                  شراء NFT للتعدين
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => setCurrentPage('servers')}
                >
                  استئجار خادم تعدين
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => setCurrentPage('tasks')}
                >
                  إنجاز المهام
                  <Badge variant="secondary" className="ml-2">جديد</Badge>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Market Overview */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5" />
                  نظرة عامة على السوق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">S</span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">SPACE</div>
                      <div className="text-xs text-muted-foreground">Space Token</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">$0.000683</div>
                    <div className="text-xs text-green-500">+11.84%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Coins className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">TON</div>
                      <div className="text-xs text-muted-foreground">Toncoin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">$5.20</div>
                    <div className="text-xs text-green-500">+2.45%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <div className="pb-20">
        {renderContent()}
      </div>
      <MobileNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default Index;
