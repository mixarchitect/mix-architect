-- 068_sync_workspace_plan.sql
-- Keep workspaces.plan in sync with the owner's subscription plan.
--
-- workspaces.plan was backfilled once in Session 1 (063) and never updated since.
-- Workspace-gated entitlements all read workspaces.plan: portal branding (065/
-- Session 5), Studio white-label / Powered-by removal (067 / A1), and the future
-- custom-domain / branded-email features. So when a subscription changes plan
-- (Stripe webhook, comp grant, cancellation) the workspace silently drifts — a
-- real Studio buyer would keep a 'pro'/'free' workspace and never receive the
-- Studio workspace features they paid for. This was a launch blocker.
--
-- Fix: one trigger that mirrors subscriptions.plan -> the owner's workspaces.plan
-- on every change (covers the webhook, bulk-comp, cancel-subscription, and direct
-- DB edits in a single place), plus a one-time backfill of any current drift.

CREATE OR REPLACE FUNCTION public.sync_workspace_plan_from_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  -- A workspace's plan tracks its owner's subscription. owner_user_id is the
  -- paying user, so every workspace they own inherits their plan.
  UPDATE workspaces
  SET plan = NEW.plan
  WHERE owner_user_id = NEW.user_id
    AND plan IS DISTINCT FROM NEW.plan;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_workspace_plan ON subscriptions;
CREATE TRIGGER trg_sync_workspace_plan
AFTER INSERT OR UPDATE OF plan ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_workspace_plan_from_subscription();

-- One-time backfill: realign any workspace currently drifted from its owner's plan.
UPDATE workspaces w
SET plan = s.plan
FROM subscriptions s
WHERE s.user_id = w.owner_user_id
  AND w.plan IS DISTINCT FROM s.plan;
