
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ExternalLink, LogOut, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useTonWallet } from "@/hooks/useTonWallet";
import { useTonPrice } from "@/hooks/useTonPrice";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const TonWalletCard = () => {
  const { 
    isConnected, 
    walletAddress, 
    balance, 
    connectWallet, 
    disconnectWallet,
    formatAddress,
    isLoading,
    connectionError
  } = useTonWallet();
  const { tonPrice, loading: tonPriceLoading } = useTonPrice();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  // Enhanced connection state monitoring
  useEffect(() => {
    if (isConnected && walletAddress) {
      setConnectionState('connected');
      console.log('✅ Wallet connected successfully:', walletAddress);
    } else if (isLoading) {
      setConnectionState('connecting');
      console.log('⏳ Wallet connecting...');
    } else if (connectionError) {
      setConnectionState('error');
      console.error('❌ Connection error:', connectionError);
    } else {
      setConnectionState('idle');
      console.log('💤 Wallet idle');
    }
  }, [isConnected, walletAddress, isLoading, connectionError]);

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ عنوان المحفظة إلى الحافظة",
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast({
          title: "فشل النسخ",
          description: "فشل في نسخ العنوان",
          variant: "destructive"
        });
      }
    }
  };

  const openInExplorer = () => {
    if (walletAddress) {
      window.open(`https://tonviewer.com/${walletAddress}`, '_blank');
    }
  };

  const refreshBalance = async () => {
    console.log('🔄 Refreshing balance...');
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('✅ Balance refresh completed');
    }, 2000);
  };

  const handleConnectWallet = async () => {
    console.log('🔘 Connect button clicked - State:', { isConnected, isLoading, connectionState });
    
    if (isConnected || isLoading) {
      console.log('⚠️ Already connected or loading, ignoring click');
      return;
    }

    try {
      setConnectionState('connecting');
      console.log('🚀 Attempting wallet connection...');
      await connectWallet();
      console.log('✅ Connection attempt completed');
    } catch (error) {
      console.error('💥 Connection failed in card:', error);
      setConnectionState('error');
      toast({
        title: "فشل الاتصال",
        description: "تعذر ربط محفظة TON. تأكد من تثبيت محفظة TON",
        variant: "destructive"
      });
    }
  };

  // Enhanced connected state with better UI
  if (connectionState === 'connected' && isConnected && walletAddress) {
    return (
      <Card className="glass-card relative overflow-hidden border-success/20">
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-primary/10"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-success/20">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              محفظة TON
            </div>
            <Badge variant="secondary" className="bg-success/20 text-success border-success/30 animate-pulse">
              <CheckCircle className="w-3 h-3 mr-1" />
              متصل
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Enhanced Balance Display */}
          <div className="text-center p-6 bg-card/40 rounded-2xl border border-success/20">
            <div className="space-y-3">
              <div className="text-3xl font-bold text-success animate-fade-in">
                {balance ? `${balance} TON` : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    جاري التحميل...
                  </div>
                )}
              </div>
              {balance && !tonPriceLoading && (
                <div className="text-lg text-muted-foreground animate-fade-in">
                  ≈ ${(parseFloat(balance) * tonPrice).toFixed(2)} USD
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>سعر TON:</span>
                <span className="font-medium text-primary">${tonPrice.toFixed(2)}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={refreshBalance}
                  disabled={isRefreshing}
                  className="h-6 w-6 ml-2 hover:bg-primary/10"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Wallet Address Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              عنوان المحفظة
            </label>
            <div className="flex items-center gap-2 p-3 bg-card/30 rounded-xl border border-success/20 hover:border-success/40 transition-colors">
              <code className="flex-1 text-foreground text-sm font-mono">
                {formatAddress(walletAddress)}
              </code>
              <Button size="icon" variant="ghost" onClick={copyAddress} className="h-8 w-8 hover:bg-primary/10">
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={openInExplorer} className="h-8 w-8 hover:bg-secondary/10">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions with Enhanced UI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-primary/10 rounded-xl text-center hover:bg-primary/20 transition-all cursor-pointer border border-primary/20 hover:border-primary/40">
              <div className="text-primary font-medium mb-1">إرسال</div>
              <div className="text-xs text-muted-foreground">TON إلى محفظة أخرى</div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-xl text-center hover:bg-secondary/20 transition-all cursor-pointer border border-secondary/20 hover:border-secondary/40">
              <div className="text-secondary font-medium mb-1">استقبال</div>
              <div className="text-xs text-muted-foreground">عرض عنوان المحفظة</div>
            </div>
          </div>

          {/* Enhanced Disconnect Button */}
          <Button 
            variant="outline" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all"
            onClick={disconnectWallet}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "جاري قطع الاتصال..." : "قطع الاتصال"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Enhanced not connected state with better error handling
  return (
    <Card className="glass-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-full bg-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          محفظة TON
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-center space-y-6">
          {/* Enhanced Error Display */}
          {connectionError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">خطأ في الاتصال</span>
              </div>
              <p className="text-xs text-destructive/80">{connectionError}</p>
              <div className="text-xs text-muted-foreground mt-2">
                تأكد من تثبيت محفظة TON مثل Tonkeeper أو TonHub
              </div>
            </div>
          )}
          
          {/* Enhanced Connection Prompt */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">اربط محفظتك</h3>
              <p className="text-muted-foreground text-sm">
                ابدأ تجربة التداول والاستثمار الآمن مع TON
              </p>
            </div>
          </div>
          
          {/* Enhanced Connect Button */}
          <Button 
            onClick={handleConnectWallet}
            disabled={connectionState === 'connecting'}
            className="w-full btn-mining h-12 text-lg font-bold hover:scale-105 transition-transform"
          >
            {connectionState === 'connecting' ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                جاري الاتصال...
              </div>
            ) : (
              "ربط محفظة TON"
            )}
          </Button>
          
          {/* Enhanced Status Information */}
          <div className="text-xs text-muted-foreground/80 text-center space-y-2 p-3 bg-card/20 rounded-lg">
            <p className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-success animate-pulse' :
                connectionState === 'connecting' ? 'bg-warning animate-pulse' :
                connectionState === 'error' ? 'bg-destructive' : 'bg-muted'
              }`}></span>
              حالة الاتصال: {connectionState === 'idle' ? 'غير متصل' : connectionState}
            </p>
            <p>تأكد من تثبيت محفظة TON مثل Tonkeeper</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
