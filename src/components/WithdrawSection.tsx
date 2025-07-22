import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Info } from "lucide-react";

interface WithdrawSectionProps {
  userBalance: { space: number; ton: number };
}

const WithdrawSection = ({ userBalance }: WithdrawSectionProps) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositRequirement, setShowDepositRequirement] = useState(false);
  const [showPurchaseRequirement, setShowPurchaseRequirement] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (amount < 1) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is 1 TON",
        variant: "destructive"
      });
      return;
    }

    if (amount > userBalance.ton) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough TON",
        variant: "destructive"
      });
      return;
    }

    // Check if user has exactly 1 TON and wants to withdraw
    if (userBalance.ton >= 1 && userBalance.ton <= 1.5) {
      setShowDepositRequirement(true);
      return;
    }

    // If user has deposited but hasn't purchased anything
    if (userBalance.ton > 1.5) {
      setShowPurchaseRequirement(true);
      return;
    }

    // Normal withdrawal process
    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of ${amount} TON has been initiated`,
    });
    setWithdrawAmount('');
  };

  const handleDeposit = () => {
    toast({
      title: "Deposit Required",
      description: "You need to deposit 1 TON before withdrawing",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-3">
      {/* Withdraw Input */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-blue-200 text-xs">Withdraw Amount</span>
          <span className="text-blue-200 text-xs">Min: 1 TON</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0"
            className="bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0 text-white"
          />
          <span className="text-blue-200 font-medium text-sm">TON</span>
        </div>
      </div>

      {/* Balance Info */}
      <div className="text-xs text-blue-200">
        Available: {userBalance.ton.toFixed(4)} TON
      </div>

      {/* Hidden Requirements - Show only when triggered */}
      {showDepositRequirement && (
        <Card className="bg-orange-500/10 backdrop-blur-xl border-orange-500/30 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-orange-200 text-sm font-medium">
                Deposit Required for Withdrawal
              </p>
              <p className="text-orange-100 text-xs">
                You must deposit 1 TON before you can withdraw your balance.
              </p>
              <Button
                onClick={handleDeposit}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 rounded-lg"
              >
                Deposit 1 TON
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showPurchaseRequirement && (
        <Card className="bg-red-500/10 backdrop-blur-xl border-red-500/30 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-red-200 text-sm font-medium">
                Purchase Required for Withdrawal
              </p>
              <p className="text-red-100 text-xs">
                To withdraw your funds, you must first:
              </p>
              <div className="text-red-100 text-xs space-y-1">
                <div>• Purchase an NFT, OR</div>
                <div>• Buy a mining server, OR</div>
                <div>• Purchase a roulette spin</div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded-lg"
                  onClick={() => {
                    toast({
                      title: "Redirecting to NFTs",
                      description: "Please purchase an NFT to enable withdrawals"
                    });
                  }}
                >
                  Buy NFT
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg"
                  onClick={() => {
                    toast({
                      title: "Redirecting to Servers",
                      description: "Please purchase a server to enable withdrawals"
                    });
                  }}
                >
                  Buy Server
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Withdraw Button */}
      {!showDepositRequirement && !showPurchaseRequirement && (
        <Button 
          onClick={handleWithdraw}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-12 text-base font-medium rounded-2xl shadow-lg"
          disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
        >
          Withdraw TON
        </Button>
      )}
    </div>
  );
};

export default WithdrawSection;