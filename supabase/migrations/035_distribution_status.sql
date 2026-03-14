-- ── Migration 035: Distribution Status Tracking ────────────────────
-- Per-platform distribution status tracking with history audit trail,
-- auto-detection support, and notification type extension.

-- ═══════════════════════════════════════════════════════════════════
-- 1. RELEASE_DISTRIBUTION TABLE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS release_distribution (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id    uuid NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  platform      text NOT NULL,
  distributor   text,
  status        text NOT NULL DEFAULT 'not_submitted'
                CHECK (status IN (
                  'not_submitted', 'submitted', 'processing',
                  'live', 'rejected', 'taken_down'
                )),
  submitted_at  timestamptz,
  live_at       timestamptz,
  external_url  text,
  notes         text,
  auto_detected boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (release_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_release_distribution_release
  ON release_distribution(release_id);

CREATE INDEX IF NOT EXISTS idx_release_distribution_pending
  ON release_distribution(status, submitted_at)
  WHERE status IN ('submitted', 'processing');

DROP TRIGGER IF EXISTS release_distribution_updated_at ON release_distribution;
CREATE TRIGGER release_distribution_updated_at
  BEFORE UPDATE ON release_distribution
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 2. RELEASE_DISTRIBUTION_HISTORY TABLE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS release_distribution_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id uuid NOT NULL REFERENCES release_distribution(id) ON DELETE CASCADE,
  old_status      text,
  new_status      text NOT NULL,
  changed_by      text NOT NULL DEFAULT 'user',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_distribution_history_dist
  ON release_distribution_history(distribution_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. AUTO-LOG STATUS CHANGES
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_distribution_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO release_distribution_history
      (distribution_id, old_status, new_status, changed_by)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      CASE WHEN NEW.auto_detected AND NOT OLD.auto_detected
           THEN 'auto_detection'
           ELSE 'user'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS release_distribution_status_log ON release_distribution;
CREATE TRIGGER release_distribution_status_log
  AFTER UPDATE ON release_distribution
  FOR EACH ROW
  EXECUTE FUNCTION log_distribution_status_change();

-- Also log the initial insert
CREATE OR REPLACE FUNCTION log_distribution_initial_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO release_distribution_history
    (distribution_id, old_status, new_status, changed_by)
  VALUES (NEW.id, NULL, NEW.status, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS release_distribution_initial_log ON release_distribution;
CREATE TRIGGER release_distribution_initial_log
  AFTER INSERT ON release_distribution
  FOR EACH ROW
  EXECUTE FUNCTION log_distribution_initial_status();

-- ═══════════════════════════════════════════════════════════════════
-- 4. ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE release_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_distribution_history ENABLE ROW LEVEL SECURITY;

-- release_distribution: same pattern as track_distribution (migration 005)

CREATE POLICY release_distribution_select ON release_distribution
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
    OR release_id IN (SELECT release_id FROM brief_shares)
  );

CREATE POLICY release_distribution_insert ON release_distribution
  FOR INSERT WITH CHECK (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

CREATE POLICY release_distribution_update ON release_distribution
  FOR UPDATE USING (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

CREATE POLICY release_distribution_delete ON release_distribution
  FOR DELETE USING (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

-- release_distribution_history: read-only via join

CREATE POLICY distribution_history_select ON release_distribution_history
  FOR SELECT USING (
    distribution_id IN (
      SELECT rd.id FROM release_distribution rd
      WHERE rd.release_id IN (SELECT accessible_release_ids('client'))
         OR rd.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- 5. NOTIFICATION TYPE EXTENSION
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'comment',
    'portal_comment',
    'status_change',
    'payment_update',
    'approval',
    'audio_upload',
    'collaborator_joined',
    'export_complete',
    'spec_mismatch',
    'distribution_live'
  ));
