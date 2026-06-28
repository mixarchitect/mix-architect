-- 067_workspace_release_access.sql
-- Studio A2 — Phase 1: workspace-membership release access (ADDITIVE).
--
-- Adds a third access path to accessible_release_ids(): a member of a release's
-- workspace can access that release, with read/write gated by their workspace
-- role. This is the keystone of Studio teams — almost every release-scoped RLS
-- policy funnels through this one function, so this single change cascades to
-- releases, tracks, all track_*, portal_*, brief_shares, distribution, etc.
--
-- ADDITIVE / NO-OP for current data: every user is a workspace-of-one today, so
-- the new branch returns only releases the user already owns. It grants no new
-- access until a second member joins a workspace (A3 invites). Verified by the
-- read-only proof in the PR (zero new (user, release) access pairs on prod).
--
-- Role gate: viewer = read-only (returned for p_min_role = 'client' only);
-- owner/admin/engineer = read + write (returned for 'client' and 'collaborator').
-- The existing owner + per-release release_members paths are unchanged.
--
-- SECURITY DEFINER + locked search_path are preserved: the function reads
-- releases/workspace_members as the definer, bypassing RLS, so it cannot recurse
-- into the very policies that call it.

CREATE OR REPLACE FUNCTION public.accessible_release_ids(p_min_role text DEFAULT 'client'::text)
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
  -- 1. Releases you own.
  SELECT id FROM releases WHERE user_id = (select auth.uid())
  UNION ALL
  -- 2. Releases shared with you per-release (release_members).
  SELECT release_id FROM release_members
  WHERE user_id = (select auth.uid())
    AND accepted_at IS NOT NULL
    AND (p_min_role = 'client' OR role = 'collaborator')
  UNION ALL
  -- 3. Releases in workspaces you belong to (Studio teams).
  SELECT r.id FROM releases r
  JOIN workspace_members wm ON wm.workspace_id = r.workspace_id
  WHERE wm.user_id = (select auth.uid())
    AND wm.accepted_at IS NOT NULL
    AND (p_min_role = 'client' OR wm.role IN ('owner', 'admin', 'engineer'))
$function$;
