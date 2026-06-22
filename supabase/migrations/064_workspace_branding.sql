-- Studio tier — Session 5: Pro portal branding.
--
-- Per-workspace logo + accent color applied to the client portal.
-- Gated in the app on the `branding` entitlement (Pro: "basic",
-- Studio: "full"; Free: "none"). The data layer here is plan-agnostic;
-- enforcement is in the settings UI + at portal render time.

-- ─── 1. workspace_branding table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_branding (
  workspace_id uuid PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  -- Storage path in the workspace-logos bucket (e.g. "{user_id}/logo.png"),
  -- or null if no logo set.
  logo_path    text,
  -- Hex accent color (e.g. "#0D9488"), or null to use the default teal.
  accent_color text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_branding ENABLE ROW LEVEL SECURITY;

-- Members can read their workspace's branding (settings UI); only the
-- owner can write it. The portal reads via the service-role client, so
-- these policies don't gate public portal display.
DROP POLICY IF EXISTS workspace_branding_select ON public.workspace_branding;
CREATE POLICY workspace_branding_select ON public.workspace_branding
  FOR SELECT USING (workspace_id IN (SELECT public.user_workspace_ids()));

DROP POLICY IF EXISTS workspace_branding_insert ON public.workspace_branding;
CREATE POLICY workspace_branding_insert ON public.workspace_branding
  FOR INSERT WITH CHECK (workspace_id IN (SELECT public.owned_workspace_ids()));

DROP POLICY IF EXISTS workspace_branding_update ON public.workspace_branding;
CREATE POLICY workspace_branding_update ON public.workspace_branding
  FOR UPDATE USING (workspace_id IN (SELECT public.owned_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.owned_workspace_ids()));

DROP POLICY IF EXISTS workspace_branding_delete ON public.workspace_branding;
CREATE POLICY workspace_branding_delete ON public.workspace_branding
  FOR DELETE USING (workspace_id IN (SELECT public.owned_workspace_ids()));

-- ─── 2. workspace-logos storage bucket ─────────────────────────────
-- INTENTIONALLY PUBLIC: a studio logo is a public brand asset, shown to
-- anonymous portal visitors. Public read gives a stable URL with no
-- signing. Writes are still owner-scoped via RLS below. (The RLS audit
-- script already recognizes intentionally-public buckets.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workspace-logos',
  'workspace-logos',
  true,
  2 * 1024 * 1024,  -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2 * 1024 * 1024,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Owner-scoped writes; path convention is "{user_id}/<file>".
DROP POLICY IF EXISTS workspace_logos_insert_own ON storage.objects;
CREATE POLICY workspace_logos_insert_own
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'workspace-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS workspace_logos_update_own ON storage.objects;
CREATE POLICY workspace_logos_update_own
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'workspace-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'workspace-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS workspace_logos_delete_own ON storage.objects;
CREATE POLICY workspace_logos_delete_own
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'workspace-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
