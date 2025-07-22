import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Gift, Users, ExternalLink, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseService } from "@/lib/database";

interface TasksPageProps {
  onNavigateToReferral?: () => void;
}

const TasksPage = ({ onNavigateToReferral }: TasksPageProps) => {
  const [referralLink, setReferralLink] = useState("");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get Telegram user data and set referral link
    if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = (window as any).Telegram.WebApp.initDataUnsafe.user;
      setTelegramUser(user);
      setReferralLink(`https://t.me/Vlreonbot?startapp=${user.username || user.id}`);
    } else {
      // Fallback for development/testing
      const fallbackUser = {
        id: 'fallback_user_123',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User'
      };
      setTelegramUser(fallbackUser);
      setReferralLink(`https://t.me/Vlreonbot?startapp=${fallbackUser.username}`);
    }

    // Check for start param
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('tgWebAppStartParam');
    if (startParam) {
      // Handle referral registration
      console.log('Referral from:', startParam);
    }
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // Load missions from database
      const { data: missions, error } = await DatabaseService.getMissions();
      if (error) throw error;
      setTasks(missions || []);

      // Load user completed missions
      if (telegramUser?.id) {
        const { data: userMissions, error: userError } = await DatabaseService.getUserMissions(telegramUser.id.toString());
        if (!userError) {
          setUserTasks(userMissions || []);
          setCompletedTasks(userMissions?.map(um => um.mission_id) || []);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const completeTask = async (taskId: string, reward: number) => {
    if (!telegramUser?.id) {
      toast({
        title: "Error",
        description: "User not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    try {
      const { data, error } = await DatabaseService.completeMission(telegramUser.id.toString(), taskId);
      if (error) throw error;
      
      // Update state to remove the task immediately
      setCompletedTasks(prev => [...prev, taskId]);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast({
        title: "Task completed!",
        description: `You earned ${reward} $SI`
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const TaskCard = ({ task, onComplete, showUrl = false }: any) => {
    const isCompleted = completedTasks.includes(task.id);
    
    const handleTaskAction = () => {
      if (isCompleted) return;
      
      if (showUrl && task.url) {
        // Open URL and then complete task
        window.open(task.url, '_blank');
        // Complete task immediately after opening URL
        setTimeout(() => {
          onComplete(task.id, task.reward_amount);
        }, 1000);
      } else {
        onComplete(task.id, task.reward_amount);
      }
    };

    // Don't render completed tasks
    if (isCompleted) return null;
    
    return (
      <Card className="bg-secondary/60 border-white/10 p-2 backdrop-blur-sm">
        <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">{task.title}</h3>
                <div className="flex items-center mt-1">
                  <Gift className="w-3 h-3 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 font-medium text-xs">
                    {task.reward_amount} $SI
                  </span>
                </div>
              </div>
            <div className="ml-2">
              <Button
                size="sm"
                onClick={() => {
                  if (task.url) {
                    window.open(task.url, '_blank');
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-3 py-1 h-7"
              >
                Go
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen unified-gaming-bg text-foreground p-2">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4 text-center">Tasks</h1>
          
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/60 h-8 border border-white/10">
              <TabsTrigger value="main" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                Main
              </TabsTrigger>
              <TabsTrigger value="social" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">
                Social
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="main" className="space-y-2 mt-4">
              {tasks.filter(task => task.mission_type === 'main' || task.mission_type === 'daily').filter(task => !completedTasks.includes(task.id)).map(task => (
                <TaskCard key={task.id} task={task} onComplete={completeTask} />
              ))}
              
              {tasks.filter(task => task.mission_type === 'main' || task.mission_type === 'daily').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  All tasks completed! Check back later for new tasks.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="social" className="space-y-2 mt-4">
              {tasks.filter(task => task.mission_type === 'social').filter(task => !completedTasks.includes(task.id)).map(task => (
                <TaskCard key={task.id} task={task} onComplete={completeTask} showUrl={true} />
              ))}
              
              {tasks.filter(task => task.mission_type === 'social').filter(task => !completedTasks.includes(task.id)).length === 0 && (
                <div className="text-center text-gray-400 py-6 text-sm">
                  All tasks completed! Check back later for new tasks.
                </div>
              )}
            </TabsContent>
            
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TasksPage;