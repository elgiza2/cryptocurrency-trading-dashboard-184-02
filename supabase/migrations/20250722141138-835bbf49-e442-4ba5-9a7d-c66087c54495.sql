
-- إنشاء جدول المستخدمين (users)
CREATE TABLE public.users (
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

-- إنشاء جدول العملات المشفرة (cryptocurrencies)
CREATE TABLE public.cryptocurrencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon_url TEXT,
  current_price DECIMAL(20, 8) DEFAULT 0,
  market_cap DECIMAL(20, 2) DEFAULT 0,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  price_change_24h DECIMAL(10, 4) DEFAULT 0,
  website_url TEXT,
  telegram_url TEXT,
  twitter_url TEXT,
  description TEXT,
  last_trade_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trade_count_24h INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المهام (missions)
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount DECIMAL(20, 8) NOT NULL,
  reward_cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('main', 'social', 'daily', 'partners', 'referral')),
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول إنجازات المستخدمين (user_missions)
CREATE TABLE public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, mission_id)
);

-- إنشاء جدول جلسات التعدين (mining_sessions)
CREATE TABLE public.mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_hours INTEGER DEFAULT 8,
  reward_amount DECIMAL(20, 8) DEFAULT 125.5,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول محافظ المستخدمين (wallet_holdings)
CREATE TABLE public.wallet_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cryptocurrency_id)
);

-- إنشاء جدول المعاملات (transactions)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'receive', 'send', 'mining')),
  amount DECIMAL(20, 8) NOT NULL,
  price_usd DECIMAL(20, 8),
  total_usd DECIMAL(20, 2),
  ton_tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول السيرفرات (servers)
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_ton DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER NOT NULL DEFAULT 1,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول مشتريات السيرفرات (user_servers)
CREATE TABLE public.user_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول NFTs
CREATE TABLE public.nft_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  total_supply INTEGER DEFAULT 2000,
  remaining_supply INTEGER DEFAULT 2000,
  base_price DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER DEFAULT 1,
  rarity TEXT DEFAULT 'Common',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول مشتريات NFTs (user_nfts)
CREATE TABLE public.user_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  nft_id UUID NOT NULL REFERENCES public.nft_collections(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER DEFAULT 1,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول التفاعلات (crypto_reactions)
CREATE TABLE public.crypto_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'fire', 'broken_heart')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(cryptocurrency_id, user_id, reaction_type)
);

-- إنشاء جدول الإحالات (referrals)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  reward_amount DECIMAL(20, 8) DEFAULT 10.0,
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);

-- تفعيل Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Anyone can view cryptocurrencies" ON public.cryptocurrencies FOR SELECT USING (true);
CREATE POLICY "Anyone can view missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Anyone can view servers" ON public.servers FOR SELECT USING (true);
CREATE POLICY "Anyone can view nft collections" ON public.nft_collections FOR SELECT USING (true);

CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Users can manage their missions" ON public.user_missions FOR ALL USING (true);
CREATE POLICY "Users can manage their mining sessions" ON public.mining_sessions FOR ALL USING (true);
CREATE POLICY "Users can manage their wallet holdings" ON public.wallet_holdings FOR ALL USING (true);
CREATE POLICY "Users can manage their transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Users can manage their servers" ON public.user_servers FOR ALL USING (true);
CREATE POLICY "Users can manage their nfts" ON public.user_nfts FOR ALL USING (true);
CREATE POLICY "Users can manage their reactions" ON public.crypto_reactions FOR ALL USING (true);
CREATE POLICY "Users can manage their referrals" ON public.referrals FOR ALL USING (true);

-- إنشاء دالة لتحديث الطوابع الزمنية
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Triggers لتحديث الطوابع الزمنية
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cryptocurrencies_updated_at BEFORE UPDATE ON public.cryptocurrencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mining_sessions_updated_at BEFORE UPDATE ON public.mining_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_holdings_updated_at BEFORE UPDATE ON public.wallet_holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON public.servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_servers_updated_at BEFORE UPDATE ON public.user_servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nft_collections_updated_at BEFORE UPDATE ON public.nft_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nfts_updated_at BEFORE UPDATE ON public.user_nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crypto_reactions_updated_at BEFORE UPDATE ON public.crypto_reactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج العملات الأساسية
INSERT INTO public.cryptocurrencies (symbol, name, icon_url, current_price, description) VALUES
('SI', 'Space Intelligence', '/lovable-uploads/423dd26f-18d1-462e-9fab-0718d6fecf00.png', 0.001, 'عملة Space Intelligence الأساسية للمنصة'),
('SPACE', 'Space Token', '/lovable-uploads/469e6296-ebaa-4229-a23d-d6e41c1c0345.png', 0.01, 'عملة الفضاء للتداول'),
('TON', 'Toncoin', '/lovable-uploads/db42812c-cae3-45eb-982f-f8b254ddf974.png', 5.2, 'العملة الرسمية لشبكة TON'),
('USDT', 'Tether', '/lovable-uploads/83ad8729-3d02-4f45-949f-41bd6846b23b.png', 1.0, 'عملة مستقرة مربوطة بالدولار'),
('VIREON', 'Vireon Token', '/lovable-uploads/423dd26f-18d1-462e-9fab-0718d6fecf00.png', 0.5, 'عملة Vireon للتعدين والتداول');

-- إدراج المهام الأساسية
INSERT INTO public.missions (title, description, reward_amount, reward_cryptocurrency_id, mission_type, url) VALUES
('انضم لقناة تليجرام', 'انضم لقناتنا الرسمية على تليجرام', 100, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'SI'), 'social', 'https://t.me/spaceintelligence'),
('تابعنا على تويتر', 'تابع حسابنا الرسمي على تويتر', 75, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'SI'), 'social', 'https://twitter.com/spaceintel'),
('تسجيل الدخول اليومي', 'سجل دخولك يومياً لتحصل على مكافآت', 50, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'SI'), 'daily', null),
('أول عملية تداول', 'قم بأول عملية تداول لك', 200, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'SI'), 'main', null),
('ادع صديق', 'ادع صديق للانضمام للمنصة', 150, (SELECT id FROM public.cryptocurrencies WHERE symbol = 'SI'), 'referral', null);

-- إدراج السيرفرات الأساسية
INSERT INTO public.servers (name, description, price_ton, mining_power, duration_hours, icon_url) VALUES
('سيرفر Bronze', 'سيرفر أساسي للتعدين', 1.0, 1, 24, '/lovable-uploads/c2cf09ca-6d44-4fe6-8a3f-61301ba2403f.png'),
('سيرفر Silver', 'سيرفر متوسط بقوة تعدين معززة', 5.0, 5, 48, '/lovable-uploads/4fe8b0ab-e55b-48e1-ab0c-83a72b71b5dc.png'),
('سيرفر Gold', 'سيرفر قوي للتعدين المتقدم', 10.0, 10, 72, '/lovable-uploads/79761367-4a78-4080-afd6-59d892368c80.png'),
('سيرفر Platinum', 'سيرفر فائق القوة', 25.0, 25, 168, '/lovable-uploads/675e42e0-d859-41c4-98b5-17ea7acaf102.png');

-- إدراج مجموعات NFT
INSERT INTO public.nft_collections (name, description, base_price, mining_power, rarity, image_url) VALUES
('Steel Warrior', 'محارب الصلب الأساسي', 1.0, 1, 'Common', '/lovable-uploads/c2cf09ca-6d44-4fe6-8a3f-61301ba2403f.png'),
('Crystal Mage', 'ساحر الكريستال', 5.0, 5, 'Uncommon', '/lovable-uploads/4fe8b0ab-e55b-48e1-ab0c-83a72b71b5dc.png'),
('Golden Knight', 'الفارس الذهبي', 10.0, 10, 'Rare', '/lovable-uploads/79761367-4a78-4080-afd6-59d892368c80.png'),
('Cyber Guardian', 'الحارس السيبراني', 25.0, 25, 'Epic', '/lovable-uploads/675e42e0-d859-41c4-98b5-17ea7acaf102.png'),
('Epic Titan', 'تيتان الأساطير', 50.0, 50, 'Epic', '/lovable-uploads/637bf18e-3340-4bc8-84f4-7c197738c2a2.png'),
('Diamond Legend', 'أسطورة الماس', 100.0, 100, 'Legendary', '/lovable-uploads/eff8b802-752d-4b3d-8fa9-d49dd57c4f6e.png');

-- تفعيل Realtime للجداول المهمة
ALTER TABLE public.cryptocurrencies REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.mining_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.user_missions REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_holdings REPLICA IDENTITY FULL;
