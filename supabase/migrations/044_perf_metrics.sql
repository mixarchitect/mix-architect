-- Performance metrics collected from client-side audio playback instrumentation.
-- Rows are inserted via /api/perf/ingest from the browser.

create table if not exists perf_metrics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  text not null,            -- random ID per browser session
  metric      text not null,            -- e.g. "wavesurfer:init", "waveform:render"
  duration_ms double precision not null, -- measured duration in milliseconds
  created_at  timestamptz not null default now(),

  -- Audio file context (nullable — not all metrics relate to a specific file)
  track_id    uuid,
  version_id  uuid,
  file_format text,                     -- "wav", "mp3", "flac", etc.
  file_size_mb double precision,
  duration_sec double precision,        -- audio duration in seconds
  sample_rate integer,
  bit_depth   integer,
  channels    integer,

  -- FPS-specific fields (null for timing marks)
  avg_fps     double precision,
  min_fps     double precision,
  p5_fps      double precision,
  dropped_frames integer,
  jank_frames integer,

  -- Client context
  user_agent  text,
  device_type text                      -- "desktop", "tablet", "mobile"
);

-- Index for admin dashboard queries: metric + time range
create index idx_perf_metrics_metric_created on perf_metrics (metric, created_at desc);

-- Index for per-user lookups
create index idx_perf_metrics_user on perf_metrics (user_id, created_at desc);

-- RLS: users can insert their own rows, only admins can read
alter table perf_metrics enable row level security;

create policy "Users can insert own perf metrics"
  on perf_metrics for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all perf metrics"
  on perf_metrics for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );
