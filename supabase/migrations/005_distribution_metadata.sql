-- ── Migration 005: Distribution Metadata ──────────────────────────
-- Adds distribution fields to releases and creates track_distribution
-- and track_splits tables for per-track distribution metadata.

-- ═══════════════════════════════════════════════════════════════════
-- 1. RELEASE-LEVEL DISTRIBUTION COLUMNS
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE releases ADD COLUMN IF NOT EXISTS distributor text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS record_label text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS upc text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS copyright_holder text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS copyright_year text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS phonogram_copyright text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS catalog_number text;

-- ═══════════════════════════════════════════════════════════════════
-- 2. TRACK_DISTRIBUTION TABLE (1:1 with tracks)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS track_distribution (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id              uuid NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE,
  isrc                  text,
  iswc                  text,
  explicit_lyrics       boolean DEFAULT false,
  featured_artist       text,
  instrumental          boolean DEFAULT false,
  cover_song            boolean DEFAULT false,
  language              text DEFAULT 'English',
  copyright_number      text,
  copyright_filing_date date,
  producer              text,
  composers             text,
  lyrics                text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS track_distribution_updated_at ON track_distribution;
CREATE TRIGGER track_distribution_updated_at
  BEFORE UPDATE ON track_distribution
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_track_distribution_track_id ON track_distribution(track_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. TRACK_SPLITS TABLE (1:many with tracks, typed by split_type)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS track_splits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id    uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  split_type  text NOT NULL CHECK (split_type IN ('writing', 'publishing', 'master')),
  person_name text NOT NULL,
  percentage  numeric(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_track_splits_track_id ON track_splits(track_id);
CREATE INDEX IF NOT EXISTS idx_track_splits_type     ON track_splits(track_id, split_type);

-- ═══════════════════════════════════════════════════════════════════
-- 4. ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE track_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_splits       ENABLE ROW LEVEL SECURITY;

-- track_distribution: same pattern as track_specs

CREATE POLICY track_distribution_select ON track_distribution
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_distribution_insert ON track_distribution
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_distribution_update ON track_distribution
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_distribution_delete ON track_distribution
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

-- track_splits: same pattern

CREATE POLICY track_splits_select ON track_splits
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
         OR t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_splits_insert ON track_splits
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_splits_update ON track_splits
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );

CREATE POLICY track_splits_delete ON track_splits
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );
