-- Admin "reset account" support.
--
-- An admin can reset a user: their sessions are revoked, they get a password
-- reset email, and onboarding replays. Their existing releases are PARKED
-- (soft-deleted) rather than destroyed, and the user chooses during onboarding
-- whether to bring them back or start fresh. A "start fresh" choice is also a
-- soft delete, so an admin can still recover it later.

-- ── 1. Soft-delete marker on releases ──────────────────────────────────
alter table public.releases
  add column if not exists deleted_at timestamptz;

-- Most reads filter on "not deleted"; keep the common lookup cheap.
create index if not exists releases_user_active_idx
  on public.releases (user_id)
  where deleted_at is null;

-- ── 2. Reset marker on the user's settings row ─────────────────────────
-- Set when an admin resets the account, cleared when the user finishes the
-- restore-or-delete step. Its presence is what makes onboarding show that step.
alter table public.user_defaults
  add column if not exists account_reset_at timestamptz;

-- ── 3. Hide soft-deleted releases everywhere ───────────────────────────
-- releases_select (and ~60 child-table policies) funnel through this one
-- function, so filtering here removes parked releases from the whole app
-- without touching individual queries. Semantics are otherwise unchanged from
-- migration 067: only the deleted_at filters are new.
create or replace function public.accessible_release_ids(p_min_role text default 'client')
returns setof uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  -- 1. Releases you own.
  SELECT id FROM releases
  WHERE user_id = (select auth.uid())
    AND deleted_at IS NULL
  UNION ALL
  -- 2. Releases shared with you per-release (release_members).
  SELECT rm.release_id FROM release_members rm
  WHERE rm.user_id = (select auth.uid())
    AND rm.accepted_at IS NOT NULL
    AND (p_min_role = 'client' OR rm.role = 'collaborator')
    AND EXISTS (
      SELECT 1 FROM releases r2
      WHERE r2.id = rm.release_id AND r2.deleted_at IS NULL
    )
  UNION ALL
  -- 3. Releases in workspaces you belong to (Studio teams).
  SELECT r.id FROM releases r
  JOIN workspace_members wm ON wm.workspace_id = r.workspace_id
  WHERE wm.user_id = (select auth.uid())
    AND wm.accepted_at IS NOT NULL
    AND r.deleted_at IS NULL
    AND (p_min_role = 'client' OR wm.role IN ('owner', 'admin', 'engineer'))
$$;

revoke execute on function public.accessible_release_ids(text) from public, anon;

-- ── 4. Parked releases must not count against the free-plan limit ──────
-- Otherwise a free user who chooses "start fresh" still cannot create one.
create or replace function public.can_create_release(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
DECLARE
  sub_plan text;
  release_count int;
BEGIN
  SELECT plan INTO sub_plan FROM subscriptions
    WHERE user_id = p_user_id AND status IN ('active', 'trialing');
  IF sub_plan IN ('pro', 'studio') THEN RETURN true; END IF;
  SELECT count(*) INTO release_count FROM releases
    WHERE user_id = p_user_id AND deleted_at IS NULL;
  RETURN release_count < 1;
END;
$$;

revoke execute on function public.can_create_release(uuid) from public, anon;

-- ── 5. Force sign-out ──────────────────────────────────────────────────
-- supabase-js only exposes auth.admin.signOut(jwt), which needs the user's own
-- token, so an admin cannot revoke sessions through the SDK. Deleting the
-- GoTrue session rows does it. Service-role only: never callable by a user.
-- (refresh_tokens.user_id is varchar in GoTrue while sessions.user_id is uuid.)
create or replace function public.admin_revoke_user_sessions(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
BEGIN
  DELETE FROM auth.refresh_tokens WHERE user_id = p_user_id::text;
  DELETE FROM auth.sessions WHERE user_id = p_user_id;
END;
$$;

revoke execute on function public.admin_revoke_user_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_user_sessions(uuid) to service_role;
