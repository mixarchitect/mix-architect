-- Backfill schema objects that were created via the Supabase dashboard
-- and never captured in a migration. Found by the 2026-06-21 schema-drift
-- audit (live DB vs migrations/).
--
-- Drift captured here:
--   Tables:    profiles, projects, blueprints, admin_activity_log,
--              admin_audit_log, admin_churn_signals, admin_notifications_log
--   Functions: handle_new_user, grant_free_pro, revoke_free_pro,
--              update_subscriptions_updated_at
--   Triggers:  on_auth_user_created (auth.users), subscriptions_updated_at
--   Realtime:  admin_activity_log
--
-- Plus security lockdowns folded in: the SECURITY DEFINER functions
-- (handle_new_user, grant_free_pro, revoke_free_pro, and the in-source
-- upvote_feature_request that migration 059 missed) get
-- `SET search_path = pg_catalog, public` + `REVOKE EXECUTE FROM public`.
-- Those are the only real changes against prod — everything else is a
-- no-op capture (CREATE ... IF NOT EXISTS / OR REPLACE).
--
-- ⚠️ REPLAY-ORDERING CAVEAT: `profiles` is referenced by migrations as
-- early as 038, so the historical migration set is NOT strictly
-- replayable top-to-bottom on a brand-new database (it never was —
-- profiles/subscriptions were dashboard-created before the migration
-- discipline started). This migration makes source *complete*; making
-- it *strictly ordered for a from-scratch replay* is a separate baseline
-- consolidation. For a true DR rebuild today: run this file first (it's
-- idempotent), then the rest of the folder.

-- ═══════════════════════════════════════════════════════════════════
-- 1. TABLES (ordered by FK dependency: profiles → projects → blueprints)
-- ═══════════════════════════════════════════════════════════════════

-- profiles: user profile + is_admin flag. The backbone of requireAdmin()
-- and many RLS policies. id mirrors auth.users.id (set by handle_new_user).
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name              text,
  created_at             timestamptz DEFAULT now(),
  is_admin               boolean NOT NULL DEFAULT false,
  attributed_to_engineer uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_test_account        boolean NOT NULL DEFAULT false
);

-- projects / blueprints: legacy feature, not referenced by the current
-- app (no `from('projects')` / `from('blueprints')` call sites), but
-- present in prod with data. Captured for completeness.
CREATE TABLE IF NOT EXISTS public.projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  release_id   uuid REFERENCES public.releases(id) ON DELETE SET NULL,
  track_number integer,
  name         text NOT NULL,
  artist_name  text,
  format       text NOT NULL DEFAULT 'immersive',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blueprints (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type       text NOT NULL,
  data       jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- admin_activity_log: per-user activity feed (logActivity writes here).
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type     text NOT NULL,
  event_metadata jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  ip_address     text,
  user_agent     text
);
CREATE INDEX IF NOT EXISTS idx_activity_log_user    ON public.admin_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type    ON public.admin_activity_log (event_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.admin_activity_log (created_at DESC);

-- admin_audit_log: admin-action audit trail (logAdminAction writes here).
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        uuid NOT NULL REFERENCES auth.users(id),
  action          text NOT NULL,
  action_metadata jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  ip_address      text,
  user_agent      text
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id   ON public.admin_audit_log (admin_id);

-- admin_churn_signals: churn detection (createChurnSignal writes here).
CREATE TABLE IF NOT EXISTS public.admin_churn_signals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  severity    text NOT NULL DEFAULT 'medium',
  details     jsonb DEFAULT '{}'::jsonb,
  resolved    boolean DEFAULT false,
  resolved_at timestamptz,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_churn_signals_user     ON public.admin_churn_signals (user_id);
CREATE INDEX IF NOT EXISTS idx_churn_signals_resolved ON public.admin_churn_signals (resolved);

-- admin_notifications_log: admin-sent email log (/api/admin/send-notification).
CREATE TABLE IF NOT EXISTS public.admin_notifications_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by           uuid NOT NULL REFERENCES auth.users(id),
  recipient_email   text NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id),
  subject           text NOT NULL,
  heading           text NOT NULL,
  body              text NOT NULL,
  cta_label         text,
  cta_url           text,
  category          text DEFAULT 'custom',
  created_at        timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_notif_log_created ON public.admin_notifications_log (created_at DESC);

-- ═══════════════════════════════════════════════════════════════════
-- 2. RLS + policies
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_churn_signals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications_log ENABLE ROW LEVEL SECURITY;

-- profiles: owner can read/insert/update their own row.
DROP POLICY IF EXISTS "profiles are viewable by owner" ON public.profiles;
CREATE POLICY "profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles insert for self" ON public.profiles;
CREATE POLICY "profiles insert for self" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles update for self" ON public.profiles;
CREATE POLICY "profiles update for self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- projects / blueprints: owner-scoped.
DROP POLICY IF EXISTS "projects for owner" ON public.projects;
CREATE POLICY "projects for owner" ON public.projects
  FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "blueprints via project owner" ON public.blueprints;
CREATE POLICY "blueprints via project owner" ON public.blueprints
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = blueprints.project_id AND p.user_id = auth.uid()
  ));

-- admin_activity_log: admins read; writes are service-role only.
DROP POLICY IF EXISTS admin_read_activity_log ON public.admin_activity_log;
CREATE POLICY admin_read_activity_log ON public.admin_activity_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- admin_audit_log / admin_churn_signals / admin_notifications_log:
-- RLS enabled with NO policies = deny-all for anon/authenticated.
-- These are written and read exclusively by the service-role client
-- (admin routes behind requireAdmin + the Stripe webhook). Matches prod.

-- ═══════════════════════════════════════════════════════════════════
-- 3. Functions (SECURITY DEFINER ones get search_path locked)
-- ═══════════════════════════════════════════════════════════════════

-- handle_new_user: auth.users INSERT trigger → seeds the profiles row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

-- grant_free_pro / revoke_free_pro: admin comp helpers (no app call
-- sites today; service-role only).
CREATE OR REPLACE FUNCTION public.grant_free_pro(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, granted_by_admin)
  VALUES (p_user_id, 'pro', 'active', true)
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'pro',
    status = 'active',
    granted_by_admin = true,
    updated_at = now();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_free_pro(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.grant_free_pro(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.revoke_free_pro(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE subscriptions
  SET plan = 'free', status = 'canceled', granted_by_admin = false, updated_at = now()
  WHERE user_id = p_user_id AND granted_by_admin = true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.revoke_free_pro(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.revoke_free_pro(uuid) TO service_role;

-- update_subscriptions_updated_at: plain updated_at touch trigger fn
-- (not SECURITY DEFINER — runs as invoker, no search_path needed,
-- matches the other *_updated_at trigger fns in the codebase).
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 4. Triggers
-- ═══════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 5. Lock down upvote_feature_request (in source since 043, but
--    migration 059's search_path pass missed it).
-- ═══════════════════════════════════════════════════════════════════

ALTER FUNCTION public.upvote_feature_request(uuid)
  SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.upvote_feature_request(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.upvote_feature_request(uuid) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 6. Realtime publication: admin_activity_log (live-only; not in 060)
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'admin_activity_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
  END IF;
END $$;
