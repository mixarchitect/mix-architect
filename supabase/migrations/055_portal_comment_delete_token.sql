-- Adds an opaque per-comment delete token used to authorize portal-side
-- deletes. The previous DELETE check compared the client-supplied
-- author_name to revision_notes.author, which any portal visitor with
-- the share token could spoof (the default author is "Client", so all
-- default-named comments were deletable by anyone).
--
-- New flow:
--   * POST /api/portal/comment generates a UUID, stores it in this
--     column, and returns it in the response body. The portal client
--     stashes it in localStorage keyed by comment id.
--   * DELETE /api/portal/comment requires the caller to send the same
--     token; the server compares server-side. No HMAC secret needed.
--
-- Existing rows have NULL — they cannot be deleted from the portal.
-- That's intentional: those comments were created before the fix
-- shipped, and the release owner can still delete them via the app.

ALTER TABLE revision_notes
  ADD COLUMN IF NOT EXISTS delete_token uuid;

-- No index needed: lookups always have comment_id (PK) plus the token,
-- so we just compare the column on the row.

COMMENT ON COLUMN revision_notes.delete_token IS
  'Opaque UUID set on portal-comment creation; required to delete from portal. NULL for non-portal-authored notes (which use app-side auth).';
