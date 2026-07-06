-- Fix: new releases were created with workspace_id = NULL.
--
-- Migration 063 backfilled workspace_id only for releases that existed then, and
-- nothing sets it at insert time (the app insert omits it; there was no trigger).
-- So every release created after 063 had a null workspace_id, which silently
-- disabled all workspace-scoped features for it: portal branding (studio logo +
-- accent), removing "Powered by Mix Architect", branded client email, and team
-- (workspace_members) access.
--
-- Stamp workspace_id from the owner's default (earliest) workspace on insert when
-- not provided, and backfill any existing null rows. Mirrors the roster-row
-- stamping pattern from migration 071.

create or replace function public.stamp_release_workspace_id()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.workspace_id is null and new.user_id is not null then
    select id into new.workspace_id
    from public.workspaces
    where owner_user_id = new.user_id
    order by created_at asc
    limit 1;
  end if;
  return new;
end;
$$;

-- Trigger-invoked only — not callable directly (REVOKE FROM public is not enough;
-- anon/authenticated get EXECUTE via default privileges, so revoke explicitly).
revoke execute on function public.stamp_release_workspace_id() from public, anon, authenticated;

drop trigger if exists releases_stamp_workspace_id on public.releases;
create trigger releases_stamp_workspace_id
  before insert on public.releases
  for each row execute function public.stamp_release_workspace_id();

-- Backfill existing null-workspace releases to the owner's default workspace.
update public.releases r
set workspace_id = (
  select id from public.workspaces w
  where w.owner_user_id = r.user_id
  order by w.created_at asc
  limit 1
)
where r.workspace_id is null;
