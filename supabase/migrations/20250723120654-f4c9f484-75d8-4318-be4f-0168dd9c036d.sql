-- Update max_participants for existing giveaways to 10000
UPDATE giveaways SET max_participants = 10000;

-- Update default value for max_participants column
ALTER TABLE giveaways ALTER COLUMN max_participants SET DEFAULT 10000;