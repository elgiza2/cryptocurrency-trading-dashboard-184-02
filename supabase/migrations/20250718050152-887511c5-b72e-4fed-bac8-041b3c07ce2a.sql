-- Add social media and website fields to cryptocurrencies table
ALTER TABLE public.cryptocurrencies 
ADD COLUMN website_url text,
ADD COLUMN telegram_url text,
ADD COLUMN twitter_url text,
ADD COLUMN description text;