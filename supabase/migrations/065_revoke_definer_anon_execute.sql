-- Security fix: revoke EXECUTE on SECURITY DEFINER functions from the
-- anon/authenticated roles.
--
-- Prior migrations (058, 059, 061, 062) only did `REVOKE EXECUTE ...
-- FROM public`. But Supabase's project default privileges grant EXECUTE
-- to `anon` and `authenticated` *directly*, so those grants survived the
-- public revoke — every SECURITY DEFINER function stayed callable via
-- /rest/v1/rpc/<fn> with the public anon key.
--
-- Most critically: `grant_free_pro(p_user_id)` (SECURITY DEFINER,
-- inserts a pro/granted_by_admin subscription) was reachable by `anon`,
-- so anyone with the in-browser anon key could grant any account free
-- Pro. `revoke_free_pro` and `consume_rate_limit` were similarly exposed.
--
-- Confirmed with has_function_privilege('anon', oid, 'EXECUTE') = true
-- before this migration; false after (service-role retained throughout).

-- ─── Service-role-only: no end-user role should call these ──────────
REVOKE EXECUTE ON FUNCTION public.grant_free_pro(uuid)                       FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_free_pro(uuid)                      FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM anon, authenticated;

-- ─── Trigger-only functions: invoked by the trigger system as the ──
-- table owner, never via RPC (a direct call errors — `new`/`tg_*` are
-- unassigned outside trigger context). Postgres does not check the
-- triggering user's EXECUTE privilege, so revoking is safe.
REVOKE EXECUTE ON FUNCTION public.check_spec_mismatch()              FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_distribution_initial_status()  FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_distribution_status_change()   FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_feature_submission_status() FROM anon, authenticated;
-- NOTE: handle_new_user() (the auth.users signup trigger) retains a
-- legacy PUBLIC grant and still shows as anon-executable. Left as-is:
-- it's non-exploitable (direct RPC errors — no `new` record), and it's
-- the signup path, so we don't risk it for a cosmetic advisor item.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                  FROM anon, authenticated;

-- ─── App functions called by signed-in users (keep authenticated), ──
-- never by anon → revoke anon only.
REVOKE EXECUTE ON FUNCTION public.can_create_release(uuid)     FROM anon;
REVOKE EXECUTE ON FUNCTION public.upvote_feature_request(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_pending_invites()      FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_workspace_ids()         FROM anon;
REVOKE EXECUTE ON FUNCTION public.owned_workspace_ids()        FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_display_name(uuid)  FROM anon;
