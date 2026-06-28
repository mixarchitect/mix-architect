-- 069_workspace_release_write_test.sql
-- A2 Phase 2: workspace write-roles can edit releases; viewers can't; owner/admin delete.
-- SAFE: runs in one transaction and ROLLS BACK. Requires 067 + 069 applied.
-- Switches to the `authenticated` role so RLS is actually enforced.
-- Run: psql "$DATABASE_URL" -f supabase/tests/069_workspace_release_write_test.sql

BEGIN;

DO $$
DECLARE
  u_owner uuid; u_engineer uuid; u_viewer uuid; u_admin uuid;
  ws uuid := gen_random_uuid(); rel uuid := gen_random_uuid();
  n int;
BEGIN
  SELECT id INTO u_owner    FROM auth.users ORDER BY created_at LIMIT 1;
  SELECT id INTO u_engineer FROM auth.users WHERE id <> u_owner ORDER BY created_at LIMIT 1;
  SELECT id INTO u_viewer   FROM auth.users WHERE id NOT IN (u_owner, u_engineer) ORDER BY created_at LIMIT 1;
  SELECT id INTO u_admin    FROM auth.users WHERE id NOT IN (u_owner, u_engineer, u_viewer) ORDER BY created_at LIMIT 1;
  IF u_admin IS NULL THEN RAISE EXCEPTION 'Need at least 4 users in auth.users'; END IF;

  INSERT INTO workspaces (id, owner_user_id, name, plan) VALUES (ws, u_owner, 'TEST WS', 'studio');
  INSERT INTO workspace_members (workspace_id, user_id, invited_email, role, accepted_at) VALUES
    (ws, u_owner,    'o@t.local', 'owner',    now()),
    (ws, u_engineer, 'e@t.local', 'engineer', now()),
    (ws, u_viewer,   'v@t.local', 'viewer',   now()),
    (ws, u_admin,    'a@t.local', 'admin',    now());
  INSERT INTO releases (id, user_id, workspace_id, title) VALUES (rel, u_owner, ws, 'TEST REL');

  SET LOCAL ROLE authenticated;  -- enforce RLS as a signed-in user

  -- write-role member can edit (the WITH CHECK fix)
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_engineer)::text, true);
  UPDATE releases SET title = 'edited' WHERE id = rel; GET DIAGNOSTICS n = ROW_COUNT;
  ASSERT n = 1, 'engineer (write role) should UPDATE the workspace release';

  -- viewer cannot edit
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_viewer)::text, true);
  UPDATE releases SET title = 'nope' WHERE id = rel; GET DIAGNOSTICS n = ROW_COUNT;
  ASSERT n = 0, 'viewer should NOT UPDATE (read-only)';

  -- engineer cannot delete (owner/admin only)
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_engineer)::text, true);
  DELETE FROM releases WHERE id = rel; GET DIAGNOSTICS n = ROW_COUNT;
  ASSERT n = 0, 'engineer should NOT DELETE (owner/admin only)';

  -- admin can delete
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_admin)::text, true);
  DELETE FROM releases WHERE id = rel; GET DIAGNOSTICS n = ROW_COUNT;
  ASSERT n = 1, 'admin should DELETE the workspace release';

  RESET ROLE;
  RAISE NOTICE 'PASS — write-role edit, viewer read-only, engineer cannot delete, admin can.';
END $$;

ROLLBACK;
