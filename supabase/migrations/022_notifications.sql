-- ── Migration 022: In-App Notifications ─────────────────────
-- Real-time notification system for comments, status changes,
-- payment updates, and portal approval events.

-- ═══════════════════════════════════════════════════════════
-- 1. NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN (
                    'comment',
                    'portal_comment',
                    'status_change',
                    'payment_update',
                    'approval'
                  )),
  title           text NOT NULL,
  body            text,
  release_id      uuid REFERENCES releases(id) ON DELETE CASCADE,
  track_id        uuid REFERENCES tracks(id) ON DELETE CASCADE,
  actor_name      text,
  read            boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 2. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- 3. ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read & update (mark read) their own notifications
DROP POLICY IF EXISTS notifications_owner_select ON notifications;
CREATE POLICY notifications_owner_select ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_owner_update ON notifications;
CREATE POLICY notifications_owner_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_owner_delete ON notifications;
CREATE POLICY notifications_owner_delete ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Inserts are done via service role (bypasses RLS), so no INSERT policy needed.

-- ═══════════════════════════════════════════════════════════
-- 4. ENABLE REALTIME
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
