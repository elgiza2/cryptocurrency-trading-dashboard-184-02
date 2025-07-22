-- Update all servers to English names and descriptions
UPDATE public.servers SET 
  name = CASE 
    WHEN name LIKE '%Bronze%' OR name LIKE '%برونز%' THEN 'Bronze Server'
    WHEN name LIKE '%Silver%' OR name LIKE '%فضي%' THEN 'Silver Server'
    WHEN name LIKE '%Gold%' OR name LIKE '%ذهبي%' THEN 'Gold Server'
    WHEN name LIKE '%Platinum%' OR name LIKE '%بلاتيني%' THEN 'Platinum Server'
    WHEN name LIKE '%Diamond%' OR name LIKE '%الماس%' THEN 'Diamond Server'
    WHEN name LIKE '%VIP%' OR name LIKE '%في آي بي%' THEN 'VIP Server'
    ELSE name
  END,
  description = CASE 
    WHEN name LIKE '%Bronze%' OR name LIKE '%برونز%' THEN 'Basic mining server with standard capabilities'
    WHEN name LIKE '%Silver%' OR name LIKE '%فضي%' THEN 'Enhanced mining server with improved performance'
    WHEN name LIKE '%Gold%' OR name LIKE '%ذهبي%' THEN 'Premium mining server with high-speed processing'
    WHEN name LIKE '%Platinum%' OR name LIKE '%بلاتيني%' THEN 'Elite mining server with maximum efficiency'
    WHEN name LIKE '%Diamond%' OR name LIKE '%الماس%' THEN 'Ultimate mining server with top-tier performance'
    WHEN name LIKE '%VIP%' OR name LIKE '%في آي بي%' THEN 'Exclusive VIP mining server with premium features'
    ELSE description
  END;

-- Update all NFT collections to English names and descriptions
UPDATE public.nft_collections SET 
  name = CASE 
    WHEN name LIKE '%كوكب%' OR name LIKE '%Planet%' THEN 'Space Planet'
    WHEN name LIKE '%نجم%' OR name LIKE '%Star%' THEN 'Cosmic Star'
    WHEN name LIKE '%مجرة%' OR name LIKE '%Galaxy%' THEN 'Nebula Galaxy'
    WHEN name LIKE '%قمر%' OR name LIKE '%Moon%' THEN 'Lunar Moon'
    WHEN name LIKE '%شمس%' OR name LIKE '%Sun%' THEN 'Solar Sun'
    ELSE name
  END,
  description = CASE 
    WHEN name LIKE '%كوكب%' OR name LIKE '%Planet%' THEN 'A mysterious planet from the depths of space with unique orbital patterns'
    WHEN name LIKE '%نجم%' OR name LIKE '%Star%' THEN 'A brilliant star that shines across the cosmic void'
    WHEN name LIKE '%مجرة%' OR name LIKE '%Galaxy%' THEN 'A stunning galaxy with swirling nebulae and cosmic dust'
    WHEN name LIKE '%قمر%' OR name LIKE '%Moon%' THEN 'An ethereal moon with mystical properties and lunar energy'
    WHEN name LIKE '%شمس%' OR name LIKE '%Sun%' THEN 'A radiant sun that powers entire solar systems'
    ELSE description
  END;