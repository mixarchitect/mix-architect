-- Organic signup attribution. signup_attributions previously modelled only
-- the engineer-referral path (portal_branding / post_action_prompt), so a
-- cold organic signup recorded no source at all. Add first-touch fields and
-- source values for utm / organic / direct signups, captured from a
-- client-set cookie at signup time.

ALTER TABLE public.signup_attributions
  DROP CONSTRAINT IF EXISTS valid_source;
ALTER TABLE public.signup_attributions
  ADD CONSTRAINT valid_source CHECK (source IN (
    'portal_branding', 'post_action_prompt', 'utm', 'organic', 'direct'
  ));

ALTER TABLE public.signup_attributions
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text;

CREATE INDEX IF NOT EXISTS idx_attributions_user
  ON public.signup_attributions(attributed_user_id);
