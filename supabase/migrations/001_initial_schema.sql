-- Mix Architect — Full Database Schema
-- Run this against your Supabase project (SQL Editor → New Query → Run)
--
-- IMPORTANT: If you have an existing `releases` table with columns
-- `name`, `artist_name`, `type`, uncomment the RENAME lines below
-- before running the rest of the migration.
-- ─────────────────────────────────────────────────────────────────

-- ── Helper: auto-update updated_at ──────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Rename legacy columns (uncomment if migrating) ─────────────

-- DO $$ BEGIN ALTER TABLE releases RENAME COLUMN name TO title;         EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- DO $$ BEGIN ALTER TABLE releases RENAME COLUMN artist_name TO artist; EXCEPTION WHEN OTHERS THEN NULL; END $$;
-- DO $$ BEGIN ALTER TABLE releases RENAME COLUMN type TO release_type;  EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── TABLE: releases ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS releases (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            text NOT NULL,
  artist           text,
  release_type     text NOT NULL DEFAULT 'single'
                     CHECK (release_type IN ('single', 'ep', 'album')),
  format           text NOT NULL DEFAULT 'stereo'
                     CHECK (format IN ('stereo', 'atmos', 'both')),
  status           text NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'in_progress', 'ready')),
  global_direction text,
  target_date      date,
  genre_tags       text[] DEFAULT '{}',
  client_name      text,
  client_email     text,
  delivery_notes   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if migrating from an older schema
ALTER TABLE releases ADD COLUMN IF NOT EXISTS format text DEFAULT 'stereo';
ALTER TABLE releases ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE releases ADD COLUMN IF NOT EXISTS global_direction text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS genre_tags text[] DEFAULT '{}';
ALTER TABLE releases ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS delivery_notes text;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS releases_updated_at ON releases;
CREATE TRIGGER releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: tracks ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tracks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id    uuid NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  track_number  int NOT NULL DEFAULT 1,
  title         text NOT NULL,
  status        text NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'complete')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tracks_updated_at ON tracks;
CREATE TRIGGER tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── TABLE: track_intent (one-to-one with tracks) ───────────────

CREATE TABLE IF NOT EXISTS track_intent (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id        uuid NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE,
  mix_vision      text,
  emotional_tags  text[] DEFAULT '{}',
  anti_references text
);

-- ── TABLE: mix_references ───────────────────────────────────────
-- Named mix_references to avoid the SQL reserved word "references".
-- Nullable track_id = release-level reference; set track_id for track-level.

CREATE TABLE IF NOT EXISTS mix_references (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id    uuid REFERENCES tracks(id) ON DELETE CASCADE,
  release_id  uuid REFERENCES releases(id) ON DELETE CASCADE,
  song_title  text NOT NULL,
  artist      text,
  note        text,
  url         text,
  artwork_url text,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE mix_references ADD COLUMN IF NOT EXISTS artwork_url text;

-- ── TABLE: track_specs (one-to-one with tracks) ────────────────

CREATE TABLE IF NOT EXISTS track_specs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id          uuid NOT NULL UNIQUE REFERENCES tracks(id) ON DELETE CASCADE,
  target_loudness   text,
  format_override   text CHECK (format_override IS NULL OR format_override IN ('stereo', 'atmos', 'both')),
  sample_rate       text,
  bit_depth         text,
  delivery_formats  text[] DEFAULT '{}',
  special_reqs      text
);

-- ── TABLE: track_elements ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS track_elements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id    uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  name        text NOT NULL,
  notes       text,
  flagged     boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0
);

-- ── TABLE: revision_notes ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS revision_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id    uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  content     text NOT NULL,
  author      text NOT NULL DEFAULT 'You',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── TABLE: user_defaults (one-to-one with auth.users) ──────────

CREATE TABLE IF NOT EXISTS user_defaults (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_loudness     text DEFAULT '-14 LUFS',
  default_format       text DEFAULT 'stereo'
                         CHECK (default_format IN ('stereo', 'atmos', 'both')),
  default_elements     text[] DEFAULT '{"Kick","Snare","Bass","Guitars","Keys/Synths","Lead Vocal","BGVs","FX/Ear Candy"}',
  default_sample_rate  text DEFAULT '48kHz',
  default_bit_depth    text DEFAULT '24-bit'
);

-- ── TABLE: brief_shares ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brief_shares (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  uuid NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  share_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── ROW-LEVEL SECURITY ──────────────────────────────────────────

ALTER TABLE releases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_intent   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_specs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_defaults  ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_shares   ENABLE ROW LEVEL SECURITY;

-- Owner-only policies
DROP POLICY IF EXISTS releases_owner ON releases;
CREATE POLICY releases_owner ON releases
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS tracks_owner ON tracks;
CREATE POLICY tracks_owner ON tracks
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS track_intent_owner ON track_intent;
CREATE POLICY track_intent_owner ON track_intent
  FOR ALL USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS mix_references_owner ON mix_references;
CREATE POLICY mix_references_owner ON mix_references
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
    OR track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS track_specs_owner ON track_specs;
CREATE POLICY track_specs_owner ON track_specs
  FOR ALL USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS track_elements_owner ON track_elements;
CREATE POLICY track_elements_owner ON track_elements
  FOR ALL USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS revision_notes_owner ON revision_notes;
CREATE POLICY revision_notes_owner ON revision_notes
  FOR ALL USING (
    track_id IN (
      SELECT t.id FROM tracks t
      JOIN releases r ON r.id = t.release_id
      WHERE r.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS user_defaults_owner ON user_defaults;
CREATE POLICY user_defaults_owner ON user_defaults
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS brief_shares_owner ON brief_shares;
CREATE POLICY brief_shares_owner ON brief_shares
  FOR ALL USING (
    release_id IN (SELECT id FROM releases WHERE user_id = auth.uid())
  );

-- Public read for shared briefs (anyone with the token can view)
DROP POLICY IF EXISTS brief_shares_public_read ON brief_shares;
CREATE POLICY brief_shares_public_read ON brief_shares
  FOR SELECT USING (true);

-- ── INDEXES ─────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_releases_user_id        ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_updated_at     ON releases(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_release_id       ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_track_intent_track_id   ON track_intent(track_id);
CREATE INDEX IF NOT EXISTS idx_mix_refs_track_id       ON mix_references(track_id);
CREATE INDEX IF NOT EXISTS idx_mix_refs_release_id     ON mix_references(release_id);
CREATE INDEX IF NOT EXISTS idx_track_specs_track_id    ON track_specs(track_id);
CREATE INDEX IF NOT EXISTS idx_track_elements_track_id ON track_elements(track_id);
CREATE INDEX IF NOT EXISTS idx_revision_notes_track_id ON revision_notes(track_id);
CREATE INDEX IF NOT EXISTS idx_brief_shares_token      ON brief_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_brief_shares_release_id ON brief_shares(release_id);
