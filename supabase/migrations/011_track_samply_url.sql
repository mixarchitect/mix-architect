-- Add Samply URL field to tracks (replaces Elements tab)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS samply_url text;
