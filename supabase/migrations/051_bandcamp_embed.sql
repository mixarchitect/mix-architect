-- Add bandcamp_embed column to featured_releases
-- Stores the raw Bandcamp embed code (iframe HTML) pasted from Bandcamp's share/embed dialog.
-- The src is extracted at render time for safe iframe rendering.

alter table public.featured_releases
  add column if not exists bandcamp_embed text;
