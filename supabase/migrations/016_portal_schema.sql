-- ── Migration 016: Client Delivery Portal Schema ─────────────────
-- Extends brief_shares with portal configuration and adds per-track
-- and per-version visibility control tables.

-- ═══════════════════════════════════════════════════════════════════
-- 1. EXTEND brief_shares WITH PORTAL SETTINGS
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE brief_shares
  ADD COLUMN IF NOT EXISTS portal_mode text NOT NULL DEFAULT 'brief'
    CHECK (portal_mode IN ('brief', 'portal')),
  ADD COLUMN IF NOT EXISTS show_direction boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_specs boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_references boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_payment_status boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_distribution boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_payment_for_download boolean NOT NULL DEFAULT false;

-- ═══════════════════════════════════════════════════════════════════
-- 2. PER-TRACK PORTAL VISIBILITY
-- ═══════════════════════════════════════════════════════════════════
-- Controls which tracks are visible on the portal and whether
-- download is enabled. If no row exists for a track, it defaults
-- to visible with download enabled.

CREATE TABLE IF NOT EXISTS portal_track_settings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_share_id   uuid NOT NULL REFERENCES brief_shares(id) ON DELETE CASCADE,
  track_id         uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  visible          boolean NOT NULL DEFAULT true,
  download_enabled boolean NOT NULL DEFAULT true,
  UNIQUE(brief_share_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_track_settings_share
  ON portal_track_settings(brief_share_id);

ALTER TABLE portal_track_settings ENABLE ROW LEVEL SECURITY;

-- Public SELECT (portal visitors need to read these to filter tracks)
CREATE POLICY portal_track_settings_select ON portal_track_settings
  FOR SELECT USING (
    brief_share_id IN (SELECT id FROM brief_shares)
  );

-- Owner + collaborator can manage
CREATE POLICY portal_track_settings_insert ON portal_track_settings
  FOR INSERT WITH CHECK (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY portal_track_settings_update ON portal_track_settings
  FOR UPDATE USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY portal_track_settings_delete ON portal_track_settings
  FOR DELETE USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- 3. PER-VERSION PORTAL VISIBILITY
-- ═══════════════════════════════════════════════════════════════════
-- Controls which audio versions the client can see per track.
-- If no row exists for a version, it defaults to visible.

CREATE TABLE IF NOT EXISTS portal_version_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_share_id    uuid NOT NULL REFERENCES brief_shares(id) ON DELETE CASCADE,
  audio_version_id  uuid NOT NULL REFERENCES track_audio_versions(id) ON DELETE CASCADE,
  visible           boolean NOT NULL DEFAULT true,
  UNIQUE(brief_share_id, audio_version_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_version_settings_share
  ON portal_version_settings(brief_share_id);

ALTER TABLE portal_version_settings ENABLE ROW LEVEL SECURITY;

-- Public SELECT
CREATE POLICY portal_version_settings_select ON portal_version_settings
  FOR SELECT USING (
    brief_share_id IN (SELECT id FROM brief_shares)
  );

-- Owner + collaborator can manage
CREATE POLICY portal_version_settings_insert ON portal_version_settings
  FOR INSERT WITH CHECK (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY portal_version_settings_update ON portal_version_settings
  FOR UPDATE USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY portal_version_settings_delete ON portal_version_settings
  FOR DELETE USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );
