-- ── Migration 036: Transactional Email System ────────────────────────
-- Email preferences (per-user opt-out) and email log for debugging.

-- ═══════════════════════════════════════════════════════════════════
-- 1. EMAIL_PREFERENCES TABLE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_preferences (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  unsubscribe_token        uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Per-category opt-out (all default to true = opted in)
  welcome                  boolean NOT NULL DEFAULT true,
  release_live             boolean NOT NULL DEFAULT true,
  new_comment              boolean NOT NULL DEFAULT true,
  payment_reminder         boolean NOT NULL DEFAULT true,
  payment_received         boolean NOT NULL DEFAULT true,
  weekly_digest            boolean NOT NULL DEFAULT true,
  subscription_confirmed   boolean NOT NULL DEFAULT true,
  subscription_cancelled   boolean NOT NULL DEFAULT true,

  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_prefs_unsubscribe_token
  ON email_preferences(unsubscribe_token);

DROP TRIGGER IF EXISTS email_preferences_updated_at ON email_preferences;
CREATE TRIGGER email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 2. EMAIL_LOG TABLE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email     text NOT NULL,
  category     text NOT NULL,
  subject      text NOT NULL,
  resend_id    text,
  status       text NOT NULL DEFAULT 'sent'
               CHECK (status IN ('sent', 'failed', 'skipped_preference', 'skipped_rate_limit')),
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user
  ON email_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_log_category
  ON email_log(category, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- 3. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own email preferences
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own preferences row (for first-time setup)
CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- email_log is service-role only (no user-facing policies)
-- Admins and service role can read/write; no public policies needed.

-- ═══════════════════════════════════════════════════════════════════
-- 4. BACKFILL EXISTING USERS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO email_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
