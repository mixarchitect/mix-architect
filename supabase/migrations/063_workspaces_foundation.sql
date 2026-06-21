-- Studio tier — Session 1: workspace data model (expand phase).
--
-- Introduces workspaces + workspace_members and backfills a personal
-- 1-member workspace for every existing user. Adds NULLABLE workspace_id
-- columns to the tables that will become workspace-scoped, backfilled to
-- each owner's personal workspace.
--
-- DELIBERATELY ADDITIVE — zero behavior change:
--   * No existing RLS policy is modified.
--   * accessible_release_ids() is untouched; release access stays
--     keyed to releases.user_id exactly as today.
--   * The new workspace_id columns are nullable and unused by any read
--     path yet.
--
-- Because every user is a solo workspace-of-one today, workspace-scoped
-- access == user-scoped access. The risky cutover (rewriting
-- accessible_release_ids + flipping every release-scoped policy to
-- workspace membership) is deferred to the pre-teams session, when
-- there's an actual second member to test cross-workspace denial against.
--
-- D1 = Option B (studio as merchant): the workspace, not the user, holds
-- the plan and the Connect account. This migration captures both on the
-- workspace (backfilled from the user's current subscription + connected
-- account) but does NOT yet rewire the webhook or payment routing —
-- those flip to workspace reads in Sessions 2/3.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Tables
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.workspaces (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text NOT NULL DEFAULT 'My Workspace',
  plan                text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'studio')),
  -- Stripe Connect account that receives client payments for this
  -- workspace's releases (Option B). Null until the owner onboards.
  connected_account_id text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_user_id);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  -- Null until the invitee accepts (claimed by email, mirroring the
  -- existing release_members pattern).
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  role         text NOT NULL DEFAULT 'engineer'
                 CHECK (role IN ('owner', 'admin', 'engineer', 'viewer')),
  invited_at   timestamptz NOT NULL DEFAULT now(),
  accepted_at  timestamptz,
  UNIQUE (workspace_id, invited_email)
);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user      ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);

-- ═══════════════════════════════════════════════════════════════════
-- 2. Backfill: one personal workspace per existing user
-- ═══════════════════════════════════════════════════════════════════
-- Idempotent via NOT EXISTS — re-running never creates a second personal
-- workspace for a user.

INSERT INTO public.workspaces (owner_user_id, name, plan, connected_account_id)
SELECT
  u.id,
  COALESCE(NULLIF(ud.company_name, ''), NULLIF(p.full_name, ''), 'My Workspace'),
  COALESCE(s.plan, 'free'),
  sca.stripe_account_id
FROM auth.users u
LEFT JOIN public.user_defaults ud            ON ud.user_id = u.id
LEFT JOIN public.profiles p                  ON p.id = u.id
LEFT JOIN public.subscriptions s             ON s.user_id = u.id
LEFT JOIN public.stripe_connected_accounts sca ON sca.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.owner_user_id = u.id
);

-- Owner membership row per personal workspace.
INSERT INTO public.workspace_members (workspace_id, user_id, invited_email, role, accepted_at)
SELECT w.id, u.id, u.email, 'owner', now()
FROM public.workspaces w
JOIN auth.users u ON u.id = w.owner_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_members m
  WHERE m.workspace_id = w.id AND m.user_id = u.id
);

-- ═══════════════════════════════════════════════════════════════════
-- 3. RLS helper functions (SECURITY DEFINER → no policy recursion)
-- ═══════════════════════════════════════════════════════════════════

-- Workspaces the current user is an accepted member of.
CREATE OR REPLACE FUNCTION public.user_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
  SELECT workspace_id FROM workspace_members
  WHERE user_id = (select auth.uid()) AND accepted_at IS NOT NULL
$$;
REVOKE EXECUTE ON FUNCTION public.user_workspace_ids() FROM public;
GRANT EXECUTE ON FUNCTION public.user_workspace_ids() TO authenticated;

-- Workspaces the current user owns.
CREATE OR REPLACE FUNCTION public.owned_workspace_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
  SELECT id FROM workspaces WHERE owner_user_id = (select auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.owned_workspace_ids() FROM public;
GRANT EXECUTE ON FUNCTION public.owned_workspace_ids() TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 4. RLS on the two new tables
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- workspaces: any accepted member can read; only the owner mutates.
DROP POLICY IF EXISTS workspaces_select ON public.workspaces;
CREATE POLICY workspaces_select ON public.workspaces
  FOR SELECT USING (id IN (SELECT public.user_workspace_ids()));

DROP POLICY IF EXISTS workspaces_insert ON public.workspaces;
CREATE POLICY workspaces_insert ON public.workspaces
  FOR INSERT WITH CHECK (owner_user_id = (select auth.uid()));

DROP POLICY IF EXISTS workspaces_update ON public.workspaces;
CREATE POLICY workspaces_update ON public.workspaces
  FOR UPDATE USING (owner_user_id = (select auth.uid()))
  WITH CHECK (owner_user_id = (select auth.uid()));

DROP POLICY IF EXISTS workspaces_delete ON public.workspaces;
CREATE POLICY workspaces_delete ON public.workspaces
  FOR DELETE USING (owner_user_id = (select auth.uid()));

-- workspace_members: members see co-members; only the owner manages.
DROP POLICY IF EXISTS workspace_members_select ON public.workspace_members;
CREATE POLICY workspace_members_select ON public.workspace_members
  FOR SELECT USING (workspace_id IN (SELECT public.user_workspace_ids()));

DROP POLICY IF EXISTS workspace_members_insert ON public.workspace_members;
CREATE POLICY workspace_members_insert ON public.workspace_members
  FOR INSERT WITH CHECK (workspace_id IN (SELECT public.owned_workspace_ids()));

DROP POLICY IF EXISTS workspace_members_update ON public.workspace_members;
CREATE POLICY workspace_members_update ON public.workspace_members
  FOR UPDATE USING (workspace_id IN (SELECT public.owned_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.owned_workspace_ids()));

DROP POLICY IF EXISTS workspace_members_delete ON public.workspace_members;
CREATE POLICY workspace_members_delete ON public.workspace_members
  FOR DELETE USING (workspace_id IN (SELECT public.owned_workspace_ids()));

-- ═══════════════════════════════════════════════════════════════════
-- 5. Add nullable workspace_id to tables that become workspace-scoped
-- ═══════════════════════════════════════════════════════════════════
-- Nullable + unused by any read path for now. ON DELETE CASCADE matches
-- the eventual ownership semantics (deleting a workspace removes its data).

ALTER TABLE public.releases                  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.saved_contacts            ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions             ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.stripe_connected_accounts ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.user_defaults             ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.quotes                    ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.workflow_triggers         ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_releases_workspace                  ON public.releases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_saved_contacts_workspace            ON public.saved_contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace             ON public.subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_workspace ON public.stripe_connected_accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_defaults_workspace             ON public.user_defaults(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quotes_workspace                    ON public.quotes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workspace         ON public.workflow_triggers(workspace_id);

-- ═══════════════════════════════════════════════════════════════════
-- 6. Backfill workspace_id from each row's owner → personal workspace
-- ═══════════════════════════════════════════════════════════════════
-- Safe & deterministic: at this point every user owns exactly one
-- workspace, so owner_user_id → workspace is 1:1. The `IS NULL` guard
-- makes each statement idempotent.

UPDATE public.releases r        SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = r.user_id        AND r.workspace_id IS NULL;
UPDATE public.saved_contacts c  SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = c.user_id        AND c.workspace_id IS NULL;
UPDATE public.subscriptions s   SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = s.user_id        AND s.workspace_id IS NULL;
UPDATE public.stripe_connected_accounts a SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = a.user_id AND a.workspace_id IS NULL;
UPDATE public.user_defaults d   SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = d.user_id        AND d.workspace_id IS NULL;
UPDATE public.quotes q          SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = q.user_id        AND q.workspace_id IS NULL;
UPDATE public.workflow_triggers t SET workspace_id = w.id FROM public.workspaces w WHERE w.owner_user_id = t.user_id      AND t.workspace_id IS NULL;
