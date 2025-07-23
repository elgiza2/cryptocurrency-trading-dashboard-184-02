
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowDownUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonPrice } from "@/hooks/useTonPrice";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseService } from "@/lib/database";
import CryptoChart from "./CryptoChart";
import UnifiedBackButton from "./UnifiedBackButton";
import WithdrawSection from "./WithdrawSection";
import spaceLogoUrl from "@/assets/space-logo.png";
import { useApp } from "@/contexts/AppContext";

interface CurrencyExchangeProps {
  onBack?: () => void;
}

const CurrencyExchange = ({ onBack }: CurrencyExchangeProps) => {
  const [giveAmount, setGiveAmount] = useState('');
  const [isSwapDirection, setIsSwapDirection] = useState(true);
  const [spaceData, setSpaceData] = useState<any>(null);
  const [tonData, setTonData] = useState<any>(null);
  const [userBalances, setUserBalances] = useState<{ space: number; ton: number }>({ space: 0, ton: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { tonPrice } = useTonPrice();
  const { telegramUser, updateBalance } = useApp();

  // Load cryptocurrency data and user balances from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load SPACE and TON data
        const { data: cryptoData, error: cryptoError } = await supabase
          .from('cryptocurrencies')
          .select('*')
          .in('symbol', ['SPACE', 'TON']);
        
        if (cryptoError) throw cryptoError;
        
        const space = cryptoData.find(crypto => crypto.symbol === 'SPACE');
        const ton = cryptoData.find(crypto => crypto.symbol === 'TON');
        
        setSpaceData(space || {
          current_price: 0.0006835,
          price_change_24h: 11.84,
          name: 'SPACE',
          symbol: 'SPACE'
        });
        
        setTonData(ton || {
          current_price: tonPrice,
          price_change_24h: 0,
          name: 'TON',
          symbol: 'TON'
        });
        
        // Load user balances if user is logged in
        if (telegramUser) {
          const holdingsResponse = await DatabaseService.getWalletHoldings(telegramUser.id.toString());
          if (holdingsResponse.data) {
            let spaceBalance = 0;
            let tonBalance = 0;
            
            holdingsResponse.data.forEach((holding: any) => {
              if (holding.cryptocurrencies?.symbol === 'SPACE') {
                spaceBalance = holding.balance || 0;
              } else if (holding.cryptocurrencies?.symbol === 'TON') {
                tonBalance = holding.balance || 0;
              }
            });
            
            setUserBalances({ space: spaceBalance, ton: tonBalance });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default data
        setSpaceData({
          current_price: 0.0006835,
          price_change_24h: 11.84,
          name: 'SPACE',
          symbol: 'SPACE'
        });
        setTonData({
          current_price: tonPrice,
          price_change_24h: 0,
          name: 'TON',
          symbol: 'TON'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [telegramUser, tonPrice]);

  const exchangeRate = spaceData?.current_price || 0.0006835;
  const spacePrice = exchangeRate * tonPrice;
  const priceChange24h = spaceData?.price_change_24h || 11.84;
  
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
    return isSwapDirection ? userBalances.space : userBalances.ton;
  };

  const handleSwap = async () => {
    if (!telegramUser) {
      toast({
        title: "Error",
        description: "Please login to perform swap",
        variant: "destructive"
      });
      return;
    }

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

    try {
      const receiveAmount = calculateReceiveAmount();
      const fromCurrency = isSwapDirection ? 'SPACE' : 'TON';
      const toCurrency = isSwapDirection ? 'TON' : 'SPACE';
      const fromCurrencyData = isSwapDirection ? spaceData : tonData;
      const toCurrencyData = isSwapDirection ? tonData : spaceData;

      if (fromCurrencyData && toCurrencyData) {
        // Update crypto holdings directly without creating transactions
        // Subtract from source currency
        await DatabaseService.updateCryptoHolding(
          telegramUser.id.toString(),
          fromCurrencyData.id,
          inputAmount,
          false // subtract
        );

        // Add to destination currency
        await DatabaseService.updateCryptoHolding(
          telegramUser.id.toString(),
          toCurrencyData.id,
          receiveAmount,
          true // add
        );

        // Create a single exchange transaction record for history
        await supabase
          .from('transactions')
          .insert({
            user_id: telegramUser.id.toString(),
            cryptocurrency_id: fromCurrencyData.id,
            amount: inputAmount,
            transaction_type: 'exchange',
            price_usd: fromCurrencyData.current_price || 0,
            total_usd: inputAmount * (fromCurrencyData.current_price || 0),
            status: 'completed'
          });

        // Update local balances
        if (isSwapDirection) {
          setUserBalances(prev => ({
            space: Math.max(0, prev.space - inputAmount),
            ton: prev.ton + receiveAmount
          }));
        } else {
          setUserBalances(prev => ({
            space: prev.space + receiveAmount,
            ton: Math.max(0, prev.ton - inputAmount)
          }));
        }

        toast({
          title: "Exchange Successful",
          description: `Exchanged ${inputAmount} ${fromCurrency} to ${receiveAmount.toFixed(6)} ${toCurrency}`,
        });
        
        setGiveAmount('');
      }
    } catch (error) {
      console.error('Error performing swap:', error);
      toast({
        title: "Error",
        description: "Failed to perform swap. Please try again.",
        variant: "destructive"
      });
    }
  };

  const switchDirection = () => {
    setIsSwapDirection(!isSwapDirection);
    setGiveAmount('');
  };

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen text-white pt-8">
        
        {/* Unified Header */}
        {onBack && <UnifiedBackButton onBack={onBack} title="Currency Exchange" />}

        <div className="px-3 space-y-3 max-w-md mx-auto">
          {/* Price Indicator Box - Redesigned to prevent overflow */}
          <Card className="bg-black backdrop-blur-xl border-white/20 rounded-2xl p-6 overflow-hidden">
            <div className="space-y-4">
              {/* Top row with logo and name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={spaceLogoUrl} alt="$SPACE" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-white">$SPACE</div>
                  <div className="text-base text-gray-300">
                    ${loading ? '0.000000' : spacePrice.toFixed(6)}
                  </div>
                </div>
              </div>
              
              {/* Bottom row with price change */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {priceChange24h > 0 ? 
                    <TrendingUp className="h-5 w-5 text-yellow-500" /> : 
                    <TrendingDown className="h-5 w-5 text-yellow-500" />
                  }
                  <span className="text-yellow-500 font-medium text-base">
                    {priceChange24h > 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm text-gray-400">24h Change</div>
              </div>
            </div>
          </Card>

          {/* Chart - Black Background */}
          <Card className="bg-black backdrop-blur-xl border-white/20 rounded-2xl h-40 p-3">
            <CryptoChart currentPrice={spacePrice} />
          </Card>

          {/* Balance Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {(isSwapDirection ? userBalances.space : userBalances.ton).toFixed(4)} {isSwapDirection ? '$SPACE' : 'TON'}
                  </div>
                  <div className="text-blue-200 text-xs">Your Balance</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:bg-white/10"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
            </div>

            <hr className="border-white/20 mb-2" />

            <div className="space-y-1">
              <div className="text-blue-200 text-xs">
                {isSwapDirection ? '$SPACE' : 'TON'} Price
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-white">
                  {isSwapDirection 
                    ? `${exchangeRate.toFixed(8)} TON` 
                    : `${(1/exchangeRate).toFixed(2)} SPACE`
                  }
                </span>
                <span className="text-green-400 text-xs">+ {priceChange24h}%</span>
              </div>
            </div>
          </Card>

          {/* Swap Section */}
          <div className="space-y-3 mb-4">
            <h2 className="text-base font-semibold text-blue-100">
              Swap {isSwapDirection ? '$SPACE' : 'TON'} to {isSwapDirection ? 'TON' : '$SPACE'}
            </h2>

            {/* Give Input */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-200 text-xs">Give</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={giveAmount}
                    onChange={(e) => setGiveAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0 text-white"
                  />
                  <span className="text-blue-200 font-medium text-sm">
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
                className="rounded-full bg-white/10 hover:bg-white/20 w-8 h-8 p-0 backdrop-blur-sm"
              >
                <ArrowDownUp className="h-3 w-3 text-white" />
              </Button>
            </div>

            {/* Receive Input */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-200 text-xs">Receive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold flex-1 text-white">
                    {giveAmount ? calculateReceiveAmount().toFixed(6) : '0'}
                  </div>
                  <span className="text-blue-200 font-medium text-sm">
                    {isSwapDirection ? 'TON' : '$SPACE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="space-y-3 mb-4">
            <h2 className="text-base font-semibold text-blue-100">
              Withdraw TON
            </h2>

            <WithdrawSection userBalance={userBalances} />
          </div>

          {/* Swap Button */}
          <Button 
            onClick={handleSwap}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-medium rounded-2xl shadow-lg"
            disabled={!giveAmount || parseFloat(giveAmount) <= 0}
          >
            Swap
          </Button>

          <div className="h-16"></div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default CurrencyExchange;
