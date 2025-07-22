-- Add daily login check mission with 0.5 TON reward
INSERT INTO public.missions (title, description, mission_type, reward_amount, reward_cryptocurrency_id, url) 
VALUES (
  'التحقق من تسجيل الدخول اليومي', 
  'قم بتسجيل الدخول يومياً للحصول على مكافأة', 
  'daily', 
  0.5, 
  (SELECT id FROM public.cryptocurrencies WHERE symbol = 'TON' LIMIT 1), 
  null
)
ON CONFLICT DO NOTHING;