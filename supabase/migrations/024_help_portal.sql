-- Help Portal: bug reports, feature requests, and voting

-- Bug Reports
create table public.bug_reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  title       text not null,
  description text not null,
  steps       text,
  severity    text not null check (severity in ('low', 'medium', 'high', 'critical')),
  page_url    text,
  user_agent  text,
  status      text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'wont_fix'))
);

alter table public.bug_reports enable row level security;

create policy "Users can submit bug reports"
  on public.bug_reports for insert
  with check (true);

create policy "Users can view their own bug reports"
  on public.bug_reports for select
  using (auth.uid() = user_id);

-- Feature Requests
create table public.feature_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  user_id      uuid references auth.users(id) on delete set null,
  email        text,
  title        text not null,
  description  text not null,
  category     text not null check (category in (
                 'workflow', 'audio', 'collaboration', 'integrations',
                 'distribution', 'payments', 'mobile', 'other'
               )),
  vote_count   integer not null default 1,
  status       text not null default 'under_review' check (status in (
                 'under_review', 'planned', 'in_progress', 'shipped', 'declined'
               ))
);

alter table public.feature_requests enable row level security;

create policy "Anyone can view feature requests"
  on public.feature_requests for select using (true);

create policy "Authenticated users can submit feature requests"
  on public.feature_requests for insert
  with check (auth.uid() is not null);

-- Feature Request Votes
create table public.feature_request_votes (
  id                  uuid primary key default gen_random_uuid(),
  feature_request_id  uuid not null references public.feature_requests(id) on delete cascade,
  user_id             uuid references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),
  unique (feature_request_id, user_id)
);

alter table public.feature_request_votes enable row level security;

create policy "Authenticated users can vote"
  on public.feature_request_votes for insert
  with check (auth.uid() is not null);

create policy "Users can view their own votes"
  on public.feature_request_votes for select
  using (auth.uid() = user_id);

-- Atomic upvote function
create or replace function public.upvote_feature_request(request_id uuid)
returns void
language plpgsql security definer as $$
begin
  insert into public.feature_request_votes (feature_request_id, user_id)
  values (request_id, auth.uid());

  update public.feature_requests
  set vote_count = vote_count + 1
  where id = request_id;
end;
$$;
