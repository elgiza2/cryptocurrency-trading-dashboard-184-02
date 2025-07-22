-- إصلاح مشاكل الأمان من خلال إضافة search_path للدوال
CREATE OR REPLACE FUNCTION update_giveaway_participant_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

CREATE OR REPLACE FUNCTION finish_expired_giveaways()
RETURNS void 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.giveaways 
  SET is_finished = true, is_active = false
  WHERE end_time < now() AND is_finished = false;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;