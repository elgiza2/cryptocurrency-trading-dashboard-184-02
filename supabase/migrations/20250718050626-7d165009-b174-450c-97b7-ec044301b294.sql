-- Drop existing RLS policies that depend on user_id column type
DROP POLICY IF EXISTS "Users can view their own wallet holdings" ON public.wallet_holdings;
DROP POLICY IF EXISTS "Users can insert their own wallet holdings" ON public.wallet_holdings;
DROP POLICY IF EXISTS "Users can update their own wallet holdings" ON public.wallet_holdings;

DROP POLICY IF EXISTS "Users can view their own holdings" ON public.crypto_holders;
DROP POLICY IF EXISTS "Anyone can view crypto holders" ON public.crypto_holders;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.detailed_transactions;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own mining sessions" ON public.mining_sessions;
DROP POLICY IF EXISTS "Users can create their own mining sessions" ON public.mining_sessions;
DROP POLICY IF EXISTS "Users can update their own mining sessions" ON public.mining_sessions;

DROP POLICY IF EXISTS "Users can view their own missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can insert their own missions" ON public.user_missions;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.user_missions;