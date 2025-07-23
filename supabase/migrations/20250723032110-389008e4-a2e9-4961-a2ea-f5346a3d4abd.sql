-- Add is_free column to giveaways table for free events
ALTER TABLE public.giveaways ADD COLUMN is_free BOOLEAN DEFAULT false;

-- Add index for better performance when filtering free events
CREATE INDEX idx_giveaways_is_free ON public.giveaways(is_free);

-- Insert free event giveaways with the specified prizes
INSERT INTO public.giveaways (
  title, description, prize_image_url, prize_value_ton, entry_fee_ton, 
  start_time, end_time, max_participants, current_participants, 
  is_active, is_finished, total_pool_ton, is_free
) VALUES 
  (
    'Free Snow Mittens Event',
    'Join for free and win rare snow mittens!',
    'https://assets.pepecase.app/assets/snow_mittens_dark_grape.png',
    2.0,
    0.0,
    now(),
    now() + INTERVAL '4 hours',
    500,
    0,
    true,
    false,
    0,
    true
  ),
  (
    'Free Lunar Snake Giveaway',
    'Win a mystical lunar snake for free!',
    'https://assets.pepecase.app/assets/lunar_snake_neurotoxin.png',
    3.5,
    0.0,
    now() + INTERVAL '30 minutes',
    now() + INTERVAL '4 hours 30 minutes',
    500,
    0,
    true,
    false,
    0,
    true
  ),
  (
    'Free Tsunami Pop Event',
    'Get your free tsunami lollipop!',
    'https://assets.pepecase.app/assets/lol_pop_tsunami.png',
    1.5,
    0.0,
    now() + INTERVAL '1 hour',
    now() + INTERVAL '5 hours',
    500,
    0,
    true,
    false,
    0,
    true
  ),
  (
    'Free Snake Box Surprise',
    'Open the buttercup snake box for free!',
    'https://assets.pepecase.app/assets/snake_box_buttercup.png',
    2.5,
    0.0,
    now() + INTERVAL '1 hour 30 minutes',
    now() + INTERVAL '5 hours 30 minutes',
    500,
    0,
    true,
    false,
    0,
    true
  ),
  (
    'Free Rare Calendar Event',
    'Win a rare desk calendar for free!',
    'https://assets.pepecase.app/assets/desk_calendar_rare_event.png',
    4.0,
    0.0,
    now() + INTERVAL '2 hours',
    now() + INTERVAL '6 hours',
    500,
    0,
    true,
    false,
    0,
    true
  );