-- ── Migration 013: Fix RLS initplan warnings & missing indexes ────
-- Addresses Supabase linter WARN and INFO findings:
--   1. Wrap auth.uid() in (select auth.uid()) so it evaluates once per
--      query instead of per row (auth_rls_initplan).
--   2. Drop stale "releases for owner" (FOR ALL) policy that duplicates
--      the per-action policies added in migration 004.
--   3. Add indexes on unindexed foreign keys.
--   4. Fix accessible_release_ids() helper to use (select auth.uid()).

-- ═══════════════════════════════════════════════════════════════════
-- 1. FIX accessible_release_ids() FUNCTION
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION accessible_release_ids(p_min_role text DEFAULT 'client')
RETURNS SETOF uuid AS $$
  -- Owned releases
  SELECT id FROM releases WHERE user_id = (select auth.uid())
  UNION ALL
  -- Member releases (filter by minimum role)
  SELECT release_id FROM release_members
  WHERE user_id = (select auth.uid())
    AND accepted_at IS NOT NULL
    AND (
      p_min_role = 'client'       -- any accepted member
      OR role = 'collaborator'    -- when min is collaborator, only collaborator role
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════════════════
-- 2. DROP STALE DUPLICATE POLICY ON releases
-- ═══════════════════════════════════════════════════════════════════

-- Migration 004 should have dropped this but it persists in live DB
-- under the name "releases for owner" (different from "releases_owner").
DROP POLICY IF EXISTS "releases for owner" ON releases;

-- ═══════════════════════════════════════════════════════════════════
-- 3. FIX RLS INITPLAN: releases
-- ═══════════════════════════════════════════════════════════════════

-- releases_insert: user_id = auth.uid() → (select auth.uid())
DROP POLICY IF EXISTS releases_insert ON releases;
CREATE POLICY releases_insert ON releases
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- releases_delete: user_id = auth.uid() → (select auth.uid())
DROP POLICY IF EXISTS releases_delete ON releases;
CREATE POLICY releases_delete ON releases
  FOR DELETE USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════
-- 4. FIX RLS INITPLAN: user_defaults
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS user_defaults_owner ON user_defaults;
CREATE POLICY user_defaults_owner ON user_defaults
  FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════
-- 5. FIX RLS INITPLAN: saved_contacts
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS saved_contacts_owner ON saved_contacts;
CREATE POLICY saved_contacts_owner ON saved_contacts
  FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════
-- 6. FIX RLS INITPLAN: release_members
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS release_members_insert ON release_members;
CREATE POLICY release_members_insert ON release_members
  FOR INSERT WITH CHECK (
    release_id IN (SELECT id FROM releases WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS release_members_update ON release_members;
CREATE POLICY release_members_update ON release_members
  FOR UPDATE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = (select auth.uid()))
  );

DROP POLICY IF EXISTS release_members_delete ON release_members;
CREATE POLICY release_members_delete ON release_members
  FOR DELETE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = (select auth.uid()))
  );

-- ═══════════════════════════════════════════════════════════════════
-- 7. FIX RLS INITPLAN: brief_shares
-- ═══════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS brief_shares_delete ON brief_shares;
CREATE POLICY brief_shares_delete ON brief_shares
  FOR DELETE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = (select auth.uid()))
  );

-- ═══════════════════════════════════════════════════════════════════
-- 8. ADD MISSING FOREIGN KEY INDEXES
-- ═══════════════════════════════════════════════════════════════════

-- revision_notes.audio_version_id (added in migration 012, no index)
CREATE INDEX IF NOT EXISTS idx_revision_notes_audio_version_id
  ON revision_notes(audio_version_id);

-- The following tables (blueprints, projects) exist in live DB but not
-- in local migrations. Run these manually in the SQL Editor if needed:
--
-- CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);
-- CREATE INDEX IF NOT EXISTS idx_projects_release_id ON projects(release_id);
-- CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
