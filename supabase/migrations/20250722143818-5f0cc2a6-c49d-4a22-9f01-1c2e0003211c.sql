-- إنشاء جدول المسابقات (giveaways)
CREATE TABLE public.giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prize_image_url TEXT NOT NULL,
  prize_value_ton DECIMAL(10, 4) NOT NULL,
  entry_fee_ton DECIMAL(10, 4) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 1000,
  current_participants INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_finished BOOLEAN DEFAULT false,
  winner_user_id TEXT,
  total_pool_ton DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المشاركين في المسابقات (giveaway_participants)
CREATE TABLE public.giveaway_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  entry_fee_paid DECIMAL(10, 4) NOT NULL,
  ton_tx_hash TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

-- تفعيل Row Level Security
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_participants ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Anyone can view giveaways" ON public.giveaways FOR SELECT USING (true);
CREATE POLICY "Users can manage their giveaway participation" ON public.giveaway_participants FOR ALL USING (true);

-- إنشاء Triggers لتحديث الطوابع الزمنية
CREATE TRIGGER update_giveaways_updated_at BEFORE UPDATE ON public.giveaways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لتحديث عدد المشاركين تلقائياً
CREATE OR REPLACE FUNCTION update_giveaway_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.giveaways 
    SET current_participants = current_participants + 1,
        total_pool_ton = total_pool_ton + NEW.entry_fee_paid
    WHERE id = NEW.giveaway_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.giveaways 
    SET current_participants = current_participants - 1,
        total_pool_ton = total_pool_ton - OLD.entry_fee_paid
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث عدد المشاركين
CREATE TRIGGER update_participant_count
AFTER INSERT OR DELETE ON public.giveaway_participants
FOR EACH ROW EXECUTE FUNCTION update_giveaway_participant_count();

-- دالة لإنهاء المسابقات التي انتهت
CREATE OR REPLACE FUNCTION finish_expired_giveaways()
RETURNS void AS $$
BEGIN
  UPDATE public.giveaways 
  SET is_finished = true, is_active = false
  WHERE end_time < now() AND is_finished = false;
END;
$$ LANGUAGE plpgsql;

-- تفعيل Realtime
ALTER TABLE public.giveaways REPLICA IDENTITY FULL;
ALTER TABLE public.giveaway_participants REPLICA IDENTITY FULL;