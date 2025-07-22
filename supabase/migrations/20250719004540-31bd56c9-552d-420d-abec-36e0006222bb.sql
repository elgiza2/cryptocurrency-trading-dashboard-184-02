
-- Add database function to handle referral registration more reliably
CREATE OR REPLACE FUNCTION public.register_referral(
  p_referrer_identifier TEXT,
  p_referred_user_id TEXT,
  p_reward_amount NUMERIC DEFAULT 10.0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id TEXT;
BEGIN
  -- Try to find referrer by username first, then by user ID
  SELECT telegram_id INTO referrer_id
  FROM public.users
  WHERE telegram_username = p_referrer_identifier OR telegram_id = p_referrer_identifier
  LIMIT 1;
  
  -- If referrer not found, return false
  IF referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Prevent self-referral
  IF referrer_id = p_referred_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Insert referral record (ignore if already exists due to unique constraint)
  INSERT INTO public.referrals (
    referrer_user_id,
    referred_user_id,
    reward_amount,
    is_claimed
  ) VALUES (
    referrer_id,
    p_referred_user_id,
    p_reward_amount,
    true  -- Auto-claim rewards
  )
  ON CONFLICT (referrer_user_id, referred_user_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Add function to get referral stats for a user
CREATE OR REPLACE FUNCTION public.get_user_referral_stats(p_user_id TEXT)
RETURNS TABLE (
  total_referrals INTEGER,
  total_earned NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_referrals,
    COALESCE(SUM(reward_amount), 0) as total_earned
  FROM public.referrals
  WHERE referrer_user_id = p_user_id;
END;
$$;

-- Update RLS policies to be more permissive for referral operations
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
CREATE POLICY "Anyone can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view referral stats
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view referrals" 
ON public.referrals 
FOR SELECT 
USING (true);
