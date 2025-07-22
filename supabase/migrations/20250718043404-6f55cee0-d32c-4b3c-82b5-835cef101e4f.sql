
-- إضافة جدول لتتبع تاريخ تغيرات الأسعار
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  old_price DECIMAL(20, 8) NOT NULL,
  new_price DECIMAL(20, 8) NOT NULL,
  price_change_percent DECIMAL(10, 4) NOT NULL DEFAULT 0,
  transaction_volume DECIMAL(20, 8) NOT NULL DEFAULT 0,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إضافة عمود market_activity للعملات لتتبع النشاط
ALTER TABLE public.cryptocurrencies 
ADD COLUMN IF NOT EXISTS last_trade_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS trade_count_24h INTEGER DEFAULT 0;

-- فهرسة للاستعلامات السريعة
CREATE INDEX idx_price_history_crypto_id ON public.price_history(cryptocurrency_id);
CREATE INDEX idx_price_history_created_at ON public.price_history(created_at DESC);

-- تفعيل Real-time للجداول
ALTER TABLE public.cryptocurrencies REPLICA IDENTITY FULL;
ALTER TABLE public.price_history REPLICA IDENTITY FULL;

-- إضافة الجداول لـ Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cryptocurrencies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_history;

-- دالة لحساب وتحديث السعر الجديد
CREATE OR REPLACE FUNCTION public.update_crypto_price(
  crypto_id UUID,
  trade_volume DECIMAL,
  trade_type TEXT
) RETURNS DECIMAL AS $$
DECLARE
  current_price DECIMAL;
  new_price DECIMAL;
  price_impact DECIMAL;
  change_percent DECIMAL;
  impact_factor DECIMAL := 0.001; -- معامل التأثير الأساسي
BEGIN
  -- جلب السعر الحالي
  SELECT current_price INTO current_price 
  FROM public.cryptocurrencies 
  WHERE id = crypto_id;
  
  -- حساب تأثير حجم المعاملة على السعر
  -- كلما زاد حجم المعاملة، زاد التأثير
  price_impact := trade_volume * impact_factor;
  
  -- تحديد اتجاه التغيير حسب نوع المعاملة
  IF trade_type = 'buy' THEN
    new_price := current_price * (1 + price_impact);
  ELSE
    new_price := current_price * (1 - price_impact);
  END IF;
  
  -- التأكد من أن السعر لا ينخفض تحت الصفر
  IF new_price < 0.0001 THEN
    new_price := 0.0001;
  END IF;
  
  -- حساب نسبة التغيير
  change_percent := ((new_price - current_price) / current_price) * 100;
  
  -- تحديث السعر في جدول العملات
  UPDATE public.cryptocurrencies 
  SET 
    current_price = new_price,
    price_change_24h = change_percent,
    last_trade_at = now(),
    trade_count_24h = trade_count_24h + 1,
    updated_at = now()
  WHERE id = crypto_id;
  
  -- حفظ تاريخ تغيير السعر
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
$$ LANGUAGE plpgsql;

-- RLS policies للجدول الجديد
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history" ON public.price_history
  FOR SELECT TO authenticated USING (true);
