-- 069_workspace_release_write.sql
-- Studio A2 Phase 2: let workspace write-roles edit releases, and owner/admin delete them.
--
-- Phase 1 (067) gave workspace members READ + (for write roles) write *visibility*
-- via accessible_release_ids('collaborator'). But three policies still keyed on
-- releases.user_id and blocked non-owner team members from actually mutating:
--   * releases_update.WITH CHECK = (user_id = auth.uid()) — a non-owner edit keeps
--     the owner's user_id on the row, so the check FAILED. Effectively owner-only
--     edits despite the USING clause. (This was a latent bug even pre-teams.)
--   * releases_delete = owner-only.
--   * brief_shares_delete (portal shares) = owner-only, while insert/update already
--     allow collaborators.
--
-- Role model (per A2 design): owner/admin/engineer = write; viewer = read;
-- delete = owner/admin only.

-- ── Helper: workspaces where the current user is owner or admin ──────────────
-- (write + manage). Mirrors user_workspace_ids()/owned_workspace_ids(): SECURITY
-- DEFINER + locked search_path, EXECUTE kept for authenticated, revoked for anon.
CREATE OR REPLACE FUNCTION public.admin_workspace_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
  SELECT workspace_id FROM workspace_members
  WHERE user_id = (select auth.uid())
    AND accepted_at IS NOT NULL
    AND role IN ('owner', 'admin')
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_workspace_ids() FROM anon;

-- ── releases_update: fix the WITH CHECK so write-role members can edit ───────
-- Mirror USING — the updated row must remain in the editor's write-accessible
-- set (so they also can't move a release into a workspace they can't write).
ALTER POLICY releases_update ON public.releases
  WITH CHECK (id IN (SELECT accessible_release_ids('collaborator')));

-- ── releases_delete: owner OR a workspace owner/admin ────────────────────────
ALTER POLICY releases_delete ON public.releases
  USING (
    user_id = (select auth.uid())
    OR workspace_id IN (SELECT admin_workspace_ids())
  );

-- ── brief_shares_delete: allow collaborators (align with insert/update) ──────
ALTER POLICY brief_shares_delete ON public.brief_shares
  USING (release_id IN (SELECT accessible_release_ids('collaborator')));

-- ── Hygiene: the 068 trigger fn is trigger-only, never an RPC ────────────────
REVOKE EXECUTE ON FUNCTION public.sync_workspace_plan_from_subscription() FROM anon, authenticated;
