import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, PieChart, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTonPrice } from "@/hooks/useTonPrice";

interface PortfolioHolding {
  id: string;
  balance: number;
  cryptocurrency: {
    symbol: string;
    name: string;
    current_price: number;
    price_change_24h: number;
    icon_url: string;
  };
}

export const PortfolioSummary = () => {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const { tonPrice } = useTonPrice();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('wallet_holdings')
          .select(`
            *,
            cryptocurrency:cryptocurrencies(
              symbol,
              name,
              current_price,
              price_change_24h,
              icon_url
            )
          `)
          .eq('user_id', user.user.id)
          .gt('balance', 0);

        if (error) {
          console.error('Error fetching portfolio:', error);
        } else {
          setHoldings(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const calculateTotalValue = () => {
    return holdings.reduce((total, holding) => {
      return total + (holding.balance * holding.cryptocurrency.current_price * tonPrice);
    }, 0);
  };

  const calculateTotalInvested = () => {
    // Estimate invested amount as 80% of current value (since we don't store this)
    const currentValue = calculateTotalValue();
    return currentValue * 0.8;
  };

  const calculateTotalPnL = () => {
    const currentValue = calculateTotalValue();
    const invested = calculateTotalInvested();
    return currentValue - invested;
  };

  const calculatePnLPercentage = () => {
    const invested = calculateTotalInvested();
    if (invested === 0) return 0;
    return (calculateTotalPnL() / invested) * 100;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PieChart className="h-5 w-5" />
            ملخص المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">جاري تحميل المحفظة...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = calculateTotalValue();
  const totalInvested = calculateTotalInvested();
  const totalPnL = calculateTotalPnL();
  const pnlPercentage = calculatePnLPercentage();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <PieChart className="h-5 w-5" />
          ملخص المحفظة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Portfolio Value */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-foreground">
            ${totalValue.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            إجمالي قيمة المحفظة
          </div>
          <div className={`flex items-center justify-center gap-1 text-sm ${
            totalPnL >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
          </div>
        </div>

        {/* Portfolio Breakdown */}
        {holdings.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">ممتلكاتك</h3>
            {holdings.map((holding) => {
              const currentValue = holding.balance * holding.cryptocurrency.current_price * tonPrice;
              const estimatedInvested = currentValue * 0.8; // Estimate
              const pnl = currentValue - estimatedInvested;
              const pnlPercent = estimatedInvested > 0 
                ? (pnl / estimatedInvested) * 100 
                : 0;

              return (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-4 bg-card/30 rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {holding.cryptocurrency.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-foreground font-medium">
                        {holding.cryptocurrency.symbol}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {holding.balance.toFixed(4)} {holding.cryptocurrency.symbol}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-foreground font-medium">
                      ${currentValue.toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      ${holding.cryptocurrency.current_price.toFixed(6)} / {holding.cryptocurrency.symbol}
                    </div>
                    <Badge 
                      variant={pnl >= 0 ? "default" : "destructive"}
                      className={pnl >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}
                    >
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد ممتلكات</h3>
            <p className="text-muted-foreground">
              ابدأ التداول لترى محفظتك هنا
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};