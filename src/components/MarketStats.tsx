
import { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MarketStats = () => {
  const [marketData, setMarketData] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    totalCryptos: 0,
    activeTrades: 0,
    totalHolders: 0
  });

  useEffect(() => {
    loadMarketStats();
    setupRealtimeSubscription();
  }, []);

  const loadMarketStats = async () => {
    try {
      // Get total cryptocurrencies
      const { data: cryptos } = await supabase
        .from('cryptocurrencies')
        .select('market_cap, volume_24h, trade_count_24h');

      // Get total holders from wallet_holdings
      const { data: holders } = await supabase
        .from('wallet_holdings')
        .select('user_id')
        .gt('balance', 0);

      // Get total transactions count
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id');

      if (cryptos && cryptos.length > 0) {
        const totalMarketCap = cryptos.reduce((sum, crypto) => sum + (Number(crypto.market_cap) || 0), 0);
        const totalVolume = cryptos.reduce((sum, crypto) => sum + (Number(crypto.volume_24h) || 0), 0);
        const totalTrades = cryptos.reduce((sum, crypto) => sum + (crypto.trade_count_24h || 0), 0);

        // Get unique holders
        const uniqueHolders = new Set(holders?.map(h => h.user_id) || []);

        setMarketData({
          totalMarketCap,
          totalVolume,
          totalCryptos: cryptos.length,
          activeTrades: Math.max(totalTrades, transactions?.length || 0),
          totalHolders: uniqueHolders.size
        });
      } else {
        setMarketData({
          totalMarketCap: 2100000000000, // Default value
          totalVolume: 84200000000,
          totalCryptos: 5,
          activeTrades: transactions?.length || 0,
          totalHolders: holders?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading market stats:', error);
      // Set default values on error
      setMarketData({
        totalMarketCap: 2100000000000,
        totalVolume: 84200000000,
        totalCryptos: 5,
        activeTrades: 0,
        totalHolders: 0
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('market-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cryptocurrencies'
        },
        () => {
          loadMarketStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          loadMarketStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_holdings'
        },
        () => {
          loadMarketStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatCount = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatNumber(marketData.totalMarketCap)}</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          2.4%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatNumber(marketData.totalVolume)}</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          5.1%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Active Cryptos</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">{marketData.totalCryptos}</p>
        <span className="text-sm text-warning flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          Live
        </span>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Holders</h3>
          <TrendingUpIcon className="w-4 h-4 text-info" />
        </div>
        <p className="text-2xl font-semibold mt-2">{formatCount(marketData.totalHolders)}</p>
        <span className="text-sm text-info flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          Live Update
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
