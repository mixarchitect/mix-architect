-- 067_workspace_release_access_test.sql
-- Cross-workspace denial + role matrix for accessible_release_ids() (Studio A2, Phase 1).
--
-- SAFE: the whole thing runs in one transaction and ROLLS BACK — no data persists.
-- It uses existing auth.users as actors (no auth.users inserts → no signup-trigger noise).
-- Requires migration 067 to be applied first.
--
-- Run:  psql "$DATABASE_URL" -f supabase/tests/067_workspace_release_access_test.sql
--   or paste into the Supabase SQL editor (ideally on a dev branch).
-- A failing ASSERT aborts with the message; success prints the PASS notice.

BEGIN;

DO $$
DECLARE
  u_owner    uuid;
  u_viewer   uuid;
  u_engineer uuid;
  u_outsider uuid;
  ws  uuid := gen_random_uuid();
  rel uuid := gen_random_uuid();
BEGIN
  -- Four distinct real users as actors.
  SELECT id INTO u_owner    FROM auth.users ORDER BY created_at LIMIT 1;
  SELECT id INTO u_viewer   FROM auth.users WHERE id <> u_owner ORDER BY created_at LIMIT 1;
  SELECT id INTO u_engineer FROM auth.users WHERE id NOT IN (u_owner, u_viewer) ORDER BY created_at LIMIT 1;
  SELECT id INTO u_outsider FROM auth.users WHERE id NOT IN (u_owner, u_viewer, u_engineer) ORDER BY created_at LIMIT 1;
  IF u_outsider IS NULL THEN
    RAISE EXCEPTION 'Need at least 4 users in auth.users to run this test';
  END IF;

  -- Fixture: one Studio workspace, three members, one release in it.
  INSERT INTO workspaces (id, owner_user_id, name, plan) VALUES (ws, u_owner, 'TEST WS', 'studio');
  INSERT INTO workspace_members (workspace_id, user_id, role, accepted_at) VALUES
    (ws, u_owner,    'owner',    now()),
    (ws, u_viewer,   'viewer',   now()),
    (ws, u_engineer, 'engineer', now());
  INSERT INTO releases (id, user_id, workspace_id, title) VALUES (rel, u_owner, ws, 'TEST REL');

  -- Impersonation: accessible_release_ids() is SECURITY DEFINER and reads auth.uid(),
  -- which resolves from request.jwt.claims->>'sub'. set_config(..., true) is txn-local.

  -- viewer → read-only
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_viewer)::text, true);
  ASSERT      rel IN (SELECT accessible_release_ids('client')),       'viewer should READ the workspace release';
  ASSERT NOT (rel IN (SELECT accessible_release_ids('collaborator'))),'viewer should NOT WRITE (read-only)';

  -- engineer → read + write
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_engineer)::text, true);
  ASSERT rel IN (SELECT accessible_release_ids('client')),       'engineer should READ';
  ASSERT rel IN (SELECT accessible_release_ids('collaborator')), 'engineer should WRITE';

  -- outsider → no membership → isolation
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_outsider)::text, true);
  ASSERT NOT (rel IN (SELECT accessible_release_ids('client'))), 'outsider must NOT see another workspace''s release';

  -- unaccepted invite → no access
  UPDATE workspace_members SET accepted_at = NULL WHERE workspace_id = ws AND user_id = u_viewer;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_viewer)::text, true);
  ASSERT NOT (rel IN (SELECT accessible_release_ids('client'))), 'unaccepted member must NOT have access';

  RAISE NOTICE 'PASS — read/write by role, cross-workspace isolation, unaccepted-invite denial.';
END $$;

ROLLBACK;
