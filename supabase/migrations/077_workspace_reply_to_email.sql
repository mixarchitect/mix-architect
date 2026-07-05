-- Studio branded email (lightweight): where client replies should go.
--
-- Client emails now send from the shared, verified team@mixarchitect.com under
-- the studio's display name (see src/lib/email/workspace-sender.ts). This column
-- is the Reply-To so client replies reach the studio rather than Mix Architect.
-- Nullable — the app falls back to the workspace owner's account email when unset.
-- Studio-gated in app code; workspace_branding RLS (owner-scoped) already covers
-- this column, so no new policy is required.

alter table public.workspace_branding
  add column if not exists reply_to_email text;
