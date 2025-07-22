
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Copy, ExternalLink } from "lucide-react";
import { useTonWallet } from "@/hooks/useTonWallet";
import { useApp } from "@/contexts/AppContext";
import { DatabaseService } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface WalletHolding {
  id: string;
  balance: number;
  cryptocurrency: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_24h: number;
    icon_url: string;
  };
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  price_usd: number;
  total_usd: number;
  status: string;
  created_at: string;
  cryptocurrencies: {
    symbol: string;
    name: string;
    icon_url: string;
  };
}

const WalletPage = () => {
  const { userData, balance } = useApp();
  const { isConnected, walletAddress, balance: tonBalance, connectWallet, formatAddress } = useTonWallet();
  const [holdings, setHoldings] = useState<WalletHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      loadWalletData();
    }
  }, [userData]);

  const loadWalletData = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      
      // Load wallet holdings
      const { data: holdingsData, error: holdingsError } = await DatabaseService.getWalletHoldings(userData.telegram_id);
      
      if (holdingsError) {
        console.error('Error loading holdings:', holdingsError);
      } else {
        setHoldings(holdingsData || []);
      }
      
      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await DatabaseService.getTransactions(userData.telegram_id, 20);
      
      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل بيانات المحفظة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    const cryptoValue = holdings.reduce((total, holding) => {
      return total + (holding.balance * holding.cryptocurrency.current_price);
    }, 0);
    
    const spaceValue = balance * 0.000683; // SPACE price in USD
    const tonValue = parseFloat(tonBalance || '0') * 5.2; // TON price in USD
    
    return cryptoValue + spaceValue + tonValue;
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "تم النسخ",
        description: "تم نسخ عنوان المحفظة",
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
      case 'receive':
      case 'mining':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'sell':
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'buy': return 'شراء';
      case 'sell': return 'بيع';
      case 'receive': return 'استقبال';
      case 'send': return 'إرسال';
      case 'mining': return 'تعدين';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="space-y-6 p-4">
        {/* Total Portfolio Value */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Wallet className="h-5 w-5" />
              إجمالي قيمة المحفظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              ${calculateTotalValue().toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+2.4% اليوم</span>
            </div>
          </CardContent>
        </Card>

        {/* TON Wallet Connection */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              محفظة TON
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isConnected && walletAddress ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">العنوان:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={`https://tonviewer.com/${walletAddress}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الرصيد:</span>
                  <span className="font-semibold">{tonBalance || '0.0000'} TON</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">القيمة:</span>
                  <span className="font-semibold">≈ ${(parseFloat(tonBalance || '0') * 5.2).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">قم بربط محفظة TON للحصول على المزيد من الميزات</p>
                <Button onClick={connectWallet} className="w-full">
                  ربط محفظة TON
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SPACE Balance */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">SPACE Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {balance.toFixed(4)} SPACE
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ ${(balance * 0.000683).toFixed(6)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">السعر</div>
                <div className="font-semibold">$0.000683</div>
                <Badge variant="outline" className="text-green-500">
                  +11.84%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Holdings */}
        {holdings.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">ممتلكاتك من العملات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {holdings.map((holding) => (
                <div key={holding.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">
                        {holding.cryptocurrency.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {holding.cryptocurrency.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {holding.balance.toFixed(4)} {holding.cryptocurrency.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      ${(holding.balance * holding.cryptocurrency.current_price).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${holding.cryptocurrency.current_price.toFixed(6)}
                    </div>
                    <Badge 
                      variant={holding.cryptocurrency.price_change_24h >= 0 ? "default" : "destructive"}
                      className={holding.cryptocurrency.price_change_24h >= 0 ? "bg-green-500/20 text-green-500" : ""}
                    >
                      {holding.cryptocurrency.price_change_24h >= 0 ? '+' : ''}{holding.cryptocurrency.price_change_24h.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">المعاملات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <div className="font-semibold text-foreground">
                          {getTransactionLabel(transaction.transaction_type)} {transaction.cryptocurrencies?.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {transaction.transaction_type === 'sell' || transaction.transaction_type === 'send' ? '-' : '+'}
                        {transaction.amount.toFixed(4)} {transaction.cryptocurrencies?.symbol}
                      </div>
                      {transaction.total_usd && (
                        <div className="text-sm text-muted-foreground">
                          ≈ ${transaction.total_usd.toFixed(2)}
                        </div>
                      )}
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className={transaction.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}
                      >
                        {transaction.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">لا توجد معاملات بعد</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ابدأ التداول أو التعدين لترى معاملاتك هنا
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default WalletPage;
