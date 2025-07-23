import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Copy, ExternalLink } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  tonBalance: number;
  userAddress?: string;
}

const WithdrawModal = ({ isOpen, onClose, tonBalance, userAddress }: WithdrawModalProps) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > tonBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough TON for this withdrawal",
        variant: "destructive"
      });
      return;
    }

    if (!recipientAddress) {
      toast({
        title: "Missing Address",
        description: "Please enter a recipient address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would process the withdrawal
      // For now, we'll show a success message
      toast({
        title: "Withdrawal Initiated",
        description: `${amount} TON withdrawal request submitted`,
      });
      
      setWithdrawAmount('');
      setRecipientAddress('');
      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "An error occurred while processing your withdrawal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Address copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Withdraw TON
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm text-gray-300">Available Balance</div>
            <div className="text-lg font-bold text-white">{tonBalance.toFixed(4)} TON</div>
          </div>

          {/* Withdrawal Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Withdrawal Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              max={tonBalance}
              step="0.0001"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWithdrawAmount(tonBalance.toString())}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            >
              Use Max
            </Button>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">Recipient Address</Label>
            <Input
              id="address"
              placeholder="UQC..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            
            {userAddress && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecipientAddress(userAddress)}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                >
                  Use My Wallet
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(userAddress)}
                  className="text-gray-400 hover:text-gray-300 p-0 h-auto"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="text-yellow-200 text-sm">
              ⚠️ Please double-check the recipient address. TON transactions cannot be reversed.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount || !recipientAddress}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </div>

          {/* External Link */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://tonkeeper.com', '_blank')}
              className="text-gray-400 hover:text-gray-300 p-0 h-auto"
            >
              Need a TON wallet? Get Tonkeeper
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;