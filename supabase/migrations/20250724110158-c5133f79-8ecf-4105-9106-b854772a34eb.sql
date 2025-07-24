-- Create function to award referrer on server purchase
CREATE OR REPLACE FUNCTION public.award_referrer_on_server_purchase()
RETURNS TRIGGER AS $$
DECLARE
  referrer_record RECORD;
  reward_amount NUMERIC;
BEGIN
  -- Calculate 7% reward
  reward_amount := NEW.purchase_price * 0.07;
  
  -- Find referrer for this user
  SELECT * INTO referrer_record
  FROM referrals 
  WHERE referred_user_id = NEW.user_id 
  LIMIT 1;
  
  -- If referrer exists, award them
  IF referrer_record.referrer_user_id IS NOT NULL THEN
    -- Award referrer with TON
    PERFORM update_user_wallet_balance(
      referrer_record.referrer_user_id, 
      'TON', 
      reward_amount, 
      'add'
    );
    
    -- Log the reward in referrals table
    INSERT INTO referrals (
      referrer_user_id, 
      referred_user_id, 
      reward_amount, 
      is_claimed
    ) VALUES (
      referrer_record.referrer_user_id, 
      NEW.user_id, 
      reward_amount, 
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for server purchases
CREATE TRIGGER trigger_award_referrer_on_server_purchase
  AFTER INSERT ON user_servers
  FOR EACH ROW
  EXECUTE FUNCTION award_referrer_on_server_purchase();