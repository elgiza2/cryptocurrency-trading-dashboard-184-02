import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RefreshCw, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  details?: {
    amount: number;
    token?: string;
    type: 'buy' | 'sell' | 'transfer';
  };
}

export const TransactionStatusModal = ({
  isOpen,
  onClose,
  status,
  transactionHash,
  details
}: TransactionStatusModalProps) => {
  const { toast } = useToast();

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-warning animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="h-8 w-8 text-success" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-destructive" />;
      default:
        return <RefreshCw className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'جاري المعالجة...';
      case 'confirmed':
        return 'تم بنجاح';
      case 'failed':
        return 'فشلت المعاملة';
      default:
        return 'في الانتظار';
    }
  };

  const copyTransactionHash = async () => {
    if (transactionHash) {
      try {
        await navigator.clipboard.writeText(transactionHash);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ معرف المعاملة إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "فشل النسخ",
          description: "فشل في نسخ معرف المعاملة",
          variant: "destructive"
        });
      }
    }
  };

  const openInExplorer = () => {
    if (transactionHash) {
      window.open(`https://tonviewer.com/transaction/${transactionHash}`, '_blank');
    }
  };

  const getTransactionTypeText = () => {
    if (!details) return '';
    
    switch (details.type) {
      case 'buy':
        return `شراء ${details.token || 'عملة'}`;
      case 'sell':
        return `بيع ${details.token || 'عملة'}`;
      case 'transfer':
        return 'تحويل TON';
      default:
        return 'معاملة';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">حالة المعاملة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Icon and Badge */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            
            <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Transaction Details */}
          {details && (
            <div className="space-y-3 p-4 bg-card/50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">نوع المعاملة:</span>
                <span className="font-medium">{getTransactionTypeText()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">المبلغ:</span>
                <span className="font-medium">
                  {details.amount.toFixed(4)} {details.token || 'TON'}
                </span>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                معرف المعاملة:
              </label>
              <div className="flex items-center gap-2 p-3 bg-card/30 rounded-lg border">
                <code className="flex-1 text-xs font-mono text-foreground break-all">
                  {transactionHash}
                </code>
                <Button size="icon" variant="ghost" onClick={copyTransactionHash} className="h-8 w-8">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={openInExplorer} className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          <div className="text-center text-sm text-muted-foreground">
            {status === 'pending' && (
              <p>يتم معالجة معاملتك على شبكة TON. قد يستغرق الأمر بضع ثوانٍ.</p>
            )}
            {status === 'confirmed' && (
              <p className="text-success">تم تأكيد معاملتك بنجاح على الشبكة!</p>
            )}
            {status === 'failed' && (
              <p className="text-destructive">فشلت المعاملة. يرجى المحاولة مرة أخرى.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'failed' && (
              <Button variant="outline" className="flex-1">
                إعادة المحاولة
              </Button>
            )}
            <Button 
              onClick={onClose} 
              className={`${status === 'failed' ? 'flex-1' : 'w-full'}`}
              variant={status === 'confirmed' ? 'default' : 'outline'}
            >
              {status === 'confirmed' ? 'تم' : 'إغلاق'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};