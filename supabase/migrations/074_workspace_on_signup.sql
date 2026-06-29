-- 074_workspace_on_signup.sql
-- Fix: new signups had no personal workspace. Session 1 (063) backfilled a
-- workspace per user that existed AT MIGRATION TIME, but handle_new_user() only
-- creates a profile — so every signup since has had no workspace, which makes
-- all workspace features (portal branding, team members, branded email, custom
-- domain) fail with "new row violates row-level security policy" (the resolved
-- workspace_id is null → not in owned_workspace_ids()).
--
-- This (1) extends the signup trigger to create a personal workspace + owner
-- membership, and (2) backfills any existing user currently missing one.

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_workspace_id uuid;
  v_name text;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'My'
  ) || '''s Workspace';

  INSERT INTO public.workspaces (owner_user_id, name, plan)
  VALUES (new.id, v_name, 'free')
  RETURNING id INTO v_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, invited_email, role, accepted_at)
  VALUES (v_workspace_id, new.id, coalesce(new.email, new.id::text), 'owner', now());

  RETURN new;
END;
$function$;

-- Backfill: create a personal workspace + owner membership for any user who
-- lacks one (plan mirrors their active subscription, else 'free').
WITH new_ws AS (
  INSERT INTO public.workspaces (owner_user_id, name, plan)
  SELECT u.id,
         coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
                  nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
                  'My') || '''s Workspace',
         coalesce((select s.plan from public.subscriptions s
                   where s.user_id = u.id and s.status in ('active','trialing') limit 1), 'free')
  FROM auth.users u
  WHERE not exists (select 1 from public.workspaces w where w.owner_user_id = u.id)
  RETURNING id, owner_user_id
)
INSERT INTO public.workspace_members (workspace_id, user_id, invited_email, role, accepted_at)
SELECT nw.id, nw.owner_user_id, coalesce(u.email, nw.owner_user_id::text), 'owner', now()
FROM new_ws nw
JOIN auth.users u ON u.id = nw.owner_user_id;
