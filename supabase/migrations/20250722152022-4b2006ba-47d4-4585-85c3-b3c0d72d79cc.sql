-- Update all giveaways to have 4-hour duration and English content with realistic TON values
UPDATE public.giveaways SET 
  title = CASE 
    WHEN id = '4528bde7-a929-45b1-a37b-ffeb8bae33a0' THEN 'Lucky Frog Giveaway'
    WHEN id = '5008c9db-a79c-42e2-a7d2-150f5f50193e' THEN 'Sacred Ring Prize'
    WHEN id = 'b2f91a72-0202-47e9-9dd9-6da9e9f5517c' THEN 'Grand Prize Contest'
    WHEN id = '9463434f-0b33-476e-b9ec-4d742f43783d' THEN 'Moon Sailor Bow Tie'
    WHEN id = 'ea7d1c07-5507-4cea-8c3f-5fc55e07018f' THEN 'Brass Genie Lamp'
    ELSE title
  END,
  description = CASE 
    WHEN id = '4528bde7-a929-45b1-a37b-ffeb8bae33a0' THEN 'Lucky frog that brings fortune'
    WHEN id = '5008c9db-a79c-42e2-a7d2-150f5f50193e' THEN 'Rare ring with special magical power'
    WHEN id = 'b2f91a72-0202-47e9-9dd9-6da9e9f5517c' THEN 'Win 15 TON in this special contest!'
    WHEN id = '9463434f-0b33-476e-b9ec-4d742f43783d' THEN 'Elegant and rare accessory'
    WHEN id = 'ea7d1c07-5507-4cea-8c3f-5fc55e07018f' THEN 'Legendary lamp that grants wishes'
    ELSE description
  END,
  end_time = start_time + INTERVAL '4 hours',
  prize_value_ton = CASE 
    WHEN id = '4528bde7-a929-45b1-a37b-ffeb8bae33a0' THEN 5.2
    WHEN id = '5008c9db-a79c-42e2-a7d2-150f5f50193e' THEN 3.8
    WHEN id = 'b2f91a72-0202-47e9-9dd9-6da9e9f5517c' THEN 15.0
    WHEN id = '9463434f-0b33-476e-b9ec-4d742f43783d' THEN 2.7
    WHEN id = 'ea7d1c07-5507-4cea-8c3f-5fc55e07018f' THEN 8.5
    ELSE prize_value_ton
  END,
  entry_fee_ton = CASE 
    WHEN id = '4528bde7-a929-45b1-a37b-ffeb8bae33a0' THEN 0.5
    WHEN id = '5008c9db-a79c-42e2-a7d2-150f5f50193e' THEN 0.2
    WHEN id = 'b2f91a72-0202-47e9-9dd9-6da9e9f5517c' THEN 0.8
    WHEN id = '9463434f-0b33-476e-b9ec-4d742f43783d' THEN 0.3
    WHEN id = 'ea7d1c07-5507-4cea-8c3f-5fc55e07018f' THEN 0.6
    ELSE entry_fee_ton
  END;