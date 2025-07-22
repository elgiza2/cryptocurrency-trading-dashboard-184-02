-- Add the new planet server to the servers table
INSERT INTO public.servers (
  name,
  description,
  price_ton,
  mining_power,
  duration_hours,
  icon_url,
  is_active
) VALUES (
  'Space Planet Server',
  'A powerful server with cosmic mining capabilities from the depths of space',
  0.5,
  2,
  24,
  '/lovable-uploads/67b25be1-1ec9-4745-9a59-eadf3659b6fb.png',
  true
);