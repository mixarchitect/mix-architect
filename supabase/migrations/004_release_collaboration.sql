-- ── Migration 004: Release Collaboration ─────────────────────────
-- Adds per-release collaboration with three roles:
--   owner (via releases.user_id), collaborator, client
-- Rewrites ALL RLS policies to be role-aware.

-- ═══════════════════════════════════════════════════════════════════
-- 1. CREATE release_members TABLE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS release_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id    uuid NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  role          text NOT NULL CHECK (role IN ('collaborator', 'client')),
  accepted_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(release_id, invited_email)
);

CREATE INDEX IF NOT EXISTS idx_release_members_release_id ON release_members(release_id);
CREATE INDEX IF NOT EXISTS idx_release_members_user_id    ON release_members(user_id);
CREATE INDEX IF NOT EXISTS idx_release_members_email      ON release_members(invited_email);

ALTER TABLE release_members ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- 2. HELPER FUNCTION: accessible_release_ids
-- Returns the set of release IDs the current user can access.
-- p_min_role: 'client' = any member, 'collaborator' = collaborator only
-- Owner always included regardless of p_min_role.
-- SECURITY DEFINER bypasses RLS so this can read releases/members.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION accessible_release_ids(p_min_role text DEFAULT 'client')
RETURNS SETOF uuid AS $$
  -- Owned releases
  SELECT id FROM releases WHERE user_id = auth.uid()
  UNION ALL
  -- Member releases (filter by minimum role)
  SELECT release_id FROM release_members
  WHERE user_id = auth.uid()
    AND accepted_at IS NOT NULL
    AND (
      p_min_role = 'client'       -- any accepted member
      OR role = 'collaborator'    -- when min is collaborator, only collaborator role
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════════════════
-- 3. CLAIM PENDING INVITES FUNCTION
-- Called on app load to link the current user to any pending invites
-- matching their email.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION claim_pending_invites()
RETURNS void AS $$
BEGIN
  UPDATE release_members
  SET user_id = auth.uid(),
      accepted_at = now()
  WHERE invited_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- 4. DROP ALL EXISTING POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Migration 001 owner-only policies (FOR ALL)
DROP POLICY IF EXISTS releases_owner       ON releases;
DROP POLICY IF EXISTS tracks_owner         ON tracks;
DROP POLICY IF EXISTS track_intent_owner   ON track_intent;
DROP POLICY IF EXISTS mix_references_owner ON mix_references;
DROP POLICY IF EXISTS track_specs_owner    ON track_specs;
DROP POLICY IF EXISTS track_elements_owner ON track_elements;
DROP POLICY IF EXISTS revision_notes_owner ON revision_notes;
DROP POLICY IF EXISTS brief_shares_owner   ON brief_shares;
-- Keep: user_defaults_owner (per-user, not collaborative)
-- Keep: brief_shares_public_read (anonymous brief viewing)

-- Migration 002 shared-brief SELECT policies
DROP POLICY IF EXISTS releases_shared_brief       ON releases;
DROP POLICY IF EXISTS tracks_shared_brief          ON tracks;
DROP POLICY IF EXISTS track_intent_shared_brief    ON track_intent;
DROP POLICY IF EXISTS track_specs_shared_brief     ON track_specs;
DROP POLICY IF EXISTS track_elements_shared_brief  ON track_elements;
DROP POLICY IF EXISTS mix_references_shared_brief  ON mix_references;

-- ═══════════════════════════════════════════════════════════════════
-- 5. NEW ROLE-AWARE POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- ── releases ─────────────────────────────────────────────────────

-- SELECT: any member + brief_share
CREATE POLICY releases_select ON releases
  FOR SELECT USING (
    id IN (SELECT accessible_release_ids('client'))
    OR id IN (SELECT release_id FROM brief_shares)
  );

-- INSERT: owner only (creating new releases)
CREATE POLICY releases_insert ON releases
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: owner + collaborator (payment restriction enforced at app level)
CREATE POLICY releases_update ON releases
  FOR UPDATE USING (
    id IN (SELECT accessible_release_ids('collaborator'))
  );

-- DELETE: owner only
CREATE POLICY releases_delete ON releases
  FOR DELETE USING (user_id = auth.uid());

-- ── tracks ───────────────────────────────────────────────────────

-- SELECT: any member + brief_share
CREATE POLICY tracks_select ON tracks
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
    OR release_id IN (SELECT release_id FROM brief_shares)
  );

-- INSERT: owner + collaborator
CREATE POLICY tracks_insert ON tracks
  FOR INSERT WITH CHECK (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

-- UPDATE: owner + collaborator
CREATE POLICY tracks_update ON tracks
  FOR UPDATE USING (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

-- DELETE: owner + collaborator
CREATE POLICY tracks_delete ON tracks
  FOR DELETE USING (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

-- ── track_intent (CREATIVE: all members can edit) ────────────────

CREATE POLICY track_intent_select ON track_intent
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_intent_insert ON track_intent
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY track_intent_update ON track_intent
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY track_intent_delete ON track_intent
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── track_specs (TECHNICAL: owner + collaborator only) ───────────

CREATE POLICY track_specs_select ON track_specs
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_specs_insert ON track_specs
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_specs_update ON track_specs
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_specs_delete ON track_specs
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- ── track_elements (CREATIVE: all members can edit) ──────────────

CREATE POLICY track_elements_select ON track_elements
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_elements_insert ON track_elements
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY track_elements_update ON track_elements
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY track_elements_delete ON track_elements
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── mix_references (CREATIVE: all members can edit) ──────────────
-- mix_references can be release-level (release_id set) or
-- track-level (track_id set), so check both paths.

CREATE POLICY mix_references_select ON mix_references
  FOR SELECT USING (
    (release_id IS NOT NULL AND (
      release_id IN (SELECT accessible_release_ids('client'))
      OR release_id IN (SELECT release_id FROM brief_shares)
    ))
    OR
    (track_id IS NOT NULL AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    ))
  );

CREATE POLICY mix_references_insert ON mix_references
  FOR INSERT WITH CHECK (
    (release_id IS NOT NULL AND release_id IN (SELECT accessible_release_ids('client')))
    OR
    (track_id IS NOT NULL AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    ))
  );

CREATE POLICY mix_references_update ON mix_references
  FOR UPDATE USING (
    (release_id IS NOT NULL AND release_id IN (SELECT accessible_release_ids('client')))
    OR
    (track_id IS NOT NULL AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    ))
  );

CREATE POLICY mix_references_delete ON mix_references
  FOR DELETE USING (
    (release_id IS NOT NULL AND release_id IN (SELECT accessible_release_ids('client')))
    OR
    (track_id IS NOT NULL AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    ))
  );

-- ── revision_notes (all members can view, post, and delete) ──────

CREATE POLICY revision_notes_select ON revision_notes
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY revision_notes_insert ON revision_notes
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY revision_notes_delete ON revision_notes
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- ── release_members (any member can view, owner manages) ─────────

CREATE POLICY release_members_select ON release_members
  FOR SELECT USING (
    release_id IN (SELECT accessible_release_ids('client'))
  );

CREATE POLICY release_members_insert ON release_members
  FOR INSERT WITH CHECK (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

CREATE POLICY release_members_update ON release_members
  FOR UPDATE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

CREATE POLICY release_members_delete ON release_members
  FOR DELETE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- ── brief_shares (owner + collaborator can create/manage) ────────
-- brief_shares_public_read (FOR SELECT USING true) is kept from migration 002

CREATE POLICY brief_shares_insert ON brief_shares
  FOR INSERT WITH CHECK (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

CREATE POLICY brief_shares_update ON brief_shares
  FOR UPDATE USING (
    release_id IN (SELECT accessible_release_ids('collaborator'))
  );

CREATE POLICY brief_shares_delete ON brief_shares
  FOR DELETE USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );
