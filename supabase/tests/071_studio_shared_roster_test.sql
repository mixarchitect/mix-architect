-- 071_studio_shared_roster_test.sql
-- Phase 3: workspace members share the roster (saved_contacts). Rollback-safe.
-- Requires 071 applied. Run: psql "$DATABASE_URL" -f supabase/tests/071_studio_shared_roster_test.sql

BEGIN;

DO $$
DECLARE
  u_owner uuid; u_member uuid; u_outsider uuid;
  ws uuid := gen_random_uuid();
  contact uuid := gen_random_uuid();
  stamp_contact uuid := gen_random_uuid();
  n int; stamped uuid;
BEGIN
  SELECT id INTO u_owner    FROM auth.users ORDER BY created_at LIMIT 1;
  SELECT id INTO u_member   FROM auth.users WHERE id <> u_owner ORDER BY created_at LIMIT 1;
  SELECT id INTO u_outsider FROM auth.users WHERE id NOT IN (u_owner, u_member) ORDER BY created_at LIMIT 1;
  IF u_outsider IS NULL THEN RAISE EXCEPTION 'Need at least 3 users'; END IF;

  INSERT INTO workspaces (id, owner_user_id, name, plan) VALUES (ws, u_owner, 'TEST WS', 'studio');
  INSERT INTO workspace_members (workspace_id, user_id, invited_email, role, accepted_at) VALUES
    (ws, u_owner,  'o@t.local', 'owner',    now()),
    (ws, u_member, 'm@t.local', 'engineer', now());

  -- shared contact in the workspace + a NULL-workspace contact for the stamp trigger
  INSERT INTO saved_contacts (id, user_id, person_name, workspace_id) VALUES (contact, u_owner, 'Shared Client', ws);
  INSERT INTO saved_contacts (id, user_id, person_name) VALUES (stamp_contact, u_owner, 'Auto Stamp');
  SELECT workspace_id INTO stamped FROM saved_contacts WHERE id = stamp_contact;
  ASSERT stamped IS NOT NULL, 'stamp trigger should set workspace_id on a new contact';

  SET LOCAL ROLE authenticated;  -- enforce RLS

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_member)::text, true);
  SELECT count(*) INTO n FROM saved_contacts WHERE id = contact;
  ASSERT n = 1, 'workspace member should see the shared contact';

  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_outsider)::text, true);
  SELECT count(*) INTO n FROM saved_contacts WHERE id = contact;
  ASSERT n = 0, 'outsider should NOT see the shared contact';

  RESET ROLE;
  RAISE NOTICE 'PASS — member shares roster, outsider isolated, stamp trigger works.';
END $$;

ROLLBACK;
