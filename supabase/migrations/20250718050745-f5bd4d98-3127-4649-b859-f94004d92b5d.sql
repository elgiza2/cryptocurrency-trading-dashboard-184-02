-- Now create the users table and update column types
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  language_code TEXT DEFAULT 'en',
  is_premium BOOLEAN DEFAULT false,
  total_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (telegram_id = current_setting('app.current_user_telegram_id', true));

CREATE POLICY "Users can insert their own data" 
ON public.users 
FOR INSERT 
WITH CHECK (telegram_id = current_setting('app.current_user_telegram_id', true));

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (telegram_id = current_setting('app.current_user_telegram_id', true));

-- Update existing tables to use TEXT for user_id
ALTER TABLE public.wallet_holdings ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.crypto_holders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.detailed_transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.mining_sessions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.user_missions ALTER COLUMN user_id TYPE TEXT;