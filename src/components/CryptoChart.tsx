
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface CryptoChartProps {
  cryptoId?: string;
  currentPrice?: number;
}

const CryptoChart = ({ cryptoId, currentPrice }: CryptoChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cryptoId) {
      loadPriceHistory();
      setupRealtimeSubscription();
    } else {
      // If no cryptoId provided, use default data
      generateDefaultData();
    }
  }, [cryptoId, selectedTimeframe]);

  const loadPriceHistory = async () => {
    if (!cryptoId) return;
    
    try {
      setLoading(true);
      
      // Since price_history table doesn't exist, generate data with current price
      generateDataWithCurrentPrice();
    } catch (error) {
      console.error('Error loading price history:', error);
      generateDataWithCurrentPrice();
    } finally {
      setLoading(false);
    }
  };

  const generateDataWithCurrentPrice = () => {
    const price = currentPrice || 0.064;
    const dataPoints = [];
    const now = new Date();
    
    // Generate data showing current price with slight variations
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      // Slight variation around current price
      const variation = (Math.random() - 0.5) * 0.001 * price;
      const adjustedPrice = Math.max(0.0001, price + variation);
      
      dataPoints.push({
        time: formatTimeForChart(time.toISOString()),
        price: Number(adjustedPrice.toFixed(6)),
        volume: Math.random() * 1000000
      });
    }
    
    setChartData(dataPoints);
  };

  const generateDefaultData = () => {
    // Default data for general preview
    const dataPoints = [];
    let basePrice = 0.064;
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      const volatility = 0.005;
      const change = (Math.random() - 0.5) * volatility;
      basePrice = Math.max(0.001, basePrice + change);
      
      dataPoints.push({
        time: formatTimeForChart(time.toISOString()),
        price: Number(basePrice.toFixed(6)),
        volume: Math.random() * 1000000
      });
    }
    
    setChartData(dataPoints);
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    if (!cryptoId) return;
    
    const channel = supabase
      .channel('price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cryptocurrencies',
          filter: `id=eq.${cryptoId}`
        },
        (payload) => {
          const newRecord = payload.new;
          const newDataPoint = {
            time: formatTimeForChart(new Date().toISOString()),
            price: Number(newRecord.current_price),
            volume: Math.random() * 1000000
          };
          
          setChartData(prev => [...prev.slice(-23), newDataPoint]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getDataPointsForTimeframe = () => {
    const configs = {
      "1m": 60,
      "5m": 60,
      "15m": 48,
      "1h": 24,
      "1d": 30
    };
    return configs[selectedTimeframe as keyof typeof configs] || 24;
  };

  const formatTimeForChart = (dateString: string) => {
    const date = new Date(dateString);
    if (selectedTimeframe === "1d") {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const timeframes = [
    { key: "1m", label: "1m" },
    { key: "5m", label: "5m" },
    { key: "15m", label: "15m" },
    { key: "1h", label: "1h" },
    { key: "1d", label: "1d" }
  ];

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))"
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Timeframe Buttons */}
      <div className="flex gap-1 p-2 bg-card/30 border-b border-white/10 flex-shrink-0">
        {timeframes.map(timeframe => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe.key)}
            className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedTimeframe === timeframe.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0
              }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
              <YAxis
                domain={['dataMin - 0.001', 'dataMax + 0.001']}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(6)}`,
                      "Price"
                    ]}
                    labelFormatter={label => `Time: ${label}`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default CryptoChart;
