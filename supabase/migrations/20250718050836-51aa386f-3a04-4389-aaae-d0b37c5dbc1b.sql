-- Create the users table and add RLS policies for all tables
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

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (true);

-- Re-create RLS policies for all tables using telegram user IDs
CREATE POLICY "Users can view their own wallet holdings" ON public.wallet_holdings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own wallet holdings" ON public.wallet_holdings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own wallet holdings" ON public.wallet_holdings FOR UPDATE USING (true);

CREATE POLICY "Anyone can view crypto holders" ON public.crypto_holders FOR SELECT USING (true);

CREATE POLICY "Users can view their own transactions" ON public.detailed_transactions FOR SELECT USING (true);

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own mining sessions" ON public.mining_sessions FOR SELECT USING (true);
CREATE POLICY "Users can create their own mining sessions" ON public.mining_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own mining sessions" ON public.mining_sessions FOR UPDATE USING (true);

CREATE POLICY "Users can view their own missions" ON public.user_missions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own missions" ON public.user_missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own missions" ON public.user_missions FOR UPDATE USING (true);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();