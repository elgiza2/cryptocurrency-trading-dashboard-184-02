
-- Create table for cryptocurrency reactions
CREATE TABLE public.crypto_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'fire', 'broken_heart')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cryptocurrency_id, user_id, reaction_type)
);

-- Add Row Level Security
ALTER TABLE public.crypto_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view crypto reactions" 
  ON public.crypto_reactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reactions" 
  ON public.crypto_reactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own reactions" 
  ON public.crypto_reactions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete their own reactions" 
  ON public.crypto_reactions 
  FOR DELETE 
  USING (true);

-- Create function to get reaction counts for a cryptocurrency
CREATE OR REPLACE FUNCTION get_crypto_reaction_counts(crypto_id UUID)
RETURNS TABLE(
  love_count BIGINT,
  fire_count BIGINT,
  broken_heart_count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0) as love_count,
    COALESCE(SUM(CASE WHEN reaction_type = 'fire' THEN 1 ELSE 0 END), 0) as fire_count,
    COALESCE(SUM(CASE WHEN reaction_type = 'broken_heart' THEN 1 ELSE 0 END), 0) as broken_heart_count
  FROM public.crypto_reactions 
  WHERE cryptocurrency_id = crypto_id;
$$;

-- Create function to toggle user reaction
CREATE OR REPLACE FUNCTION toggle_crypto_reaction(
  crypto_id UUID,
  user_identifier TEXT,
  reaction TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_reaction_id UUID;
BEGIN
  -- Check if reaction already exists
  SELECT id INTO existing_reaction_id
  FROM public.crypto_reactions
  WHERE cryptocurrency_id = crypto_id 
    AND user_id = user_identifier
    AND reaction_type = reaction;
  
  IF existing_reaction_id IS NOT NULL THEN
    -- Remove existing reaction
    DELETE FROM public.crypto_reactions WHERE id = existing_reaction_id;
    RETURN FALSE; -- Reaction removed
  ELSE
    -- Add new reaction
    INSERT INTO public.crypto_reactions (cryptocurrency_id, user_id, reaction_type)
    VALUES (crypto_id, user_identifier, reaction);
    RETURN TRUE; -- Reaction added
  END IF;
END;
$$;

-- Enable realtime for crypto_reactions table
ALTER TABLE public.crypto_reactions REPLICA IDENTITY FULL;
