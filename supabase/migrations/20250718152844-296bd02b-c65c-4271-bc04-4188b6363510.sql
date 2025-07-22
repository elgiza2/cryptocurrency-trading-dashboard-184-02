-- Insert TON as a tradable cryptocurrency
INSERT INTO public.cryptocurrencies (
  name, 
  symbol, 
  current_price, 
  price_change_24h, 
  volume_24h, 
  market_cap, 
  description, 
  website_url,
  trade_count_24h
) VALUES (
  'Toncoin', 
  'TON', 
  2.45, 
  0.0, 
  0, 
  0, 
  'The native cryptocurrency of The Open Network (TON) blockchain, originally developed by Telegram.',
  'https://ton.org',
  0
) ON CONFLICT (symbol) DO NOTHING;