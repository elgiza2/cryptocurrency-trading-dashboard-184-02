-- Drop all foreign key constraints first
ALTER TABLE public.wallet_holdings DROP CONSTRAINT IF EXISTS wallet_holdings_user_id_fkey;
ALTER TABLE public.crypto_holders DROP CONSTRAINT IF EXISTS crypto_holders_user_id_fkey;
ALTER TABLE public.detailed_transactions DROP CONSTRAINT IF EXISTS detailed_transactions_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.mining_sessions DROP CONSTRAINT IF EXISTS mining_sessions_user_id_fkey;
ALTER TABLE public.user_missions DROP CONSTRAINT IF EXISTS user_missions_user_id_fkey;

-- Now change column types
ALTER TABLE public.wallet_holdings ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.crypto_holders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.detailed_transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.mining_sessions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.user_missions ALTER COLUMN user_id TYPE TEXT;