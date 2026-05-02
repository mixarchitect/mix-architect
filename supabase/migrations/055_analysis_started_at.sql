-- Adds a timestamp the worker stamps when it claims a row for analysis.
-- The previous claim path set spec_analysis_status='analyzing' (or
-- analysis_version=0 sentinel for backfill rows) but recorded no
-- timestamp, so a SIGTERM/OOM mid-analysis stranded the row in that
-- state forever. The worker reclaim sweep uses analysis_started_at to
-- decide which rows are old enough to reset.
--
-- Backfill rows already stamped with analysis_version=0 stay claimable
-- via the existing path (their analysis_started_at is NULL and the
-- reclaim sweep below treats NULL as "claim is from before this
-- column existed → reset").

ALTER TABLE track_audio_versions
  ADD COLUMN IF NOT EXISTS analysis_started_at timestamptz;

COMMENT ON COLUMN track_audio_versions.analysis_started_at IS
  'When the worker last claimed this row for analysis. Used by the worker reclaim sweep to recover rows abandoned mid-analysis.';
