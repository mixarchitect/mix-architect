-- ── Migration 017: Approval Workflow ─────────────────────────────────
-- Adds per-track approval status and a release-level rollup.
-- Introduces an event log for tracking approval history.

-- ═══════════════════════════════════════════════════════════════════
-- 1. ADD APPROVAL STATUS TO portal_track_settings
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE portal_track_settings
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'awaiting_review'
    CHECK (approval_status IN ('awaiting_review', 'changes_requested', 'approved', 'delivered'));

-- ═══════════════════════════════════════════════════════════════════
-- 2. ADD PORTAL STATUS ROLLUP TO brief_shares
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE brief_shares
  ADD COLUMN IF NOT EXISTS portal_status text NOT NULL DEFAULT 'in_review'
    CHECK (portal_status IN ('in_review', 'approved', 'delivered'));

-- ═══════════════════════════════════════════════════════════════════
-- 3. APPROVAL EVENT LOG
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portal_approval_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_share_id  uuid NOT NULL REFERENCES brief_shares(id) ON DELETE CASCADE,
  track_id        uuid REFERENCES tracks(id) ON DELETE CASCADE,
  event_type      text NOT NULL
    CHECK (event_type IN ('approve', 'request_changes', 'deliver', 'reopen')),
  actor_name      text NOT NULL DEFAULT 'Client',
  actor_email     text,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_approval_events_share
  ON portal_approval_events(brief_share_id);

ALTER TABLE portal_approval_events ENABLE ROW LEVEL SECURITY;

-- Public SELECT (through brief_shares)
CREATE POLICY portal_approval_events_select ON portal_approval_events
  FOR SELECT USING (
    brief_share_id IN (SELECT id FROM brief_shares)
  );

-- Insert via service role API only (no direct client writes)
-- Owner + collaborator can also manage for engineer-side actions
CREATE POLICY portal_approval_events_insert ON portal_approval_events
  FOR INSERT WITH CHECK (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );
