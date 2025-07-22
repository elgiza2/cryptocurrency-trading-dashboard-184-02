
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Coins, Server, Gift } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { DatabaseService } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface MiningSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  reward_amount: number;
  is_active: boolean;
  is_completed: boolean;
  is_claimed: boolean;
}

interface UserServer {
  id: string;
  user_id: string;
  server_id: string;
  mining_power: number;
  start_time: string;
  end_time: string;
  purchase_price: number;
  is_active: boolean;
  servers: {
    name: string;
    description: string;
    icon_url: string;
  };
}

interface UserNFT {
  id: string;
  mining_power: number;
  nft_collections: {
    name: string;
    image_url: string;
  };
}

const MiningDashboard = () => {
  const { userData, balance, updateBalance, refreshUserData } = useApp();
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [userServers, setUserServers] = useState<UserServer[]>([]);
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingMining, setStartingMining] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      loadMiningData();
    }
  }, [userData]);

  const loadMiningData = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      // Load current mining session
      const { data: session } = await DatabaseService.getMiningSession(userData.telegram_id);
      setMiningSession(session);
      
      // Load user servers (assuming we'll add this method)
      // const { data: servers } = await DatabaseService.getUserServers(userData.telegram_id);
      // setUserServers(servers || []);
      
      // Load user NFTs
      const { data: nfts } = await DatabaseService.getUserNFTs(userData.telegram_id);
      setUserNFTs(nfts || []);
      
    } catch (error) {
      console.error('Error loading mining data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل بيانات التعدين",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalMiningPower = () => {
    const nftPower = userNFTs.reduce((total, nft) => total + (nft.mining_power || 1), 0);
    const serverPower = userServers.reduce((total, server) => total + (server.mining_power || 1), 0);
    return Math.max(1, nftPower + serverPower);
  };

  const calculateDailyIncome = () => {
    const baseDailyReward = 125.5;
    const miningPowerMultiplier = calculateTotalMiningPower();
    return baseDailyReward * miningPowerMultiplier;
  };

  const getMiningProgress = () => {
    if (!miningSession || !miningSession.is_active) return 0;
    
    const startTime = new Date(miningSession.start_time).getTime();
    const endTime = new Date(miningSession.end_time).getTime();
    const currentTime = Date.now();
    
    const elapsed = currentTime - startTime;
    const total = endTime - startTime;
    
    return Math.min(100, (elapsed / total) * 100);
  };

  const getRemainingTime = () => {
    if (!miningSession || !miningSession.is_active) return "00:00:00";
    
    const endTime = new Date(miningSession.end_time).getTime();
    const currentTime = Date.now();
    const remaining = Math.max(0, endTime - currentTime);
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startMining = async () => {
    if (!userData) return;
    
    try {
      setStartingMining(true);
      
      const dailyIncome = calculateDailyIncome();
      const { data, error } = await DatabaseService.createMiningSession(
        userData.telegram_id,
        8,
        dailyIncome
      );
      
      if (error) {
        toast({
          title: "خطأ في بدء التعدين",
          description: "فشل في بدء جلسة تعدين جديدة",
          variant: "destructive"
        });
        return;
      }
      
      setMiningSession(data);
      toast({
        title: "تم بدء التعدين",
        description: `بدأت جلسة تعدين جديدة لمدة 8 ساعات`,
      });
      
    } catch (error) {
      console.error('Error starting mining:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء بدء التعدين",
        variant: "destructive"
      });
    } finally {
      setStartingMining(false);
    }
  };

  const claimReward = async () => {
    if (!miningSession || !userData) return;
    
    try {
      setClaimingReward(true);
      
      const { data, error } = await DatabaseService.completeMiningSession(miningSession.id);
      
      if (error) {
        toast({
          title: "خطأ في استلام المكافأة",
          description: "فشل في استلام مكافأة التعدين",
          variant: "destructive"
        });
        return;
      }
      
      // Update local state
      setMiningSession(null);
      await refreshUserData();
      
      toast({
        title: "تم استلام المكافأة!",
        description: `تم إضافة ${miningSession.reward_amount} SPACE إلى محفظتك`,
      });
      
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استلام المكافأة",
        variant: "destructive"
      });
    } finally {
      setClaimingReward(false);
    }
  };

  const canClaimReward = () => {
    if (!miningSession || !miningSession.is_active) return false;
    const endTime = new Date(miningSession.end_time).getTime();
    return Date.now() >= endTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Balance Card */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Coins className="h-5 w-5" />
            رصيدك الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {balance.toFixed(4)} SPACE
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ≈ ${(balance * 0.000683).toFixed(6)} USD
          </div>
        </CardContent>
      </Card>

      {/* Mining Status Card */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5" />
            حالة التعدين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {miningSession && miningSession.is_active ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-foreground">التقدم:</span>
                <span className="text-foreground">{getMiningProgress().toFixed(1)}%</span>
              </div>
              
              <Progress value={getMiningProgress()} className="w-full" />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الوقت المتبقي:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{getRemainingTime()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المكافأة المتوقعة:</span>
                <span className="font-bold">{miningSession.reward_amount} SPACE</span>
              </div>
              
              {canClaimReward() ? (
                <Button 
                  onClick={claimReward} 
                  disabled={claimingReward}
                  className="w-full"
                >
                  {claimingReward ? "جاري الاستلام..." : "استلم المكافأة"}
                </Button>
              ) : (
                <Badge variant="outline" className="w-full justify-center py-2">
                  التعدين قيد التشغيل...
                </Badge>
              )}
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-foreground">
                  الدخل اليومي المتوقع: {calculateDailyIncome().toFixed(2)} SPACE
                </div>
                <div className="text-sm text-muted-foreground">
                  قوة التعدين: {calculateTotalMiningPower()}x
                </div>
              </div>
              
              <Button 
                onClick={startMining} 
                disabled={startingMining}
                className="w-full"
              >
                {startingMining ? "جاري البدء..." : "ابدأ التعدين (8 ساعات)"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mining Power Breakdown */}
      {(userNFTs.length > 0 || userServers.length > 0) && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Server className="h-5 w-5" />
              مصادر قوة التعدين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userNFTs.map((nft) => (
              <div key={nft.id} className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm">{nft.nft_collections?.name || 'NFT'}</span>
                </div>
                <span className="text-sm font-semibold">+{nft.mining_power}x</span>
              </div>
            ))}
            
            {userServers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm">{server.servers?.name || 'Server'}</span>
                </div>
                <span className="text-sm font-semibold">+{server.mining_power}x</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MiningDashboard;
