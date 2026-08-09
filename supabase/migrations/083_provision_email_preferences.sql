-- New signups never got an email_preferences row, which silently excluded them
-- from preference-gated sends. Provision it in handle_new_user and backfill.

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

  INSERT INTO public.email_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$function$;

INSERT INTO public.email_preferences (user_id)
SELECT p.id
FROM public.profiles p
LEFT JOIN public.email_preferences ep ON ep.user_id = p.id
WHERE ep.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
