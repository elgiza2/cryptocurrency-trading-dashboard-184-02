-- Insert some sample missions for testing
INSERT INTO public.missions (title, description, mission_type, reward_amount, reward_cryptocurrency_id, url) VALUES
('Join Telegram Group', 'Join our official Telegram group to stay updated', 'social', 50, (SELECT id FROM public.cryptocurrencies LIMIT 1), 'https://t.me/Vlreon'),
('Follow Twitter', 'Follow our official Twitter account', 'social', 30, (SELECT id FROM public.cryptocurrencies LIMIT 1), 'https://twitter.com/vireon'),
('Daily Check-in', 'Check in daily to earn rewards', 'daily', 25, (SELECT id FROM public.cryptocurrencies LIMIT 1), null),
('Invite 5 Friends', 'Invite 5 friends to join the platform', 'main', 100, (SELECT id FROM public.cryptocurrencies LIMIT 1), null),
('Complete Profile', 'Complete your user profile', 'main', 75, (SELECT id FROM public.cryptocurrencies LIMIT 1), null)
ON CONFLICT DO NOTHING;