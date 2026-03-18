-- Upgrade feature_requests table and add changelog linking system

-- ============================================================
-- 1. ALTER feature_requests table
-- ============================================================

-- Expand the status check constraint to include 'new' and 'declined'
ALTER TABLE public.feature_requests
  DROP CONSTRAINT IF EXISTS feature_requests_status_check;

ALTER TABLE public.feature_requests
  ADD CONSTRAINT feature_requests_status_check
  CHECK (status IN ('new', 'under_review', 'planned', 'in_progress', 'shipped', 'declined'));

-- Change default status from 'under_review' to 'new'
ALTER TABLE public.feature_requests
  ALTER COLUMN status SET DEFAULT 'new';

-- Admin-only notes (never visible to end users)
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- Freeform tags for grouping/theming
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Merge support: if a request is a duplicate, point it to the canonical request
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS merged_into_id uuid REFERENCES public.feature_requests(id) ON DELETE SET NULL;

-- Track when admin last updated the status
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

-- Admin response shown to users on the public board
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS admin_response text;

-- Index for tag-based queries
CREATE INDEX IF NOT EXISTS idx_feature_requests_tags
  ON public.feature_requests USING GIN (tags);

-- Index for merged_into lookups
CREATE INDEX IF NOT EXISTS idx_feature_requests_merged
  ON public.feature_requests (merged_into_id)
  WHERE merged_into_id IS NOT NULL;


-- ============================================================
-- 2. ALTER changelog_entries table — add tags column
-- ============================================================

ALTER TABLE public.changelog_entries
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';


-- ============================================================
-- 3. CREATE feature_request_changelog_links junction table
-- ============================================================

CREATE TABLE public.feature_request_changelog_links (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id    uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  changelog_entry_id    uuid NOT NULL REFERENCES public.changelog_entries(id) ON DELETE CASCADE,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feature_request_id, changelog_entry_id)
);

ALTER TABLE public.feature_request_changelog_links ENABLE ROW LEVEL SECURITY;

-- Public can view links (needed for "Suggested by" on public changelog)
CREATE POLICY "Anyone can view changelog links"
  ON public.feature_request_changelog_links FOR SELECT
  USING (true);

CREATE INDEX idx_frcl_changelog
  ON public.feature_request_changelog_links (changelog_entry_id);

CREATE INDEX idx_frcl_request
  ON public.feature_request_changelog_links (feature_request_id);


-- ============================================================
-- 4. Helper function + view for "Suggested by" attribution
-- ============================================================

-- Safe accessor for user display names from auth.users
CREATE OR REPLACE FUNCTION public.get_user_display_name(uid uuid)
RETURNS text
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    raw_user_meta_data->>'display_name',
    raw_user_meta_data->>'full_name',
    email
  )
  FROM auth.users
  WHERE id = uid;
$$;

CREATE OR REPLACE VIEW public.changelog_suggesters AS
SELECT
  cl.changelog_entry_id,
  fr.id AS feature_request_id,
  fr.title AS request_title,
  fr.user_id,
  COALESCE(
    public.get_user_display_name(fr.user_id),
    fr.email,
    'A Mix Architect user'
  ) AS display_name,
  fr.vote_count
FROM public.feature_request_changelog_links cl
JOIN public.feature_requests fr ON fr.id = cl.feature_request_id;
