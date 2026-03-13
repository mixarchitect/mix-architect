-- Featured Releases: curated release spotlights for marketing and SEO

create table public.featured_releases (
  id uuid primary key default gen_random_uuid(),

  -- Core content
  slug text unique not null,
  title text not null,
  artist_name text not null,
  release_type text not null default 'album'
    check (release_type in ('single', 'ep', 'album')),

  -- Source: platform user release or external
  source text not null default 'external'
    check (source in ('platform', 'external')),
  release_id uuid references public.releases(id) on delete set null,

  -- Author / byline (who wrote the feature)
  author_name text not null default 'Mix Architect',
  author_bio text,
  author_url text,

  -- Writeup content
  headline text not null,
  body text not null,
  pull_quote text,

  -- Media
  cover_art_path text not null,

  -- Streaming links
  link_spotify text,
  link_apple_music text,
  link_youtube_music text,
  link_bandcamp text,
  link_soundcloud text,
  link_tidal text,
  link_amazon_music text,
  link_deezer text,
  link_website text,

  -- Metadata
  genre_tags text[] default '{}',
  credits text,
  release_date date,

  -- Feature scheduling
  featured_date date not null,
  is_active boolean not null default false,

  -- SEO
  meta_title text,
  meta_description text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_featured_releases_active on featured_releases (is_active) where is_active = true;
create index idx_featured_releases_featured_date on featured_releases (featured_date desc);
create index idx_featured_releases_slug on featured_releases (slug);

-- RLS
alter table featured_releases enable row level security;

create policy "Featured releases are publicly readable"
  on featured_releases for select
  using (true);

create policy "Only owner can insert featured releases"
  on featured_releases for insert
  with check (auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);

create policy "Only owner can update featured releases"
  on featured_releases for update
  using (auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid)
  with check (auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);

create policy "Only owner can delete featured releases"
  on featured_releases for delete
  using (auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);

-- Updated_at trigger
create or replace function update_featured_releases_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_featured_releases_updated_at
  before update on featured_releases
  for each row
  execute function update_featured_releases_updated_at();

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('featured-releases', 'featured-releases', true)
on conflict (id) do nothing;

create policy "Public read for featured release images"
  on storage.objects for select
  using (bucket_id = 'featured-releases');

create policy "Owner can upload featured release images"
  on storage.objects for insert
  with check (bucket_id = 'featured-releases' and auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);

create policy "Owner can update featured release images"
  on storage.objects for update
  using (bucket_id = 'featured-releases' and auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);

create policy "Owner can delete featured release images"
  on storage.objects for delete
  using (bucket_id = 'featured-releases' and auth.uid() = '78924073-521e-4e3c-8c8e-2e63f1161fc3'::uuid);
