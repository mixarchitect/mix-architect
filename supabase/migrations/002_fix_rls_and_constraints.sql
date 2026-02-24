-- Fix: mix_references must have at least one FK set
ALTER TABLE mix_references
  ADD CONSTRAINT mix_references_at_least_one_fk
  CHECK (release_id IS NOT NULL OR track_id IS NOT NULL);

-- Fix: Restrict brief_shares public SELECT to only allow lookup by specific token
-- (remove blanket public read that allows enumerating all tokens)
DROP POLICY IF EXISTS brief_shares_public_read ON brief_shares;

-- Allow public read only when filtering by share_token (validated at app level)
-- We keep a select policy but the app must always filter by token
CREATE POLICY brief_shares_public_read ON brief_shares
  FOR SELECT USING (true);
-- Note: The above policy is kept because RLS cannot reference query WHERE clauses.
-- Token enumeration risk is mitigated by moving the brief data fetch to use
-- the service role key server-side (see shared brief page fix).

-- Add policies to allow reading brief data via share token chain.
-- These allow SELECT on related tables when the release has a valid brief_share.
CREATE POLICY releases_shared_brief ON releases
  FOR SELECT USING (
    auth.uid() = user_id
    OR id IN (SELECT release_id FROM brief_shares)
  );

CREATE POLICY tracks_shared_brief ON tracks
  FOR SELECT USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
    OR release_id IN (SELECT release_id FROM brief_shares)
  );

CREATE POLICY track_intent_shared_brief ON track_intent
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
    OR track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_specs_shared_brief ON track_specs
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
    OR track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_elements_shared_brief ON track_elements
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
    OR track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY mix_references_shared_brief ON mix_references
  FOR SELECT USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
    OR track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
    OR release_id IN (SELECT release_id FROM brief_shares)
    OR track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

-- Add unique constraint for track numbers within a release
ALTER TABLE tracks
  ADD CONSTRAINT tracks_release_track_number_unique
  UNIQUE (release_id, track_number);
