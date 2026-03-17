-- Changelog entries for the public "What's New" page
CREATE TABLE public.changelog_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core content
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,

  -- Categorization
  category text NOT NULL DEFAULT 'improvement'
    CHECK (category IN ('feature', 'improvement', 'fix', 'announcement')),

  -- Optional media
  cover_image_path text,
  video_url text,

  -- Publishing
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false,
  is_highlighted boolean NOT NULL DEFAULT false,

  -- Version tagging (optional)
  version_tag text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_changelog_published_at ON public.changelog_entries (published_at DESC)
  WHERE is_published = true;

CREATE INDEX idx_changelog_slug ON public.changelog_entries (slug);

CREATE INDEX idx_changelog_category ON public.changelog_entries (category)
  WHERE is_published = true;

-- Reuse existing set_updated_at trigger function
CREATE TRIGGER changelog_entries_updated_at
  BEFORE UPDATE ON public.changelog_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: public read for published entries only
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published changelog entries"
  ON public.changelog_entries FOR SELECT
  USING (is_published = true);

-- Admin access is handled via service role client (bypasses RLS),
-- matching the pattern used by featured_releases and other admin tables.
