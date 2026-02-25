-- ── Migration 008: Master Split Fields + Saved Contact Expansion ───
-- Adds SoundExchange ID and Label Name per person on master splits,
-- and extends saved_contacts to store those fields too.

-- track_splits: master recording fields per person
ALTER TABLE track_splits ADD COLUMN IF NOT EXISTS sound_exchange_id text;
ALTER TABLE track_splits ADD COLUMN IF NOT EXISTS label_name text;

-- saved_contacts: match so contacts preserve these fields
ALTER TABLE saved_contacts ADD COLUMN IF NOT EXISTS sound_exchange_id text;
ALTER TABLE saved_contacts ADD COLUMN IF NOT EXISTS label_name text;
