import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Coins } from "lucide-react";
import CurrencyExchange from "./CurrencyExchange";

interface TradingPageProps {
  onBack?: () => void;
}

const TradingPage = ({ onBack }: TradingPageProps) => {
  return (
    <div className="p-4 space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
      )}
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            التداول والصرافة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            قم بتبديل عملاتك الرقمية بأفضل الأسعار
          </p>
        </CardContent>
      </Card>

      <CurrencyExchange />
    </div>
  );
};

export default TradingPage;