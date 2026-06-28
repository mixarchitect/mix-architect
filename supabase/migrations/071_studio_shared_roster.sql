-- 071_studio_shared_roster.sql
-- Studio A2 Phase 3: workspace-shared roster.
-- saved_contacts, quotes (+ line items), and release_templates become visible
-- and editable to all members of the owning workspace, not just the creator.
-- (Design decision: shared roster = all team members; release content keeps the
-- finer read/write/delete role gating from 067/069.)

-- release_templates didn't get a workspace_id in Session 1 — add + index it.
ALTER TABLE public.release_templates
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_release_templates_workspace_id
  ON public.release_templates(workspace_id);

-- Backfill workspace_id to each owner's personal workspace (idempotent).
UPDATE public.saved_contacts t SET workspace_id = w.id
  FROM public.workspaces w WHERE w.owner_user_id = t.user_id AND t.workspace_id IS NULL;
UPDATE public.quotes t SET workspace_id = w.id
  FROM public.workspaces w WHERE w.owner_user_id = t.user_id AND t.workspace_id IS NULL;
UPDATE public.release_templates t SET workspace_id = w.id
  FROM public.workspaces w WHERE w.owner_user_id = t.user_id AND t.workspace_id IS NULL;

-- Stamp new rows with the creator's owned workspace so they're shared too.
CREATE OR REPLACE FUNCTION public.stamp_owner_workspace_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  IF NEW.workspace_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT id INTO NEW.workspace_id FROM workspaces
    WHERE owner_user_id = NEW.user_id ORDER BY created_at LIMIT 1;
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.stamp_owner_workspace_id() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_stamp_workspace_saved_contacts ON public.saved_contacts;
CREATE TRIGGER trg_stamp_workspace_saved_contacts
  BEFORE INSERT ON public.saved_contacts
  FOR EACH ROW EXECUTE FUNCTION public.stamp_owner_workspace_id();

DROP TRIGGER IF EXISTS trg_stamp_workspace_quotes ON public.quotes;
CREATE TRIGGER trg_stamp_workspace_quotes
  BEFORE INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.stamp_owner_workspace_id();

DROP TRIGGER IF EXISTS trg_stamp_workspace_release_templates ON public.release_templates;
CREATE TRIGGER trg_stamp_workspace_release_templates
  BEFORE INSERT ON public.release_templates
  FOR EACH ROW EXECUTE FUNCTION public.stamp_owner_workspace_id();

-- Scope policies: creator OR any member of the row's workspace.
ALTER POLICY saved_contacts_owner ON public.saved_contacts
  USING (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()))
  WITH CHECK (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()));

ALTER POLICY "Users can manage their own quotes" ON public.quotes
  USING (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()))
  WITH CHECK (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()));

ALTER POLICY "Users can manage line items on their own quotes" ON public.quote_line_items
  USING (quote_id IN (SELECT id FROM quotes
    WHERE user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids())))
  WITH CHECK (quote_id IN (SELECT id FROM quotes
    WHERE user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids())));

ALTER POLICY release_templates_owner ON public.release_templates
  USING (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()))
  WITH CHECK (user_id = (select auth.uid()) OR workspace_id IN (SELECT user_workspace_ids()));
