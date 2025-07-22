
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, Gift, ExternalLink, Users, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { DatabaseService } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  mission_type: string;
  is_active: boolean;
  url?: string;
  cryptocurrencies: {
    symbol: string;
    name: string;
    icon_url: string;
  };
}

interface UserMission {
  id: string;
  mission_id: string;
  completed_at: string;
  reward_claimed: boolean;
  missions: {
    title: string;
    description: string;
    reward_amount: number;
    mission_type: string;
    url?: string;
  };
}

interface ReferralStats {
  total_referrals: number;
  total_earned: number;
}

const TasksPage = () => {
  const { userData, refreshUserData } = useApp();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({ total_referrals: 0, total_earned: 0 });
  const [loading, setLoading] = useState(true);
  const [completingMission, setCompletingMission] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      loadTasksData();
    }
  }, [userData]);

  const loadTasksData = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      // Load available missions
      const { data: missionsData, error: missionsError } = await DatabaseService.getMissions();
      if (missionsError) {
        console.error('Error loading missions:', missionsError);
      } else {
        setMissions(missionsData || []);
      }
      
      // Load user completed missions
      const { data: userMissionsData, error: userMissionsError } = await DatabaseService.getUserMissions(userData.telegram_id);
      if (userMissionsError) {
        console.error('Error loading user missions:', userMissionsError);
      } else {
        setUserMissions(userMissionsData || []);
      }
      
      // Load referral stats
      const { data: referralData, error: referralError } = await DatabaseService.getUserReferralStats(userData.telegram_id);
      if (referralError) {
        console.error('Error loading referral stats:', referralError);
      } else {
        setReferralStats(referralData || { total_referrals: 0, total_earned: 0 });
      }
      
    } catch (error) {
      console.error('Error loading tasks data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل بيانات المهام",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isMissionCompleted = (missionId: string) => {
    return userMissions.some(um => um.mission_id === missionId);
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-4 w-4" />;
      case 'referral':
        return <Users className="h-4 w-4" />;
      case 'special':
        return <Gift className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMissionTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'يومية';
      case 'weekly': return 'أسبوعية';
      case 'special': return 'خاصة';
      case 'referral': return 'إحالة';
      default: return type;
    }
  };

  const completeMission = async (mission: Mission) => {
    if (!userData) return;
    
    try {
      setCompletingMission(mission.id);
      
      // If mission has URL, open it first
      if (mission.url) {
        window.open(mission.url, '_blank');
        
        // Wait a moment to let user complete the external task
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Complete the mission
      const { data, error } = await DatabaseService.completeMission(userData.telegram_id, mission.id);
      
      if (error) {
        toast({
          title: "خطأ في إنجاز المهمة",
          description: "فشل في تسجيل إنجاز المهمة",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh data
      await loadTasksData();
      await refreshUserData();
      
      toast({
        title: "تم إنجاز المهمة!",
        description: `تم إضافة ${mission.reward_amount} ${mission.cryptocurrencies?.symbol} إلى محفظتك`,
      });
      
    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنجاز المهمة",
        variant: "destructive"
      });
    } finally {
      setCompletingMission(null);
    }
  };

  const shareReferralLink = () => {
    if (!userData) return;
    
    const referralLink = `https://t.me/your_bot_username?start=${userData.telegram_id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'انضم إلى منصة التعدين',
        text: 'احصل على مكافآت مجانية عند التسجيل!',
        url: referralLink
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الإحالة",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="space-y-6 p-4">
        {/* Referral Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              نظام الإحالة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {referralStats.total_referrals}
                </div>
                <div className="text-sm text-muted-foreground">
                  إجمالي الإحالات
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {referralStats.total_earned}
                </div>
                <div className="text-sm text-muted-foreground">
                  إجمالي الأرباح
                </div>
              </div>
            </div>
            
            <Button onClick={shareReferralLink} className="w-full">
              شارك رابط الإحالة
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              احصل على 150 SPACE لكل صديق يسجل عبر رابطك
            </div>
          </CardContent>
        </Card>

        {/* Available Missions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gift className="h-5 w-5" />
              المهام المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {missions.filter(mission => mission.is_active).map((mission) => {
              const isCompleted = isMissionCompleted(mission.id);
              const isCompleting = completingMission === mission.id;
              
              return (
                <div key={mission.id} className="p-4 bg-card/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getMissionTypeIcon(mission.mission_type)}
                        <span className="font-semibold text-foreground">
                          {mission.title}
                        </span>
                        <Badge variant="outline">
                          {getMissionTypeLabel(mission.mission_type)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            +{mission.reward_amount} {mission.cryptocurrencies?.symbol}
                          </span>
                        </div>
                        
                        {isCompleted ? (
                          <Badge className="bg-green-500/20 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            مكتملة
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => completeMission(mission)}
                            disabled={isCompleting}
                            className="flex items-center gap-1"
                          >
                            {isCompleting ? (
                              "جاري الإنجاز..."
                            ) : (
                              <>
                                ابدأ المهمة
                                {mission.url && <ExternalLink className="h-3 w-3" />}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Completed Missions */}
        {userMissions.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5" />
                المهام المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userMissions.slice(0, 5).map((userMission) => (
                <div key={userMission.id} className="p-3 bg-card/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-foreground">
                        {userMission.missions?.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-500">
                        +{userMission.missions?.reward_amount} SPACE
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(userMission.completed_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

export default TasksPage;
