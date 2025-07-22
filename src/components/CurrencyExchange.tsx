
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowDownUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonPrice } from "@/hooks/useTonPrice";
import CryptoChart from "./CryptoChart";
import UnifiedBackButton from "./UnifiedBackButton";

interface CurrencyExchangeProps {
  onBack?: () => void;
  userBalance?: { space: number; ton: number };
  onExchange?: (fromCurrency: string, toCurrency: string, amount: number) => void;
}

const CurrencyExchange = ({ 
  onBack, 
  userBalance = { space: 0.8001, ton: 0.1175 },
  onExchange 
}: CurrencyExchangeProps) => {
  const [giveAmount, setGiveAmount] = useState('');
  const [isSwapDirection, setIsSwapDirection] = useState(true);
  const { toast } = useToast();
  const { tonPrice } = useTonPrice();

  const exchangeRate = 0.0006835;
  const spacePrice = exchangeRate * tonPrice;
  const priceChange24h = 11.84;
  
  const calculateReceiveAmount = () => {
    const inputAmount = parseFloat(giveAmount);
    if (isNaN(inputAmount)) return 0;
    
    if (isSwapDirection) {
      return inputAmount * exchangeRate;
    } else {
      return inputAmount / exchangeRate;
    }
  };

  const getMaxAmount = () => {
    return isSwapDirection ? userBalance.space : userBalance.ton;
  };

  const handleSwap = () => {
    const inputAmount = parseFloat(giveAmount);
    const maxAmount = getMaxAmount();
    
    if (isNaN(inputAmount) || inputAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (inputAmount > maxAmount) {
      const currency = isSwapDirection ? 'SPACE' : 'TON';
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${currency}`,
        variant: "destructive"
      });
      return;
    }

    const fromCurrency = isSwapDirection ? 'SPACE' : 'TON';
    const toCurrency = isSwapDirection ? 'TON' : 'SPACE';
    onExchange?.(fromCurrency, toCurrency, inputAmount);
    
    toast({
      title: "Exchange Successful",
      description: `Exchanged ${inputAmount} ${fromCurrency} to ${calculateReceiveAmount().toFixed(6)} ${toCurrency}`,
    });
    
    setGiveAmount('');
  };

  const switchDirection = () => {
    setIsSwapDirection(!isSwapDirection);
    setGiveAmount('');
  };

  return (
    <ScrollArea className="h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950">
      <div className="min-h-screen text-white">
        
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="تبديل العملات" />}

        <div className="px-3 space-y-4">
          {/* Price Indicator Box - Enhanced Blue Design */}
          <Card className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-xl border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">S</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">$SPACE</div>
                  <div className="text-base text-blue-100">
                    ${spacePrice.toFixed(6)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-2 text-base font-medium ${priceChange24h > 0 ? 'text-blue-100' : 'text-blue-200'}`}>
                  {priceChange24h > 0 ? 
                    <TrendingUp className="h-5 w-5 text-blue-100" /> : 
                    <TrendingDown className="h-5 w-5 text-blue-200" />
                  }
                  <span className="text-white">
                    {priceChange24h > 0 ? '+' : ''}{priceChange24h}%
                  </span>
                </div>
                <div className="text-sm text-blue-300 mt-1">24h</div>
              </div>
            </div>
          </Card>

          {/* Chart - Enhanced Blue Theme */}
          <Card className="bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-xl border-blue-500/30 rounded-2xl h-48 p-3">
            <CryptoChart currentPrice={spacePrice} />
          </Card>

          {/* Balance Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {(isSwapDirection ? userBalance.space : userBalance.ton).toFixed(4)} {isSwapDirection ? '$SPACE' : 'TON'}
                  </div>
                  <div className="text-blue-200 text-sm">رصيدك</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:bg-white/10"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>

            <hr className="border-white/20 mb-3" />

            <div className="space-y-1">
              <div className="text-blue-200 text-sm">
                سعر {isSwapDirection ? '$SPACE' : 'TON'}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {isSwapDirection 
                    ? `${exchangeRate.toFixed(8)} TON` 
                    : `${(1/exchangeRate).toFixed(2)} SPACE`
                  }
                </span>
                <span className="text-green-400 text-sm">+ {priceChange24h}%</span>
              </div>
            </div>
          </Card>

          {/* Swap Section */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-100">
              تبديل {isSwapDirection ? '$SPACE' : 'TON'} إلى {isSwapDirection ? 'TON' : '$SPACE'}
            </h2>

            {/* Give Input */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm">إعطاء</span>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={giveAmount}
                    onChange={(e) => setGiveAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent border-none text-xl font-bold p-0 h-auto focus-visible:ring-0 text-white"
                  />
                  <span className="text-blue-200 font-medium text-lg">
                    {isSwapDirection ? '$SPACE' : 'TON'}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <Button
                onClick={switchDirection}
                variant="ghost"
                size="sm"
                className="rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 p-0 backdrop-blur-sm"
              >
                <ArrowDownUp className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* Receive Input */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-200 text-sm">استلام</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold flex-1 text-white">
                    {giveAmount ? calculateReceiveAmount().toFixed(6) : '0'}
                  </div>
                  <span className="text-blue-200 font-medium text-lg">
                    {isSwapDirection ? 'TON' : '$SPACE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button 
            onClick={handleSwap}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-14 text-lg font-medium rounded-2xl shadow-lg"
            disabled={!giveAmount || parseFloat(giveAmount) <= 0}
          >
            تبديل
          </Button>

          <div className="h-16"></div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default CurrencyExchange;
