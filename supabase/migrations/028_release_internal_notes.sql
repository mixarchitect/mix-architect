-- Add internal_notes column for private engineer notes on releases
ALTER TABLE releases ADD COLUMN IF NOT EXISTS internal_notes text;
