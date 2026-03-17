-- Time entries: log hours worked against releases
-- Supports both manual entry and timer-generated entries
-- Engineer-side only — never exposed to client portal

CREATE TABLE public.release_time_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  hours       numeric(6,2) NOT NULL,
  rate        numeric(10,2),
  description text,
  entry_type  text NOT NULL DEFAULT 'manual'
    CHECK (entry_type IN ('manual', 'timer')),
  started_at  timestamptz,
  ended_at    timestamptz,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fetching time entries by release
CREATE INDEX idx_release_time_entries_release_id ON release_time_entries(release_id);

-- RLS
ALTER TABLE release_time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own time entries"
  ON release_time_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp (reuse existing set_updated_at function)
CREATE TRIGGER release_time_entries_updated
  BEFORE UPDATE ON release_time_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add default hourly rate to user_defaults
ALTER TABLE public.user_defaults
  ADD COLUMN IF NOT EXISTS default_hourly_rate numeric(10,2);
