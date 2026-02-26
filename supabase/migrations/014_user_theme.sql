-- Add theme preference column to user_defaults
ALTER TABLE user_defaults ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system'
  CHECK (theme IN ('light', 'dark', 'system'));
