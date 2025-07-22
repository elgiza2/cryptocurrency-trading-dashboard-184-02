
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
      // Get daily statistics data
      const { data: dailyStats } = await supabase
        .from('crypto_daily_stats')
        .select('market_cap, volume_usd_24h, transactions_count, holders_count')
        .eq('date', new Date().toISOString().split('T')[0]);

      // Get total cryptocurrencies
      const { data: cryptos } = await supabase
        .from('cryptocurrencies')
        .select('id');

      // Get total holders
      const { data: holders } = await supabase
        .from('crypto_holders')
        .select('id')
        .gt('balance', 0);

      // Get trading volumes for current day
      const { data: volumes } = await supabase
        .from('trading_volumes')
        .select('buy_volume_usd, sell_volume_usd, transactions_count')
        .gte('hour_timestamp', new Date().toISOString().split('T')[0]);

      if (dailyStats && dailyStats.length > 0) {
        const totalMarketCap = dailyStats.reduce((sum, stat) => sum + (stat.market_cap || 0), 0);
        const totalVolume = dailyStats.reduce((sum, stat) => sum + (stat.volume_usd_24h || 0), 0);
        const totalTrades = dailyStats.reduce((sum, stat) => sum + (stat.transactions_count || 0), 0);
        const totalHoldersCount = dailyStats.reduce((sum, stat) => sum + (stat.holders_count || 0), 0);

        setMarketData({
          totalMarketCap,
          totalVolume,
          totalCryptos: cryptos?.length || 0,
          activeTrades: totalTrades,
          totalHolders: totalHoldersCount
        });
      } else {
        // If no daily data found, use basic data
        let totalVolumeFromHours = 0;
        if (volumes && volumes.length > 0) {
          totalVolumeFromHours = volumes.reduce((sum, vol) => 
            sum + (vol.buy_volume_usd || 0) + (vol.sell_volume_usd || 0), 0
          );
        }

        setMarketData({
          totalMarketCap: 2100000000000, // Default value
          totalVolume: totalVolumeFromHours || 84200000000,
          totalCryptos: cryptos?.length || 0,
          activeTrades: volumes?.reduce((sum, vol) => sum + (vol.transactions_count || 0), 0) || 0,
          totalHolders: holders?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading market stats:', error);
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
          table: 'crypto_daily_stats'
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
          table: 'trading_volumes'
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
          table: 'crypto_holders'
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
