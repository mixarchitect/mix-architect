-- ── Migration 018: Portal Notification Preferences ─────────────────
-- Adds client email collection and per-release notification toggles.

ALTER TABLE brief_shares
  ADD COLUMN IF NOT EXISTS client_notification_email text,
  ADD COLUMN IF NOT EXISTS notify_on_new_version boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_on_approval boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_on_changes boolean NOT NULL DEFAULT true;
