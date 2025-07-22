-- Insert some sample cryptocurrencies for testing
INSERT INTO public.cryptocurrencies (name, symbol, current_price, market_cap, volume_24h, price_change_24h, icon_url, description) VALUES
('Vireon Token', 'VIREON', 0.001, 1000000, 50000, 5.5, 'https://via.placeholder.com/64', 'The native token of Vireon platform for mining and trading'),
('Bitcoin', 'BTC', 45000.00, 850000000000, 25000000000, 2.3, 'https://via.placeholder.com/64', 'The first and most well-known cryptocurrency'),
('Ethereum', 'ETH', 3200.00, 380000000000, 15000000000, -1.2, 'https://via.placeholder.com/64', 'A decentralized platform for smart contracts'),
('TON Coin', 'TON', 2.50, 8500000000, 120000000, 8.7, 'https://via.placeholder.com/64', 'The Open Network native cryptocurrency')
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  volume_24h = EXCLUDED.volume_24h,
  price_change_24h = EXCLUDED.price_change_24h,
  updated_at = now();