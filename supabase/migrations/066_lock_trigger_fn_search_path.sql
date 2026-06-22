-- Advisor 0011 (function_search_path_mutable): pin search_path on the
-- updated_at trigger functions that were missing it. They are NOT
-- SECURITY DEFINER (run as the invoking user) and only set
-- NEW.updated_at, so this is hygiene — it clears the advisor warning and
-- removes any future search-path ambiguity. Already applied to prod.

ALTER FUNCTION public.set_updated_at()                      SET search_path = pg_catalog, public;
ALTER FUNCTION public.releases_set_updated_at()             SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_featured_releases_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.update_subscriptions_updated_at()     SET search_path = pg_catalog, public;

-- Not addressed here, intentionally:
--   * View public.changelog_suggesters is SECURITY DEFINER (advisor
--     0010). It only exposes already-public data (the public changelog +
--     publicly-readable feature_requests) and relies on definer rights
--     to run get_user_display_name() for suggester names on the public
--     changelog. Flipping it to security_invoker would break that page
--     (anon can't execute get_user_display_name after migration 065), so
--     it is left as-is by design.
--   * Auth "leaked password protection" is a dashboard/Auth-config
--     toggle, not SQL — enable under Authentication → Providers.
