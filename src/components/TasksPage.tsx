import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Gift, Users, ExternalLink, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseService } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import AdminPage from "./AdminPage";

interface TasksPageProps {
  onNavigateToReferral?: () => void;
}

const TasksPage = ({ onNavigateToReferral }: TasksPageProps) => {
  const [referralLink, setReferralLink] = useState("");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get Telegram user data and set referral link
    if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe.user;
      setTelegramUser(user);
      setReferralLink(`https://t.me/SpaceVerseBot?start=${user.id}`);
    } else {
      // Fallback for testing
      setReferralLink("https://t.me/SpaceVerseBot?start=123456");
    }

    fetchTasks();
    fetchUserTasks();

    // Set up real-time subscription for missions
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions'
        },
        (payload) => {
          console.log('Mission change detected:', payload);
          // Refresh tasks when any change occurs
          fetchTasks();
          
          // Show toast notification for admin changes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Mission Added!",
              description: "A new mission is now available.",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Mission Removed",
              description: "A mission has been removed.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Mission Updated",
              description: "A mission has been updated.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchTasks = async () => {
    try {
      const response = await DatabaseService.getMissions();
      if (response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTasks = async () => {
    try {
      if (telegramUser) {
        const response = await DatabaseService.getUserMissions(telegramUser.id.toString());
        if (response.data) {
          setUserTasks(response.data);
          setCompletedTasks(response.data.map((ut: any) => ut.mission_id));
        }
      }
    } catch (error) {
      console.error("Error fetching user tasks:", error);
    }
  };

  const completeTask = async (taskId: string, reward: number) => {
    try {
      if (telegramUser) {
        await DatabaseService.completeMission(telegramUser.id.toString(), taskId);
        setCompletedTasks(prev => [...prev, taskId]);
        
        // Check if this is the Daily Login Check mission
        const task = tasks.find(t => t.id === taskId);
        if (task && task.title === "Daily Login Check") {
          // Create a transaction of 0.25 TON for the daily login
          const tonCrypto = await DatabaseService.getCryptocurrencies();
          const tonCoin = tonCrypto.data?.find(crypto => crypto.symbol === 'TON');
          
          if (tonCoin) {
            await DatabaseService.createTransaction(
              telegramUser.id.toString(),
              tonCoin.id,
              0.25,
              'buy',
              tonCoin.current_price || 0
            );
            
            toast({
              title: "Daily Login Completed!",
              description: `You earned ${reward} $SPACE tokens and 0.25 TON!`,
            });
          } else {
            toast({
              title: "Task Completed!",
              description: `You earned ${reward} $SPACE tokens`,
            });
          }
        } else {
          toast({
            title: "Task Completed!",
            description: `You earned ${reward} $SPACE tokens`,
          });
        }
        
        fetchUserTasks(); // Refresh user tasks
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareOnTelegram = () => {
    const message = encodeURIComponent(`Join me on SPACE Verse and earn crypto rewards! ${referralLink}`);
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${message}`;
    window.open(telegramShareUrl, '_blank');
  };

  const shareOnTwitter = () => {
    const message = encodeURIComponent(`Join me on SPACE Verse and earn crypto rewards! ${referralLink}`);
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${message}`;
    window.open(twitterShareUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`Join me on SPACE Verse and earn crypto rewards! ${referralLink}`);
    const whatsappShareUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappShareUrl, '_blank');
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const handleMainTabClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdminPanel(true);
        setClickCount(0);
        return 0;
      }
      return newCount;
    });
  };

  const TaskCard = ({ task, onComplete, showUrl = false }: any) => {
    const isCompleted = completedTasks.includes(task.id);
    
    const handleTaskAction = () => {
      if (isCompleted) return;
      
      // Open URL if available
      if (task.url) {
        window.open(task.url, '_blank');
      }
      
      // Always complete the task and add points
      onComplete(task.id, task.reward_amount);
    };

    return (
      <Card className="bg-secondary/40 border-white/10 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">{task.title}</h3>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-primary font-medium">+{task.reward_amount} $SPACE</span>
                  {showUrl && task.url && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleTaskAction}
              disabled={isCompleted}
              className={`text-xs px-3 py-1 h-7 ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Done
                </>
              ) : (
                'Go'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showAdminPanel) {
    return <AdminPage onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen unified-gaming-bg text-foreground p-2">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4 text-center">Tasks</h1>
          
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/60 h-8 border border-white/10">
              <TabsTrigger 
                value="main" 
                className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                onClick={handleMainTabClick}
              >
                Main
              </TabsTrigger>
              <TabsTrigger value="social" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                Social
              </TabsTrigger>
              <TabsTrigger value="daily" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                Daily
              </TabsTrigger>
              <TabsTrigger value="partners" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                Partners
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="main" className="space-y-2 mt-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Loading tasks...
                </div>
              ) : (
                <>
                  {tasks.filter(task => task.mission_type === 'main').filter(task => !completedTasks.includes(task.id)).map(task => (
                    <TaskCard key={task.id} task={task} onComplete={completeTask} />
                  ))}
                  
                  {tasks.filter(task => task.mission_type === 'main').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                    <div className="text-center text-muted-foreground py-6 text-sm">
                      All tasks completed! Check back later for new tasks.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="social" className="space-y-2 mt-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Loading tasks...
                </div>
              ) : (
                <>
                  {tasks.filter(task => task.mission_type === 'social').filter(task => !completedTasks.includes(task.id)).map(task => (
                    <TaskCard key={task.id} task={task} onComplete={completeTask} showUrl={true} />
                  ))}
                  
                  {tasks.filter(task => task.mission_type === 'social').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                    <div className="text-center text-muted-foreground py-6 text-sm">
                      All tasks completed! Check back later for new tasks.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-2 mt-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Loading tasks...
                </div>
              ) : (
                <>
                  {tasks.filter(task => task.mission_type === 'daily').filter(task => !completedTasks.includes(task.id)).map(task => (
                    <TaskCard key={task.id} task={task} onComplete={completeTask} />
                  ))}
                  
                  {tasks.filter(task => task.mission_type === 'daily').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                    <div className="text-center text-muted-foreground py-6 text-sm">
                      All daily tasks completed! Check back tomorrow for new tasks.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="partners" className="space-y-2 mt-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Loading tasks...
                </div>
              ) : (
                <>
                  {tasks.filter(task => task.mission_type === 'partners').filter(task => !completedTasks.includes(task.id)).map(task => (
                    <TaskCard key={task.id} task={task} onComplete={completeTask} showUrl={true} />
                  ))}
                  
                  {tasks.filter(task => task.mission_type === 'partners').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                    <div className="text-center text-muted-foreground py-6 text-sm">
                      No partner tasks available! Check back later for new partnerships.
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TasksPage;