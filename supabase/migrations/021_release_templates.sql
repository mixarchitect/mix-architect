-- ── Migration 021: Release Templates ──────────────────────────────────
-- Reusable release configurations that pre-fill the new-release form.

CREATE TABLE IF NOT EXISTS release_templates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  description           text,

  -- Release-level defaults
  release_type          text CHECK (release_type IS NULL OR release_type IN ('single', 'ep', 'album')),
  format                text CHECK (format IS NULL OR format IN ('stereo', 'atmos', 'both')),
  genre_tags            text[] DEFAULT '{}',

  -- Track spec defaults
  default_loudness      text,
  default_sample_rate   text,
  default_bit_depth     text,
  delivery_formats      text[] DEFAULT '{}',
  default_special_reqs  text,

  -- Intent defaults
  default_emotional_tags text[] DEFAULT '{}',

  -- Distribution metadata (flexible JSON for distributor-specific fields)
  distribution_fields   jsonb DEFAULT '{}',

  -- Client defaults
  client_name           text,
  client_email          text,

  -- Metadata
  is_default            boolean DEFAULT false,
  usage_count           int DEFAULT 0,
  last_used_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at (reuse existing function from migration 001)
DROP TRIGGER IF EXISTS release_templates_updated_at ON release_templates;
CREATE TRIGGER release_templates_updated_at
  BEFORE UPDATE ON release_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_release_templates_user_id
  ON release_templates(user_id);

-- Ensure at most one default template per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_template_per_user
  ON release_templates(user_id) WHERE is_default = true;

-- RLS: owner-only access
ALTER TABLE release_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS release_templates_owner ON release_templates;
CREATE POLICY release_templates_owner ON release_templates
  FOR ALL USING (user_id = auth.uid());

-- ── Add template reference columns to releases table ──────────────────
ALTER TABLE releases ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES release_templates(id) ON DELETE SET NULL;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS template_name text;
