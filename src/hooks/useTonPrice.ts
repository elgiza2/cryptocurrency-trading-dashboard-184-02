import { useState, useEffect } from 'react';

interface TonPriceData {
  tonPrice: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useTonPrice = (): TonPriceData => {
  const [tonPrice, setTonPrice] = useState(2.5); // Default fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTonPrice = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Primary source: CoinGecko
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd&include_24hr_change=true',
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const price = data['the-open-network']?.usd;
        
        if (price && typeof price === 'number' && price > 0) {
          setTonPrice(price);
          setLastUpdated(new Date());
          console.log(`TON price updated: $${price}`);
        } else {
          throw new Error('Invalid price data received');
        }
      } catch (error) {
        console.warn('Failed to fetch TON price from CoinGecko:', error);
        setError('Failed to fetch price data');
        
        // Use cached price or fallback
        const cachedPrice = localStorage.getItem('tonPrice');
        if (cachedPrice) {
          const parsed = parseFloat(cachedPrice);
          if (!isNaN(parsed) && parsed > 0) {
            setTonPrice(parsed);
            console.log(`Using cached TON price: $${parsed}`);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTonPrice();
    
    // Update price every 30 seconds for more real-time updates
    const interval = setInterval(fetchTonPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Cache price in localStorage when it changes
  useEffect(() => {
    if (tonPrice && !loading && !error) {
      localStorage.setItem('tonPrice', tonPrice.toString());
      localStorage.setItem('tonPriceTimestamp', Date.now().toString());
    }
  }, [tonPrice, loading, error]);

  return { 
    tonPrice, 
    loading, 
    error, 
    lastUpdated 
  };
};