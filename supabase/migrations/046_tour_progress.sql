-- Add tour_progress JSONB column for multi-page onboarding tour state
ALTER TABLE user_defaults
  ADD COLUMN IF NOT EXISTS tour_progress JSONB DEFAULT NULL;
