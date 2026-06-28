-- 070_claim_workspace_invites.sql
-- Studio A3: extend claim_pending_invites() to also accept workspace invites.
--
-- A workspace invite is a workspace_members row with invited_email set and
-- user_id NULL (pending). When the invited person signs in, the app calls
-- claim_pending_invites() (src/app/app/layout.tsx) — so adding the workspace
-- branch here means invites auto-accept on next load, no extra wiring.
-- The existing release_members claim is preserved unchanged.

CREATE OR REPLACE FUNCTION public.claim_pending_invites()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = (select auth.uid());
  IF v_email IS NULL THEN RETURN; END IF;

  -- Per-release collaborator invites (existing behavior).
  UPDATE release_members
  SET user_id = (select auth.uid()), accepted_at = now()
  WHERE invited_email = v_email AND user_id IS NULL;

  -- Workspace (team) invites.
  UPDATE workspace_members
  SET user_id = (select auth.uid()), accepted_at = now()
  WHERE invited_email = v_email AND user_id IS NULL;
END;
$function$;
