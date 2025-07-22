import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight,
  X,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI } from '@tonconnect/ui-react';
import AboutServersPage from "./AboutServersPage";
import UnifiedBackButton from "./UnifiedBackButton";
import { EnhancedDepositDialog } from "./EnhancedDepositDialog";

interface ServerPageProps {
  onBack?: () => void;
  userBalance?: { space: number; ton: number };
  userServers?: any[];
  onServerPurchase?: (server: any) => void;
}

const ServerPage = ({ 
  onBack, 
  userBalance = { space: 0.8001, ton: 0.1175 },
  userServers = [],
  onServerPurchase 
}: ServerPageProps) => {
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [showAboutServers, setShowAboutServers] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  const servers = [
    {
      id: 1,
      name: "Flux",
      color: "bg-blue-500",
      price: 1,
      income: 2,
      duration: 30,
      totalIncome: 2
    },
    {
      id: 2,
      name: "Nova",
      color: "bg-green-500", 
      price: 5,
      income: 10,
      duration: 30,
      totalIncome: 10
    },
    {
      id: 3,
      name: "ByteHub",
      color: "bg-gradient-to-r from-orange-500 to-red-500",
      price: 10,
      income: 20,
      duration: 30,
      totalIncome: 20
    },
    {
      id: 4,
      name: "CoreX",
      color: "bg-cyan-500",
      price: 50,
      income: 100,
      duration: 30,
      totalIncome: 100
    },
    {
      id: 5,
      name: "Zeon",
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      price: 100,
      income: 210,
      duration: 30,
      totalIncome: 210
    },
    {
      id: 6,
      name: "VortexPro",
      color: "bg-purple-500",
      price: 250,
      income: 537.5,
      duration: 30,
      totalIncome: 537.5
    },
    {
      id: 7,
      name: "NexusMax",
      color: "bg-pink-500",
      price: 500,
      income: 1100,
      duration: 30,
      totalIncome: 1100
    },
    {
      id: 8,
      name: "QuantumCore",
      color: "bg-indigo-500",
      price: 1000,
      income: 2225,
      duration: 30,
      totalIncome: 2225
    }
  ];

  const handleRentServer = (server: any) => {
    setSelectedServer(server);
  };

  const confirmPurchase = async () => {
    if (!selectedServer) return;

    const hasSufficientBalance = userBalance.ton >= selectedServer.price;
    
    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your TON balance first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newServer = {
        ...selectedServer,
        purchasedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + selectedServer.duration * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        timeLeft: "28d 12h 46m",
        dailyIncome: selectedServer.income / selectedServer.duration
      };

      if (onServerPurchase) {
        onServerPurchase(newServer);
      }

      toast({
        title: "Server Purchased!",
        description: `${selectedServer.name} has been added to your collection.`,
        className: "bg-green-900 border-green-700 text-green-100"
      });

      setSelectedServer(null);
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Transaction was cancelled or failed.",
        variant: "destructive"
      });
    }
  };

  if (showAboutServers) {
    return <AboutServersPage onBack={() => setShowAboutServers(false)} />;
  }

  const hasSufficientBalance = selectedServer ? userBalance.ton >= selectedServer.price : true;

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen unified-gaming-bg text-white space-y-4">
        
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="Rent Server" />}

        <div className="px-3 space-y-4">
          {/* About Servers Button */}
          <Button 
            onClick={() => setShowAboutServers(true)}
            className="w-full h-12 bg-secondary/80 backdrop-blur-sm border border-white/20 text-white hover:bg-secondary/60 justify-between rounded-2xl"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-base">!</span>
              </div>
              <span className="text-base">About Servers</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>

          {/* Active Servers Display */}
          {userServers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-100">Your Active Servers ({userServers.length})</h3>
              {userServers.map((server, index) => (
                <Card key={index} className="bg-secondary/60 backdrop-blur-xl border-white/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${server.color} rounded-full`}></div>
                    <div>
                      <div className="font-semibold text-base text-white">{server.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-white">{server.timeLeft || "28d 12h 46m"}</div>
                      <div className="text-xs text-blue-200">Time Left</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold flex items-center gap-1 text-white">
                        ~ {server.dailyIncome || 0.02}
                        <img 
                          src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                          alt="TON" 
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="text-xs text-blue-200">Income Per Day</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Available Servers */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-100">Available Servers</h3>
            {servers.map((server, index) => (
              <Card key={index} className="bg-secondary/60 backdrop-blur-xl border-white/20 p-4 rounded-2xl hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${server.color} rounded-full`}></div>
                    <div>
                      <h3 className="font-semibold text-base mb-1 text-white">{server.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-blue-200">
                        <span>~ {server.income} TON</span>
                        <span>{server.duration} days</span>
                      </div>
                      <div className="text-xs text-blue-300 mt-1">
                        Total Income | Mining Time
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleRentServer(server)}
                    className="bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-medium rounded-xl"
                  >
                    Rent {server.price} TON
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Purchase Dialog */}
          {selectedServer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="bg-secondary/95 backdrop-blur-xl border-white/20 p-5 w-full max-w-sm rounded-3xl">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex justify-end mb-3">
                      <Button 
                        onClick={() => setSelectedServer(null)}
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className={`w-16 h-16 ${selectedServer.color} rounded-full mx-auto mb-3`}></div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{selectedServer.name}</h3>
                    <div className="text-xl font-bold flex items-center justify-center gap-1 text-white">
                      {selectedServer.price}
                      <img 
                        src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                        alt="TON" 
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center py-3">
                    <div>
                      <div className="text-lg font-bold flex items-center justify-center gap-1 text-white">
                        {selectedServer.totalIncome}
                        <img 
                          src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                          alt="TON" 
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="text-xs text-blue-200">Total Income</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold flex items-center justify-center gap-1 text-white">
                        {(selectedServer.income / selectedServer.duration).toFixed(2)}
                        <img 
                          src="https://client.mineverse.app/static/media/ton.29b74391f4cbf5ca7924.png" 
                          alt="TON" 
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="text-xs text-blue-200">Income Per Day</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{selectedServer.duration} days</div>
                      <div className="text-xs text-blue-200">Mining Time</div>
                    </div>
                  </div>

                  {!hasSufficientBalance && (
                    <div className="bg-destructive/20 border border-destructive/30 rounded-xl p-3">
                      <h4 className="text-destructive font-semibold mb-1 text-base">You don't have enough TON!</h4>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Top up your balance by {(selectedServer.price - userBalance.ton).toFixed(8)} TON to rent this server.
                      </p>
                    </div>
                  )}

                  {hasSufficientBalance ? (
                    <Button 
                      onClick={confirmPurchase}
                      className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium rounded-2xl"
                    >
                      Confirm
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setSelectedServer(null);
                        setShowDepositDialog(true);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium rounded-2xl"
                    >
                      Top Up Balance
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          <div className="h-20"></div>
        </div>
      </div>

      {/* Deposit Dialog */}
      <EnhancedDepositDialog 
        isOpen={showDepositDialog}
        onClose={() => setShowDepositDialog(false)}
        onDeposit={async (amount) => {
          toast({
            title: "Deposit Successful",
            description: `${amount} TON deposited successfully`,
            className: "bg-green-900 border-green-700 text-green-100"
          });
          setShowDepositDialog(false);
        }}
        isProcessing={false}
      />
    </ScrollArea>
  );
};

export default ServerPage;
