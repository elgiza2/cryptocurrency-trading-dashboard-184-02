import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface EnhancedDepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
  isProcessing: boolean;
}

export const EnhancedDepositDialog = ({ 
  isOpen, 
  onClose, 
  onDeposit, 
  isProcessing 
}: EnhancedDepositDialogProps) => {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const numAmount = parseFloat(amount) || 0;

  const handleDirectDeposit = async () => {
    if (!numAmount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    await onDeposit(numAmount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-secondary border-border">
        <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center text-white">
          Deposit TON
        </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[0.1, 0.5, 1, 2, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setAmount(amount.toString())}
                    className={`text-sm ${
                      numAmount === amount 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
                    }`}
                  >
                    {amount} TON
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Custom Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-gray-800 border-gray-600 text-white"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </CardContent>
          </Card>

          {numAmount && numAmount > 0 && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-semibold">{numAmount} TON</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">USD Value:</span>
                    <span className="text-white">${(numAmount * 5.2).toFixed(2)}</span>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="text-white font-bold">{numAmount} TON</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleDirectDeposit}
            disabled={!numAmount || numAmount <= 0 || isProcessing}
            className="flex-1 btn-mining"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Deposit ${numAmount || 0} TON`
            )}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};