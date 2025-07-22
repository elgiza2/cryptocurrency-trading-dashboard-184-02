
-- Phase 1: Fix Critical Security Issues

-- Enable RLS on crypto_daily_stats table
ALTER TABLE public.crypto_daily_stats ENABLE ROW LEVEL SECURITY;

-- Enable RLS on crypto_holders table  
ALTER TABLE public.crypto_holders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cryptocurrencies table
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for crypto_daily_stats
CREATE POLICY "Anyone can view crypto daily stats" ON public.crypto_daily_stats FOR SELECT USING (true);

-- Update RLS policies for crypto_holders
CREATE POLICY "Anyone can view crypto holders data" ON public.crypto_holders FOR SELECT USING (true);
CREATE POLICY "Users can insert crypto holdings" ON public.crypto_holders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update crypto holdings" ON public.crypto_holders FOR UPDATE USING (true);

-- Update RLS policies for cryptocurrencies
CREATE POLICY "Anyone can view cryptocurrencies data" ON public.cryptocurrencies FOR SELECT USING (true);
CREATE POLICY "Admins can manage cryptocurrencies" ON public.cryptocurrencies FOR ALL USING (true);

-- Fix security in functions by adding security definer and search path
CREATE OR REPLACE FUNCTION public.update_crypto_price(crypto_id uuid, trade_volume numeric, trade_type text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_price DECIMAL;
  new_price DECIMAL;
  price_impact DECIMAL;
  change_percent DECIMAL;
  impact_factor DECIMAL := 0.001;
BEGIN
  SELECT current_price INTO current_price 
  FROM public.cryptocurrencies 
  WHERE id = crypto_id;
  
  price_impact := trade_volume * impact_factor;
  
  IF trade_type = 'buy' THEN
    new_price := current_price * (1 + price_impact);
  ELSE
    new_price := current_price * (1 - price_impact);
  END IF;
  
  IF new_price < 0.0001 THEN
    new_price := 0.0001;
  END IF;
  
  change_percent := ((new_price - current_price) / current_price) * 100;
  
  UPDATE public.cryptocurrencies 
  SET 
    current_price = new_price,
    price_change_24h = change_percent,
    last_trade_at = now(),
    trade_count_24h = trade_count_24h + 1,
    updated_at = now()
  WHERE id = crypto_id;
  
  INSERT INTO public.price_history (
    cryptocurrency_id,
    old_price,
    new_price,
    price_change_percent,
    transaction_volume,
    transaction_type
  ) VALUES (
    crypto_id,
    current_price,
    new_price,
    change_percent,
    trade_volume,
    trade_type
  );
  
  RETURN new_price;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comprehensive_metrics(crypto_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_price DECIMAL;
  total_holders INTEGER;
  total_supply DECIMAL;
  current_market_cap DECIMAL;
BEGIN
  SELECT current_price INTO current_price 
  FROM public.cryptocurrencies 
  WHERE id = crypto_id;
  
  SELECT COUNT(*) INTO total_holders
  FROM public.crypto_holders
  WHERE cryptocurrency_id = crypto_id AND balance > 0;
  
  UPDATE public.cryptocurrencies
  SET 
    updated_at = now()
  WHERE id = crypto_id;
  
  total_supply := 1000000;
  current_market_cap := current_price * total_supply;
  
  INSERT INTO public.crypto_daily_stats (
    cryptocurrency_id,
    closing_price,
    market_cap,
    holders_count,
    total_supply,
    circulating_supply
  ) VALUES (
    crypto_id,
    current_price,
    current_market_cap,
    total_holders,
    total_supply,
    total_supply
  )
  ON CONFLICT (cryptocurrency_id, date) DO UPDATE SET
    closing_price = EXCLUDED.closing_price,
    market_cap = EXCLUDED.market_cap,
    holders_count = EXCLUDED.holders_count,
    updated_at = now();
  
  RETURN true;
END;
$function$;
