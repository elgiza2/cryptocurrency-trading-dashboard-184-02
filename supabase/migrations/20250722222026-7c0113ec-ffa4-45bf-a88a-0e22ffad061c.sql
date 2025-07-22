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
  '/lovable-uploads/e894da01-ea0a-4c6f-b0bd-61f272c84357.png',
  true
);