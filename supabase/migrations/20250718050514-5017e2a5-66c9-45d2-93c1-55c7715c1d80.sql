-- Add authentication system tables
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

-- Users can view their own data
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (telegram_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'telegram_user_id'::text));

-- Users can insert their own data
CREATE POLICY "Users can insert their own data" 
ON public.users 
FOR INSERT 
WITH CHECK (telegram_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'telegram_user_id'::text));

-- Users can update their own data
CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (telegram_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'telegram_user_id'::text));

-- Update wallet_holdings to use telegram users
ALTER TABLE public.wallet_holdings 
DROP CONSTRAINT IF EXISTS wallet_holdings_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Update crypto_holders to use telegram users
ALTER TABLE public.crypto_holders 
DROP CONSTRAINT IF EXISTS crypto_holders_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Update detailed_transactions to use telegram users
ALTER TABLE public.detailed_transactions 
DROP CONSTRAINT IF EXISTS detailed_transactions_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Update transactions to use telegram users  
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Update mining_sessions to use telegram users
ALTER TABLE public.mining_sessions 
DROP CONSTRAINT IF EXISTS mining_sessions_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Update user_missions to use telegram users
ALTER TABLE public.user_missions 
DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey,
ALTER COLUMN user_id TYPE TEXT;

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();