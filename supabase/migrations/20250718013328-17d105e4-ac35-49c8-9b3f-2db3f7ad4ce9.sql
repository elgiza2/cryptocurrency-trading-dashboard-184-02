-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  ton_wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cryptocurrencies table
CREATE TABLE public.cryptocurrencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon_url TEXT,
  current_price DECIMAL(20, 8) DEFAULT 0,
  market_cap DECIMAL(20, 2) DEFAULT 0,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  price_change_24h DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet holdings table
CREATE TABLE public.wallet_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cryptocurrency_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'receive', 'send', 'mining')),
  amount DECIMAL(20, 8) NOT NULL,
  price_usd DECIMAL(20, 8),
  total_usd DECIMAL(20, 2),
  ton_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions/tasks table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount DECIMAL(20, 8) NOT NULL,
  reward_cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'special', 'referral')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user missions (completed missions) table
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, mission_id)
);

-- Create trading pairs table
CREATE TABLE public.trading_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  quote_currency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  current_price DECIMAL(20, 8) DEFAULT 0,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  price_change_24h DECIMAL(10, 4) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(base_currency_id, quote_currency_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wallet holdings
CREATE POLICY "Users can view their own wallet holdings" ON public.wallet_holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet holdings" ON public.wallet_holdings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet holdings" ON public.wallet_holdings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user missions
CREATE POLICY "Users can view their own missions" ON public.user_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" ON public.user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" ON public.user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for cryptocurrencies, missions, and trading pairs
CREATE POLICY "Anyone can view cryptocurrencies" ON public.cryptocurrencies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view missions" ON public.missions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view trading pairs" ON public.trading_pairs
  FOR SELECT TO authenticated USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cryptocurrencies_updated_at
  BEFORE UPDATE ON public.cryptocurrencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_holdings_updated_at
  BEFORE UPDATE ON public.wallet_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_pairs_updated_at
  BEFORE UPDATE ON public.trading_pairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial cryptocurrencies
INSERT INTO public.cryptocurrencies (symbol, name, icon_url, current_price) VALUES
('VIREON', 'Vireon Token', '/lovable-uploads/423dd26f-18d1-462e-9fab-0718d6fecf00.png', 0.15),
('TON', 'Toncoin', '/lovable-uploads/db42812c-cae3-45eb-982f-f8b254ddf974.png', 5.2),
('USDT', 'Tether', '/lovable-uploads/83ad8729-3d02-4f45-949f-41bd6846b23b.png', 1.0),
('BLUM', 'Blum', '/lovable-uploads/469e6296-ebaa-4229-a23d-d6e41c1c0345.png', 0.0);

-- Insert initial missions
INSERT INTO public.missions (title, description, reward_amount, reward_cryptocurrency_id, mission_type) VALUES
('Daily Login', 'Log in to your account daily', 10.0, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'VIREON'), 'daily'),
('Complete First Trade', 'Make your first cryptocurrency trade', 50.0, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'VIREON'), 'special'),
('Weekly Mining', 'Mine VIREON tokens for 7 consecutive days', 100.0, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'VIREON'), 'weekly'),
('Invite Friend', 'Invite a friend to join the platform', 25.0, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'VIREON'), 'referral');