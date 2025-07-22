import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  price_usd: number;
  total_usd: number;
  status: string;
  created_at: string;
  cryptocurrency: {
    symbol: string;
    name: string;
  };
}

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            cryptocurrency:cryptocurrencies(symbol, name)
          `)
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching transactions:', error);
        } else {
          setTransactions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            تاريخ المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">جاري تحميل المعاملات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5" />
          تاريخ المعاملات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد معاملات</h3>
            <p className="text-muted-foreground">
              ابدأ التداول لترى معاملاتك هنا
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-card/30 rounded-xl border border-border/50 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.transaction_type === 'buy' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {transaction.transaction_type === 'buy' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {transaction.transaction_type === 'buy' ? 'شراء' : 'بيع'} {transaction.cryptocurrency?.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-foreground">
                  {transaction.amount.toFixed(4)} {transaction.cryptocurrency?.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${(transaction.total_usd || 0).toFixed(2)}
                </div>
                <Badge 
                  variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                  className={
                    transaction.status === 'completed' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-warning/20 text-warning'
                  }
                >
                  {transaction.status === 'completed' ? 'مكتملة' : 'معلقة'}
                </Badge>
              </div>
            </div>
          ))
        )}
        
        {transactions.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full mt-4 border-border hover:bg-muted/50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            عرض جميع المعاملات
          </Button>
        )}
      </CardContent>
    </Card>
  );
};