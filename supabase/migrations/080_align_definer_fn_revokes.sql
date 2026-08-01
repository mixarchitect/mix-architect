-- Align EXECUTE revokes on SECURITY DEFINER functions with the project
-- convention: revoke from public AND anon (Supabase's default privileges
-- grant EXECUTE to anon/authenticated explicitly, so revoking public alone
-- is insufficient — see migration 065); authenticated keeps EXECUTE only
-- where the function is intentionally user-callable (RLS helpers, RPCs).
--
-- CREATE OR REPLACE preserves prior grants, so several later migrations
-- (067, 068, 069, 070, 071, 074) silently relied on earlier revokes or
-- omitted one leg. No behavior change intended — this restates the target
-- state explicitly so it is drift-proof and auditable in one place.

-- Trigger-invoked only (return type `trigger` — not RPC-callable anyway):
revoke execute on function public.sync_workspace_plan_from_subscription() from public, anon, authenticated;
revoke execute on function public.stamp_owner_workspace_id() from public, anon, authenticated;
revoke execute on function public.stamp_release_workspace_id() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Used inside RLS policies / called via RPC by signed-in users:
-- authenticated must keep EXECUTE; anon and public must not have it.
revoke execute on function public.admin_workspace_ids() from public, anon;
revoke execute on function public.claim_pending_invites() from public, anon;
revoke execute on function public.accessible_release_ids(text) from public, anon;
revoke execute on function public.user_workspace_ids() from public, anon;
revoke execute on function public.owned_workspace_ids() from public, anon;
