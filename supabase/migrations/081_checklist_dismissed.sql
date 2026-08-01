-- Getting-started checklist dismissal.
--
-- The dashboard shows a 4-step checklist (create release → add track →
-- upload audio → share) to new users. Steps auto-complete from real data,
-- and the whole card disappears once all four are done — this column only
-- records an explicit "dismiss" so it stays dismissed across devices.

alter table public.user_defaults
  add column if not exists checklist_dismissed boolean not null default false;
