-- Add feature_visibility JSONB to user_defaults for per-feature UI toggling
ALTER TABLE user_defaults
  ADD COLUMN IF NOT EXISTS feature_visibility JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Backfill existing users: engineer defaults (everything visible) so nothing changes
-- for current users. They can customize later in Settings.
UPDATE user_defaults
SET feature_visibility = '{
  "payment_tracking": true,
  "client_portal": true,
  "invoicing": true,
  "download_gating": true,
  "proposal_system": true,
  "expense_tracking": true,
  "time_tracking": true,
  "revision_limits": true,
  "release_planning": true,
  "mix_brief": true,
  "audio_review": true,
  "technical_specs": true,
  "delivery_formats": true,
  "audio_conversion": true,
  "distribution_checklist": true,
  "album_flow": true,
  "templates": true,
  "timeline_view": true
}'::jsonb
WHERE feature_visibility = '{}'::jsonb;
