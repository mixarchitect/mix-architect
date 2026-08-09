-- The welcome email used to be triggered by a client-side fetch that keyed the
-- recipient off the caller's session cookie. Confirmation-gated signUp() creates
-- no session, so the send either never fired (401) or went to whoever was
-- already signed in. Enqueue the send in the DB instead, at user creation, with
-- the recipient taken from the created auth.users row; the app drains the
-- outbox server-side (signup route, auth callback, activity log, cron).

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  display_name text,
  category text NOT NULL DEFAULT 'welcome',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'skipped', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS email_outbox_pending_idx
  ON public.email_outbox (status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS email_outbox_user_idx
  ON public.email_outbox (user_id);

-- Service-role only, like email_log: RLS on, no policies.
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

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

  IF new.email IS NOT NULL THEN
    INSERT INTO public.email_outbox (user_id, to_email, display_name, category)
    VALUES (
      new.id,
      new.email,
      coalesce(
        nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
        split_part(new.email, '@', 1)
      ),
      'welcome'
    );
  END IF;

  RETURN new;
END;
$function$;

-- Deliberately no backfill: existing accounts should not receive a welcome
-- email days after signing up.
