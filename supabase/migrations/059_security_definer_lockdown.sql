-- Medium-severity hardening pass — addresses two items from the
-- 2026-06-20 audit:
--
--   1. SECURITY DEFINER functions across migrations 004, 013, 027,
--      035, 043, 052, 054 were missing the CLAUDE.md-mandated
--      `SET search_path = pg_catalog, public` + `REVOKE EXECUTE FROM
--      public`. Without search_path locked, a same-name object in a
--      writable schema can shadow a referenced one — search-path
--      hijack. Without the REVOKE, the function is callable by any
--      role that can reach it.
--
--   2. Featured-releases bucket policies (migration 025) hardcoded a
--      single admin's UUID into INSERT/UPDATE/DELETE checks. If that
--      user is ever deleted/rotated, the bucket becomes unmanaged;
--      and any new admin can't upload featured images without
--      another migration. Replace with the is_admin() pattern used
--      by featured-audio (052) and cover-art (050).

-- ─── 1. SECURITY DEFINER lockdown ─────────────────────────────────
-- ALTER FUNCTION ... SET search_path is idempotent (just overwrites
-- the proconfig setting). REVOKE on a function with no prior PUBLIC
-- grant is a no-op. Both safe to re-run.

ALTER FUNCTION public.accessible_release_ids(text)
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.accessible_release_ids(text) FROM public;
GRANT EXECUTE ON FUNCTION public.accessible_release_ids(text) TO authenticated;

ALTER FUNCTION public.claim_pending_invites()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.claim_pending_invites() FROM public;
GRANT EXECUTE ON FUNCTION public.claim_pending_invites() TO authenticated;

ALTER FUNCTION public.get_user_display_name(uuid)
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.get_user_display_name(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_display_name(uuid) TO authenticated;

-- Trigger functions: invoked by the trigger system, not by user
-- code, so they don't need GRANT EXECUTE TO anyone. Locking
-- search_path still matters — the trigger runs as the table owner
-- but evaluates the function body with proconfig search_path.

ALTER FUNCTION public.check_spec_mismatch()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.check_spec_mismatch() FROM public;

ALTER FUNCTION public.log_distribution_status_change()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.log_distribution_status_change() FROM public;

ALTER FUNCTION public.log_distribution_initial_status()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.log_distribution_initial_status() FROM public;

ALTER FUNCTION public.notify_feature_submission_status()
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.notify_feature_submission_status() FROM public;

-- ─── 2. Featured-releases bucket: is_admin() instead of hardcoded UUID
-- The legacy policies (migration 025) gate writes on a single
-- hardcoded auth.uid(). Replace with a check that any user with
-- profiles.is_admin = true can upload featured images — same
-- pattern as featured-audio (052) and cover-art (050).

DROP POLICY IF EXISTS "Owner can upload featured release images"
  ON storage.objects;
DROP POLICY IF EXISTS "Owner can update featured release images"
  ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete featured release images"
  ON storage.objects;

CREATE POLICY "Admin can upload featured release images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'featured-releases'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin can update featured release images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'featured-releases'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin can delete featured release images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'featured-releases'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
