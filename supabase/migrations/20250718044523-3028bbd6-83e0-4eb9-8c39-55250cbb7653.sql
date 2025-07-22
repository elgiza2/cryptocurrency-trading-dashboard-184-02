
-- جدول لتتبع المالكين (HOLDERS) لكل عملة
CREATE TABLE public.crypto_holders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
  first_purchase_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_invested_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cryptocurrency_id, user_id)
);

-- جدول لتتبع إحصائيات العملة بشكل يومي
CREATE TABLE public.crypto_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  closing_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  highest_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  lowest_price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  volume_24h DECIMAL(20, 8) NOT NULL DEFAULT 0,
  volume_usd_24h DECIMAL(20, 2) NOT NULL DEFAULT 0,
  market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_supply DECIMAL(20, 8) NOT NULL DEFAULT 0,
  circulating_supply DECIMAL(20, 8) NOT NULL DEFAULT 0,
  holders_count INTEGER NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  buy_transactions_count INTEGER NOT NULL DEFAULT 0,
  sell_transactions_count INTEGER NOT NULL DEFAULT 0,
  price_change_percent DECIMAL(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cryptocurrency_id, date)
);

-- جدول لتتبع أحجام التداول بالتفصيل
CREATE TABLE public.trading_volumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  hour_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  buy_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
  sell_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
  buy_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  sell_volume_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  net_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,
  unique_traders INTEGER NOT NULL DEFAULT 0,
  average_transaction_size DECIMAL(20, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cryptocurrency_id, hour_timestamp)
);

-- جدول لتتبع معاملات التداول المفصلة
CREATE TABLE public.detailed_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'transfer', 'mint', 'burn')),
  amount DECIMAL(20, 8) NOT NULL,
  price_per_token DECIMAL(20, 8) NOT NULL,
  total_value_usd DECIMAL(20, 2) NOT NULL,
  fee_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  fee_usd DECIMAL(20, 2) NOT NULL DEFAULT 0,
  ton_tx_hash TEXT,
  wallet_address TEXT,
  gas_used DECIMAL(20, 8) DEFAULT 0,
  block_number BIGINT,
  transaction_index INTEGER,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- جدول لتتبع القيمة السوقية والمقاييس المالية
CREATE TABLE public.market_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
  fully_diluted_market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
  total_value_locked DECIMAL(20, 2) NOT NULL DEFAULT 0,
  price_to_earnings_ratio DECIMAL(10, 4) DEFAULT 0,
  volume_to_market_cap_ratio DECIMAL(10, 6) DEFAULT 0,
  return_on_investment_24h DECIMAL(10, 4) DEFAULT 0,
  return_on_investment_7d DECIMAL(10, 4) DEFAULT 0,
  return_on_investment_30d DECIMAL(10, 4) DEFAULT 0,
  volatility_index DECIMAL(10, 4) DEFAULT 0,
  liquidity_score DECIMAL(10, 4) DEFAULT 0,
  social_sentiment_score DECIMAL(5, 2) DEFAULT 0,
  developer_activity_score INTEGER DEFAULT 0,
  community_score INTEGER DEFAULT 0
);

-- جدول لتتبع توزيع الملكية
CREATE TABLE public.ownership_distribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  whale_holders_count INTEGER NOT NULL DEFAULT 0, -- أكثر من 1% من العرض
  large_holders_count INTEGER NOT NULL DEFAULT 0, -- 0.1% - 1%
  medium_holders_count INTEGER NOT NULL DEFAULT 0, -- 0.01% - 0.1%
  small_holders_count INTEGER NOT NULL DEFAULT 0, -- أقل من 0.01%
  whale_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_10_holders_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_100_holders_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  gini_coefficient DECIMAL(5, 4) DEFAULT 0, -- مؤشر عدم المساواة
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cryptocurrency_id, date)
);

-- فهارس للأداء
CREATE INDEX idx_crypto_holders_crypto_id ON public.crypto_holders(cryptocurrency_id);
CREATE INDEX idx_crypto_holders_user_id ON public.crypto_holders(user_id);
CREATE INDEX idx_crypto_daily_stats_crypto_date ON public.crypto_daily_stats(cryptocurrency_id, date);
CREATE INDEX idx_trading_volumes_crypto_hour ON public.trading_volumes(cryptocurrency_id, hour_timestamp);
CREATE INDEX idx_detailed_transactions_crypto_id ON public.detailed_transactions(cryptocurrency_id);
CREATE INDEX idx_detailed_transactions_user_id ON public.detailed_transactions(user_id);
CREATE INDEX idx_detailed_transactions_created_at ON public.detailed_transactions(created_at DESC);
CREATE INDEX idx_market_metrics_crypto_timestamp ON public.market_metrics(cryptocurrency_id, timestamp);
CREATE INDEX idx_ownership_distribution_crypto_date ON public.ownership_distribution(cryptocurrency_id, date);

-- تفعيل Real-time للجداول الجديدة
ALTER TABLE public.crypto_holders REPLICA IDENTITY FULL;
ALTER TABLE public.crypto_daily_stats REPLICA IDENTITY FULL;
ALTER TABLE public.trading_volumes REPLICA IDENTITY FULL;
ALTER TABLE public.detailed_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.market_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.ownership_distribution REPLICA IDENTITY FULL;

-- إضافة الجداول لـ Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_holders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_daily_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_volumes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detailed_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ownership_distribution;

-- RLS policies للجداول الجديدة
ALTER TABLE public.crypto_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_distribution ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Anyone can view crypto holders" ON public.crypto_holders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their own holdings" ON public.crypto_holders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view daily stats" ON public.crypto_daily_stats
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view trading volumes" ON public.trading_volumes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their own transactions" ON public.detailed_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view market metrics" ON public.market_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view ownership distribution" ON public.ownership_distribution
  FOR SELECT TO authenticated USING (true);

-- دالة لحساب وتحديث جميع المقاييس
CREATE OR REPLACE FUNCTION public.update_comprehensive_metrics(crypto_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_price DECIMAL;
  total_holders INTEGER;
  total_supply DECIMAL;
  current_market_cap DECIMAL;
BEGIN
  -- جلب البيانات الأساسية
  SELECT current_price INTO current_price 
  FROM public.cryptocurrencies 
  WHERE id = crypto_id;
  
  -- حساب إجمالي المالكين
  SELECT COUNT(*) INTO total_holders
  FROM public.crypto_holders
  WHERE cryptocurrency_id = crypto_id AND balance > 0;
  
  -- تحديث عدد المالكين في جدول العملات
  UPDATE public.cryptocurrencies
  SET 
    updated_at = now()
  WHERE id = crypto_id;
  
  -- حساب القيمة السوقية (افتراض إجمالي العرض = 1,000,000)
  total_supply := 1000000;
  current_market_cap := current_price * total_supply;
  
  -- تحديث المقاييس اليومية
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
$$ LANGUAGE plpgsql;
