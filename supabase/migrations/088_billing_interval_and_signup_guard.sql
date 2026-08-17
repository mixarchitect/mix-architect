-- 088: billing interval on subscriptions + idempotent signup trigger
--
-- 1. subscriptions.billing_interval: the daily MRR check previously
--    inferred monthly vs annual from (current_period_end - created_at),
--    which reads a field the webhook was never advancing. Record the
--    fact from the Stripe price object instead. Backfill for existing
--    rows happens via scripts/stripe-billing-audit.mjs (one-off), not here.
--
-- 2. handle_new_user(): the profiles insert had no duplicate guard,
--    unlike the email_preferences insert in the same function. A re-run,
--    backfill, or manual auth.users insert would raise 23505 and abort
--    user creation. ON CONFLICT DO NOTHING makes it idempotent.

-- ── 1. billing_interval ─────────────────────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_interval text;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_billing_interval_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_billing_interval_check
  CHECK (billing_interval IS NULL OR billing_interval IN ('month', 'year'));

-- ── 2. idempotent handle_new_user ───────────────────────────────────
-- Verbatim copy of 084's function with ON CONFLICT guards added to the
-- profiles insert (id is the auth user id / PK).
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
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

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

-- CREATE OR REPLACE preserves existing ACLs, but per repo convention
-- (see 065/080) restate the revokes explicitly so the definer fn is
-- never callable by anon/authenticated regardless of default privileges.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
