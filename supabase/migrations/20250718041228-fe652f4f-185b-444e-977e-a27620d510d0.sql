-- Drop the existing check constraint and create a new one that allows 'social'
ALTER TABLE public.missions 
DROP CONSTRAINT IF EXISTS missions_mission_type_check;

-- Add new check constraint that includes 'social' as valid mission type
ALTER TABLE public.missions 
ADD CONSTRAINT missions_mission_type_check 
CHECK (mission_type IN ('daily', 'weekly', 'special', 'social', 'referral', 'trading'));