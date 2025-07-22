
-- Create user_nfts table
CREATE TABLE public.user_nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nft_id TEXT NOT NULL,
  purchase_price DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.user_nfts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_nfts
CREATE POLICY "Users can view their own NFTs" 
  ON public.user_nfts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own NFTs" 
  ON public.user_nfts 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to get user's total mining power
CREATE OR REPLACE FUNCTION get_user_mining_power(p_user_id TEXT)
RETURNS TABLE(total_mining_power INTEGER)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(mining_power), 1) as total_mining_power
  FROM public.user_nfts 
  WHERE user_id = p_user_id;
$$;

-- Create nft_collections table for future expansion
CREATE TABLE public.nft_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_supply INTEGER NOT NULL DEFAULT 2000,
  remaining_supply INTEGER NOT NULL DEFAULT 2000,
  base_price DECIMAL(10, 4) NOT NULL,
  mining_power INTEGER NOT NULL DEFAULT 1,
  rarity TEXT NOT NULL DEFAULT 'Common',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nft_collections
CREATE POLICY "Anyone can view active NFT collections" 
  ON public.nft_collections 
  FOR SELECT 
  USING (is_active = true);

-- Create function to decrement NFT remaining supply
CREATE OR REPLACE FUNCTION decrement_nft_remaining(nft_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.nft_collections 
  SET remaining_supply = remaining_supply - 1,
      updated_at = now()
  WHERE id = nft_id::UUID 
    AND remaining_supply > 0;
    
  RETURN FOUND;
END;
$$;

-- Insert initial NFT collections
INSERT INTO public.nft_collections (id, name, description, base_price, mining_power, rarity, image_url) VALUES
('nft-1', 'Bronze Miner', 'Basic mining character', 1.0, 1, 'Common', '/lovable-uploads/423dd26f-18d1-462e-9fab-0718d6fecf00.png'),
('nft-2', 'Silver Collector', 'Enhanced mining power', 5.0, 5, 'Uncommon', '/lovable-uploads/469e6296-ebaa-4229-a23d-d6e41c1c0345.png'),
('nft-3', 'Gold Prospector', 'Strong mining capabilities', 10.0, 10, 'Rare', '/lovable-uploads/512a8240-b5f7-4248-acb5-8c6170abc85c.png'),
('nft-4', 'Diamond Hunter', 'Premium mining power', 25.0, 25, 'Epic', '/lovable-uploads/83ad8729-3d02-4f45-949f-41bd6846b23b.png'),
('nft-5', 'Legendary Master', 'Elite mining champion', 50.0, 50, 'Legendary', '/lovable-uploads/db42812c-cae3-45eb-982f-f8b254ddf974.png'),
('nft-6', 'Mythic Emperor', 'Ultimate mining overlord', 100.0, 100, 'Mythic', '/lovable-uploads/e96b9558-8178-4857-b09a-f0701f4a8b08.png');

-- Enable realtime for tables
ALTER TABLE public.user_nfts REPLICA IDENTITY FULL;
ALTER TABLE public.nft_collections REPLICA IDENTITY FULL;
