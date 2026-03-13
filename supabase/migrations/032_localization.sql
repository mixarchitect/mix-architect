-- Add locale, default currency, onboarding, and persona to user_defaults
ALTER TABLE user_defaults
  ADD COLUMN locale text NOT NULL DEFAULT 'en-US',
  ADD COLUMN default_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN persona text DEFAULT 'artist'
    CHECK (persona IN ('artist', 'engineer', 'both', 'other')),
  ADD COLUMN payments_manually_set boolean NOT NULL DEFAULT false;

ALTER TABLE user_defaults
  ADD CONSTRAINT valid_default_currency CHECK (
    default_currency IN ('USD', 'GBP', 'CAD', 'AUD', 'EUR', 'BRL', 'JPY', 'KRW', 'CNY')
  );

-- Backfill existing users to skip onboarding
UPDATE user_defaults SET onboarding_completed = true WHERE onboarding_completed = false;

-- Expand releases fee_currency constraint to include new currencies
-- NOTE: Run these manually after confirming the existing constraint name:
--   SELECT conname FROM pg_constraint WHERE conrelid = 'releases'::regclass AND conname LIKE '%currency%';
--   ALTER TABLE releases DROP CONSTRAINT <existing_constraint_name>;
--   ALTER TABLE releases ADD CONSTRAINT valid_fee_currency CHECK (
--     fee_currency IN ('USD', 'GBP', 'CAD', 'AUD', 'EUR', 'BRL', 'JPY', 'KRW', 'CNY')
--   );
