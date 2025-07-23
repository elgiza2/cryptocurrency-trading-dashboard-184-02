
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpDown, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import CryptoChart from "./CryptoChart";

interface CurrencyExchangeProps {
  onBack?: () => void;
}

const CurrencyExchange = ({ onBack }: CurrencyExchangeProps) => {
  const [fromCurrency, setFromCurrency] = useState<'SPACE' | 'TON'>('SPACE');
  const [toCurrency, setToCurrency] = useState<'SPACE' | 'TON'>('TON');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [spacePrice, setSpacePrice] = useState(0.0006835);
  const [priceChange24h, setPriceChange24h] = useState(2.45);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  // Use Telegram back button instead of custom button
  useTelegramBackButton({ 
    onBack: onBack || (() => {}), 
    isVisible: !!onBack 
  });

  // Fixed SPACE logo URL
  const spaceLogoUrl = "https://assets.pepecase.app/assets/space-logo.png";

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const amount = parseFloat(value);
      if (fromCurrency === 'SPACE') {
        setToAmount((amount * spacePrice).toFixed(6));
      } else {
        setToAmount((amount / spacePrice).toFixed(0));
      }
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const amount = parseFloat(value);
      if (toCurrency === 'SPACE') {
        setFromAmount((amount / spacePrice).toFixed(6));
      } else {
        setFromAmount((amount * spacePrice).toFixed(0));
      }
    } else {
      setFromAmount('');
    }
  };

  const handleExchange = async () => {
    if (!fromAmount || !toAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to exchange",
        variant: "destructive"
      });
      return;
    }

    if (!tonConnectUI.wallet) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your TON wallet first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Exchange Successful!",
        description: `Successfully exchanged ${fromAmount} ${fromCurrency} for ${toAmount} ${toCurrency}`,
        className: "bg-green-900 border-green-700 text-green-100"
      });
      
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      toast({
        title: "Exchange Failed",
        description: "Failed to complete the exchange. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("UQCMWS548CHXs9FXls34OiKAM5IbVSOr0Rwe-tTY7D14DUoq");
    toast({
      title: "Address Copied!",
      description: "Contract address copied to clipboard",
      className: "bg-green-900 border-green-700 text-green-100"
    });
  };

  return (
    <div className="min-h-screen unified-gaming-bg text-foreground">
      <div className="pt-8">
        <div className="px-3 space-y-3 max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Exchange</h1>
            <p className="text-white/70 text-lg">
              Trade between SPACE and TON tokens
            </p>
          </div>

          {/* Price Indicator Box */}
          <Card className="bg-black backdrop-blur-xl border-white/20 rounded-2xl p-6 overflow-hidden">
            <div className="space-y-4">
              {/* Top row with logo and name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={spaceLogoUrl} 
                    alt="$SPACE" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading SPACE logo:', e);
                      // Fallback to a default image or hide the image
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-white mb-1">$SPACE</div>
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

          {/* Chart */}
          <Card className="bg-black backdrop-blur-xl border-white/20 rounded-2xl h-64 p-6">
            <CryptoChart currentPrice={spacePrice} />
          </Card>

          {/* Exchange Interface */}
          <Card className="bg-secondary/60 backdrop-blur-xl border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Exchange</h2>
            
            {/* From Currency */}
            <div className="space-y-4">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">From</span>
                  <Badge variant="secondary" className="text-xs">
                    {fromCurrency}
                  </Badge>
                </div>
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-white text-2xl font-bold placeholder-gray-500 border-none outline-none"
                />
                <div className="text-gray-400 text-sm mt-1">
                  ≈ ${fromAmount ? (parseFloat(fromAmount) * (fromCurrency === 'SPACE' ? spacePrice : 1)).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapCurrencies}
                  variant="outline"
                  size="icon"
                  className="rounded-full border-white/20 bg-black/40 hover:bg-white/10 text-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Currency */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">To</span>
                  <Badge variant="secondary" className="text-xs">
                    {toCurrency}
                  </Badge>
                </div>
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-white text-2xl font-bold placeholder-gray-500 border-none outline-none"
                />
                <div className="text-gray-400 text-sm mt-1">
                  ≈ ${toAmount ? (parseFloat(toAmount) * (toCurrency === 'SPACE' ? spacePrice : 1)).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Exchange Rate */}
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Exchange Rate</span>
                  <span className="text-white font-medium">
                    1 {fromCurrency} = {fromCurrency === 'SPACE' ? spacePrice.toFixed(6) : (1/spacePrice).toFixed(0)} {toCurrency}
                  </span>
                </div>
              </div>

              {/* Exchange Button */}
              <Button
                onClick={handleExchange}
                disabled={loading || !fromAmount || !toAmount}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold rounded-2xl disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Exchange
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </Card>


          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchange;
