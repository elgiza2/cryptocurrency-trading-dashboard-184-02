
-- تحديث سعر VIREON ليصبح 0.5 TON بدلاً من السعر الحالي
UPDATE public.cryptocurrencies 
SET 
  current_price = 0.5,
  price_change_24h = 0,
  updated_at = now()
WHERE symbol = 'VIREON';
