-- ═══════════════════════════════════════════════════════════════════
-- Migration 040: Fix cross-user data leak via brief_shares RLS
--
-- Problem: SELECT policies on releases, tracks, and related tables
-- included `OR id IN (SELECT release_id FROM brief_shares)` which
-- allowed ANY authenticated user to read ANY release with an active
-- brief share. The portal page now uses the service role client
-- (bypassing RLS entirely), so these conditions are no longer needed.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. releases ────────────────────────────────────────────────────

DROP POLICY IF EXISTS releases_select ON releases;
CREATE POLICY releases_select ON releases
  FOR SELECT USING (
    id IN (SELECT accessible_release_ids('client'))
  );

-- ── 2. tracks ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS tracks_select ON tracks;
CREATE POLICY tracks_select ON tracks
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
  );

-- ── 3. track_intent ────────────────────────────────────────────────

DROP POLICY IF EXISTS track_intent_select ON track_intent;
CREATE POLICY track_intent_select ON track_intent
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 4. track_specs ─────────────────────────────────────────────────

DROP POLICY IF EXISTS track_specs_select ON track_specs;
CREATE POLICY track_specs_select ON track_specs
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 5. track_elements ──────────────────────────────────────────────

DROP POLICY IF EXISTS track_elements_select ON track_elements;
CREATE POLICY track_elements_select ON track_elements
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 6. mix_references ──────────────────────────────────────────────

DROP POLICY IF EXISTS mix_references_select ON mix_references;
CREATE POLICY mix_references_select ON mix_references
  FOR SELECT USING (
    (release_id IS NOT NULL AND (
      release_id IN (SELECT accessible_release_ids('client'))
    ))
    OR
    (track_id IS NOT NULL AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    ))
  );

-- ── 7. revision_notes ──────────────────────────────────────────────

DROP POLICY IF EXISTS revision_notes_select ON revision_notes;
CREATE POLICY revision_notes_select ON revision_notes
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 8. track_audio_versions (from migration 012) ──────────────────

DROP POLICY IF EXISTS track_audio_versions_select ON track_audio_versions;
CREATE POLICY track_audio_versions_select ON track_audio_versions
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 9. track_distribution (from migration 005) ────────────────────

DROP POLICY IF EXISTS track_distribution_select ON track_distribution;
CREATE POLICY track_distribution_select ON track_distribution
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 10. track_splits (from migration 005) ─────────────────────────

DROP POLICY IF EXISTS track_splits_select ON track_splits;
CREATE POLICY track_splits_select ON track_splits
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 11. release_distribution (from migration 035) ─────────────────

DROP POLICY IF EXISTS release_distribution_select ON release_distribution;
CREATE POLICY release_distribution_select ON release_distribution
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
  );

-- ── 12. release_distribution_history (from migration 035) ─────────

DROP POLICY IF EXISTS distribution_history_select ON release_distribution_history;
CREATE POLICY distribution_history_select ON release_distribution_history
  FOR SELECT USING (
    distribution_id IN (
      SELECT rd.id FROM release_distribution rd
      WHERE rd.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── 13. portal_track_settings (from migration 016) ────────────────
-- Portal page now uses service client; restrict to owner/collaborator

DROP POLICY IF EXISTS portal_track_settings_select ON portal_track_settings;
CREATE POLICY portal_track_settings_select ON portal_track_settings
  FOR SELECT USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- ── 14. portal_version_settings (from migration 016) ──────────────

DROP POLICY IF EXISTS portal_version_settings_select ON portal_version_settings;
CREATE POLICY portal_version_settings_select ON portal_version_settings
  FOR SELECT USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- ── 15. portal_approval_events (from migration 017) ───────────────

DROP POLICY IF EXISTS portal_approval_events_select ON portal_approval_events;
CREATE POLICY portal_approval_events_select ON portal_approval_events
  FOR SELECT USING (
    brief_share_id IN (
      SELECT bs.id FROM brief_shares bs
      WHERE bs.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- ── 16. Tighten brief_shares public read ───────────────────────────
-- Replace blanket public read with owner/member-only access.
-- Portal uses service client so anonymous access is handled there.

DROP POLICY IF EXISTS brief_shares_public_read ON brief_shares;
CREATE POLICY brief_shares_select ON brief_shares
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
  );
