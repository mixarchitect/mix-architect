-- Retire the per-customer verified-sending-domain feature.
--
-- Studio branded email is now shared-domain + display name + Reply-To (migration
-- 077), so this table (and the /api/workspace/email-domain route + Resend Domains
-- API integration) is no longer read or written by the app.
--
-- ORDERING: apply this ONLY AFTER the deploy that stops reading the table (the PR
-- that rewrote getWorkspaceSenderFrom). Dropping it before that deploy would break
-- live sender resolution on the still-running old code.

drop table if exists public.workspace_email_domains;
