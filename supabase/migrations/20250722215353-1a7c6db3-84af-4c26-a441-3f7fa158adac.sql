-- Add the new planet NFT to the collections
INSERT INTO public.nft_collections (
  name,
  description,
  base_price,
  image_url,
  rarity,
  total_supply,
  remaining_supply,
  mining_power,
  is_active
) VALUES (
  'Space Planet',
  'A mysterious planet from the depths of space with unique orbital patterns',
  0.5,
  '/lovable-uploads/aea36c27-4e5d-44ad-90f2-0b69486f0d63.png',
  'Rare',
  1000,
  1000,
  2,
  true
);