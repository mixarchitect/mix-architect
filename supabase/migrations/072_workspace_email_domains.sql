-- 072_workspace_email_domains.sql
-- Studio A4: per-workspace branded email sender.
-- A Studio workspace can verify its own domain (via Resend) so client-facing
-- emails send from e.g. noreply@theirstudio.com instead of team@mixarchitect.com.
-- One domain per workspace. Owner-only; the email-sending code reads the verified
-- sender via the service client (bypassing RLS).

CREATE TABLE IF NOT EXISTS public.workspace_email_domains (
  workspace_id     uuid PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  domain           text NOT NULL,
  resend_domain_id text,
  status           text NOT NULL DEFAULT 'pending',   -- pending | verified | failed
  dns_records      jsonb,                              -- records the customer must add
  sender_local     text NOT NULL DEFAULT 'noreply',    -- local-part: noreply@<domain>
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_email_domains ENABLE ROW LEVEL SECURITY;

-- Owner of the workspace manages its email domain.
CREATE POLICY workspace_email_domains_owner ON public.workspace_email_domains
  FOR ALL
  USING (workspace_id IN (SELECT owned_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT owned_workspace_ids()));
