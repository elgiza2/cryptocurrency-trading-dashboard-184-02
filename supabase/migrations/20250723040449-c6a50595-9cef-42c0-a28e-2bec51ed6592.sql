
-- Create function to get user balance from wallet_holdings
CREATE OR REPLACE FUNCTION get_user_balance(user_telegram_id TEXT)
RETURNS TABLE(space_balance NUMERIC, ton_balance NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN c.symbol = 'SPACE' THEN wh.balance ELSE 0 END), 0) as space_balance,
    COALESCE(SUM(CASE WHEN c.symbol = 'TON' THEN wh.balance ELSE 0 END), 0) as ton_balance
  FROM wallet_holdings wh
  JOIN cryptocurrencies c ON wh.cryptocurrency_id = c.id
  WHERE wh.user_id = user_telegram_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user balance
CREATE OR REPLACE FUNCTION update_user_wallet_balance(
  user_telegram_id TEXT,
  currency_symbol TEXT,
  amount_change NUMERIC,
  operation_type TEXT -- 'add' or 'subtract'
) RETURNS BOOLEAN AS $$
DECLARE
  crypto_id UUID;
  current_balance NUMERIC;
  new_balance NUMERIC;
  holding_exists BOOLEAN;
BEGIN
  -- Get cryptocurrency ID
  SELECT id INTO crypto_id FROM cryptocurrencies WHERE symbol = currency_symbol;
  
  IF crypto_id IS NULL THEN
    RAISE EXCEPTION 'Currency % not found', currency_symbol;
  END IF;
  
  -- Check if holding exists
  SELECT EXISTS(
    SELECT 1 FROM wallet_holdings 
    WHERE user_id = user_telegram_id AND cryptocurrency_id = crypto_id
  ) INTO holding_exists;
  
  IF holding_exists THEN
    -- Get current balance
    SELECT balance INTO current_balance 
    FROM wallet_holdings 
    WHERE user_id = user_telegram_id AND cryptocurrency_id = crypto_id;
    
    -- Calculate new balance
    IF operation_type = 'add' THEN
      new_balance := current_balance + amount_change;
    ELSE
      new_balance := current_balance - amount_change;
    END IF;
    
    -- Prevent negative balance
    IF new_balance < 0 THEN
      RETURN FALSE;
    END IF;
    
    -- Update balance
    UPDATE wallet_holdings 
    SET balance = new_balance, updated_at = now()
    WHERE user_id = user_telegram_id AND cryptocurrency_id = crypto_id;
  ELSE
    -- Create new holding only if adding
    IF operation_type = 'add' THEN
      INSERT INTO wallet_holdings (user_id, cryptocurrency_id, balance)
      VALUES (user_telegram_id, crypto_id, amount_change);
    ELSE
      RETURN FALSE; -- Cannot subtract from non-existing balance
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to process currency exchange
CREATE OR REPLACE FUNCTION process_currency_exchange(
  user_telegram_id TEXT,
  from_currency TEXT,
  to_currency TEXT,
  from_amount NUMERIC,
  to_amount NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Start transaction
  BEGIN
    -- Subtract from source currency
    SELECT update_user_wallet_balance(user_telegram_id, from_currency, from_amount, 'subtract') INTO success;
    
    IF NOT success THEN
      RAISE EXCEPTION 'Insufficient balance in %', from_currency;
    END IF;
    
    -- Add to destination currency
    SELECT update_user_wallet_balance(user_telegram_id, to_currency, to_amount, 'add') INTO success;
    
    IF NOT success THEN
      RAISE EXCEPTION 'Failed to add % balance', to_currency;
    END IF;
    
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to initialize user balance
CREATE OR REPLACE FUNCTION initialize_user_balance(user_telegram_id TEXT)
RETURNS VOID AS $$
DECLARE
  space_crypto_id UUID;
  ton_crypto_id UUID;
BEGIN
  -- Get crypto IDs
  SELECT id INTO space_crypto_id FROM cryptocurrencies WHERE symbol = 'SPACE';
  SELECT id INTO ton_crypto_id FROM cryptocurrencies WHERE symbol = 'TON';
  
  -- Initialize SPACE balance (give new users some SPACE tokens)
  IF space_crypto_id IS NOT NULL THEN
    INSERT INTO wallet_holdings (user_id, cryptocurrency_id, balance)
    VALUES (user_telegram_id, space_crypto_id, 1000)
    ON CONFLICT (user_id, cryptocurrency_id) DO NOTHING;
  END IF;
  
  -- Initialize TON balance (start with 0)
  IF ton_crypto_id IS NOT NULL THEN
    INSERT INTO wallet_holdings (user_id, cryptocurrency_id, balance)
    VALUES (user_telegram_id, ton_crypto_id, 0)
    ON CONFLICT (user_id, cryptocurrency_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint to prevent duplicate holdings
ALTER TABLE wallet_holdings 
ADD CONSTRAINT unique_user_crypto 
UNIQUE (user_id, cryptocurrency_id);

-- Update giveaways table to add random participant counts
UPDATE giveaways SET 
  current_participants = FLOOR(RANDOM() * 201 + 200)::INTEGER
WHERE current_participants < 200;
