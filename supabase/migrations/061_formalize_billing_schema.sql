-- Formalize the billing schema in source control.
--
-- The `subscriptions` table and the `can_create_release()` function were
-- created out-of-band (Supabase dashboard) and never captured in a
-- migration. That meant:
--   - a fresh environment / DR restore from migrations would be missing
--     both, silently breaking auth-gated release creation and all plan
--     reads;
--   - the `plan` CHECK constraint (live: 'free' | 'pro') was invisible to
--     the codebase, so adding the Studio tier would have failed at insert
--     time with a constraint violation;
--   - can_create_release() is SECURITY DEFINER but has no
--     `SET search_path` — the exact search-path-hijack gap migration 059
--     closed for every other definer function, but couldn't reach this
--     one because it wasn't in source.
--
-- This migration captures the live shape verbatim (idempotent — it
-- no-ops against the existing prod table) and makes three forward
-- changes:
--   1. widen the plan CHECK to allow 'studio';
--   2. teach can_create_release() that 'studio' is unlimited (like 'pro');
--   3. lock the function's search_path + REVOKE EXECUTE FROM public.

-- ─── 1. subscriptions table (captures live shape; no-op on prod) ────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     text,
  stripe_subscription_id text UNIQUE,
  plan                   text NOT NULL DEFAULT 'free',
  status                 text NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end     timestamptz,
  cancel_at_period_end   boolean DEFAULT false,
  granted_by_admin       boolean DEFAULT false,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ─── 2. Widen the plan CHECK to allow 'studio' ─────────────────────
-- Runs on both prod (replaces the live free|pro constraint) and fresh
-- (the CREATE above intentionally omits an inline plan check so this is
-- the single source of the constraint). Existing rows are all free|pro,
-- so no row violates the widened constraint.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'studio'));

-- ─── 3. RLS: owner-only SELECT (writes are service-role only) ───────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_owner ON public.subscriptions;
CREATE POLICY subscriptions_owner
  ON public.subscriptions
  FOR SELECT
  USING (user_id = (select auth.uid()));

-- ─── 4. can_create_release(): studio-aware + search_path locked ─────
CREATE OR REPLACE FUNCTION public.can_create_release(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  sub_plan text;
  release_count int;
BEGIN
  SELECT plan INTO sub_plan FROM subscriptions
    WHERE user_id = p_user_id AND status IN ('active', 'trialing');
  -- Pro and Studio are both unlimited; Free is capped at 1 release.
  IF sub_plan IN ('pro', 'studio') THEN RETURN true; END IF;
  SELECT count(*) INTO release_count FROM releases WHERE user_id = p_user_id;
  RETURN release_count < 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_create_release(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_create_release(uuid) TO authenticated, service_role;
