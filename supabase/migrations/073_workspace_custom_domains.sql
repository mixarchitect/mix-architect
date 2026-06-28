-- 073_workspace_custom_domains.sql
-- Studio A5: per-workspace custom portal domain.
-- A Studio workspace registers a domain (e.g. portal.theirstudio.com); the app
-- adds it to the Vercel project via the Vercel Domains API and stores the
-- mapping. Client portals are then served at the custom domain
-- (theirdomain.com/portal/<shareToken>). Owner-only; the verification/status
-- comes from Vercel.

CREATE TABLE IF NOT EXISTS public.workspace_custom_domains (
  workspace_id uuid PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  domain       text NOT NULL UNIQUE,
  status       text NOT NULL DEFAULT 'pending',  -- pending | verified
  verification jsonb,                             -- Vercel verification / DNS records
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspace_custom_domains_owner ON public.workspace_custom_domains
  FOR ALL
  USING (workspace_id IN (SELECT owned_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT owned_workspace_ids()));
