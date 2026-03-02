-- Audio format conversion jobs
-- Tracks conversion requests from the UI, processed by an external worker.

CREATE TABLE IF NOT EXISTS conversion_jobs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_version_id  uuid NOT NULL REFERENCES track_audio_versions(id) ON DELETE CASCADE,
  track_id          uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  source_format     text NOT NULL,
  target_format     text NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url        text,
  output_file_size  bigint,
  error_message     text,
  requested_by      uuid NOT NULL REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  started_at        timestamptz,
  completed_at      timestamptz,
  expires_at        timestamptz NOT NULL DEFAULT now() + interval '7 days'
);

-- Worker polling: find pending jobs quickly
CREATE INDEX idx_conversion_jobs_pending
  ON conversion_jobs(status, created_at)
  WHERE status = 'pending';

-- Cache lookup: has this format already been converted for this version?
CREATE INDEX idx_conversion_jobs_cache
  ON conversion_jobs(audio_version_id, target_format, status);

-- User job history
CREATE INDEX idx_conversion_jobs_user
  ON conversion_jobs(requested_by, created_at DESC);

-- RLS
ALTER TABLE conversion_jobs ENABLE ROW LEVEL SECURITY;

-- SELECT: users who can access the track can see conversion jobs
CREATE POLICY conversion_jobs_select ON conversion_jobs
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- INSERT: authenticated users who can access the track can create jobs
CREATE POLICY conversion_jobs_insert ON conversion_jobs
  FOR INSERT WITH CHECK (
    requested_by = (SELECT auth.uid())
    AND track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

-- DELETE: users can clean up their own jobs
CREATE POLICY conversion_jobs_delete ON conversion_jobs
  FOR DELETE USING (
    requested_by = (SELECT auth.uid())
  );

-- No UPDATE policy for authenticated users.
-- Only the worker (using service_role key) updates job status.
