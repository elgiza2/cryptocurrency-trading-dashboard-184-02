-- Update SPACE token price to 0.0006835 TON
UPDATE public.cryptocurrencies 
SET 
  current_price = 0.0006835,
  updated_at = now()
WHERE symbol = 'SPACE';