
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server, Zap, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { EnhancedTonTransactionService } from '@/services/enhancedTonTransactionService';
import { DatabaseService } from "@/lib/database";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";

interface ServerPageProps {
  onBack?: () => void;
  onNavigateToAbout?: () => void;
  userBalance?: {
    space: number;
    ton: number;
  };
  userServers?: any[];
  onServerPurchase?: (server: any) => void;
}

interface ServerTier {
  id: string;
  name: string;
  price: number;
  dailyReward: number;
  duration: number;
  description: string;
  color: string;
  icon: typeof Server;
}

const ServerPage = ({ onBack, onNavigateToAbout, userBalance }: ServerPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  // Use Telegram back button instead of custom button
  useTelegramBackButton({ 
    onBack: onBack || (() => {}), 
    isVisible: !!onBack 
  });

  useEffect(() => {
    const initTelegramData = () => {
      if ((window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        setTelegramUser((window as any).Telegram.WebApp.initDataUnsafe.user);
      }
    };

    initTelegramData();
    const timeout = setTimeout(initTelegramData, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const serverTiers: ServerTier[] = [
    {
      id: "basic",
      name: "Basic Server",
      price: 0.5,
      dailyReward: 65,
      duration: 30,
      description: "Perfect for beginners",
      color: "bg-blue-500",
      icon: Server
    },
    {
      id: "advanced",
      name: "Advanced Server",
      price: 1,
      dailyReward: 130,
      duration: 30,
      description: "Great for regular miners",
      color: "bg-purple-500",
      icon: Server
    },
    {
      id: "pro",
      name: "Pro Server",
      price: 2.5,
      dailyReward: 325,
      duration: 30,
      description: "High performance mining",
      color: "bg-orange-500",
      icon: Server
    },
    {
      id: "enterprise",
      name: "Enterprise Server",
      price: 5,
      dailyReward: 650,
      duration: 30,
      description: "Maximum mining power",
      color: "bg-red-500",
      icon: Server
    }
  ];

  const handleRentServer = async (server: ServerTier) => {
    if (!tonConnectUI.wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your TON wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!telegramUser?.id) {
      toast({
        title: "Error",
        description: "Telegram user not found",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSelectedServer(server.id);

    try {
      const transactionService = new EnhancedTonTransactionService(tonConnectUI);
      
      toast({
        title: "Processing Transaction",
        description: "Please confirm the TON transaction in your wallet..."
      });

      const result = await transactionService.sendTransaction(
        "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq",
        server.price,
        `Server Rental: ${server.name}`,
        telegramUser.id.toString()
      );

      console.log('Transaction result:', result);

      // Save to database
      const { error } = await DatabaseService.purchaseServer(
        telegramUser.id.toString(),
        server.id,
        server.price,
        server.dailyReward,
        server.duration * 24
      );

      if (error) {
        console.error('Database error:', error);
      }

      toast({
        title: "Server Rented Successfully!",
        description: `${server.name} has been rented for ${server.duration} days. You'll earn ${server.dailyReward} SPACE daily.`,
        className: "bg-green-900 border-green-700 text-green-100"
      });

    } catch (error: any) {
      console.error('Error renting server:', error);
      
      if (error.message?.includes('User declined')) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction. No charges were made.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Insufficient')) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${server.price} TON to rent this server.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to rent server. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setSelectedServer(null);
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen unified-gaming-bg text-foreground">
        <div className="p-4 pt-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Server Rental</h1>
            <p className="text-white/70 text-lg">
              Rent virtual servers to mine $SPACE tokens 24/7
            </p>
          </div>

          {/* Info Card */}
          <Card className="bg-secondary/60 backdrop-blur-xl border-white/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Each server mines automatically for 30 days. Higher tier servers provide better daily rewards.
                </p>
                <button 
                  onClick={onNavigateToAbout}
                  className="text-blue-400 text-sm mt-2 hover:text-blue-300 transition-colors"
                >
                  Learn more about mining →
                </button>
              </div>
            </div>
          </Card>

          {/* Server Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serverTiers.map((server) => (
              <Card key={server.id} className="bg-secondary/60 backdrop-blur-xl border-white/20 rounded-2xl overflow-hidden hover:bg-secondary/80 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${server.color} rounded-xl flex items-center justify-center`}>
                        <server.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{server.name}</CardTitle>
                        <p className="text-white/70 text-sm">{server.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Price</span>
                      <div className="flex items-center gap-1">
                        <img src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" alt="TON" className="w-4 h-4" />
                        <span className="text-white font-medium">{server.price} TON</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Daily Reward</span>
                      <div className="flex items-center gap-1">
                        <img src="https://assets.pepecase.app/assets/space-logo.png" alt="SPACE" className="w-4 h-4" />
                        <span className="text-white font-medium">{server.dailyReward} SPACE</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Duration</span>
                      <Badge variant="secondary" className="bg-white/10 text-white">
                        {server.duration} days
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-white/70 text-sm">Total Reward</span>
                      <div className="flex items-center gap-1">
                        <img src="https://assets.pepecase.app/assets/space-logo.png" alt="SPACE" className="w-4 h-4" />
                        <span className="text-green-400 font-medium">{server.dailyReward * server.duration} SPACE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3">
                  <Button 
                    onClick={() => handleRentServer(server)}
                    disabled={isLoading}
                    className={`w-full ${server.color} hover:opacity-90 text-white py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                      selectedServer === server.id ? 'animate-pulse' : ''
                    }`}
                  >
                    {isLoading && selectedServer === server.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Rent Server</span>
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Connect Wallet Button */}
          {!tonConnectUI.wallet && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
              <Button 
                onClick={() => tonConnectUI.openModal()} 
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-medium rounded-2xl border border-primary/50"
              >
                Connect Wallet to Rent Servers
              </Button>
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-20"></div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ServerPage;
