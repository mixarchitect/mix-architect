-- Extend track_audio_versions with channels, codec, and analysis status.
-- sample_rate, bit_depth, file_format, duration_seconds already exist.

ALTER TABLE track_audio_versions
  ADD COLUMN IF NOT EXISTS channels              INTEGER,
  ADD COLUMN IF NOT EXISTS codec                 TEXT,
  ADD COLUMN IF NOT EXISTS spec_analysis_status  TEXT DEFAULT 'pending'
    CHECK (spec_analysis_status IN ('pending', 'analyzing', 'complete', 'failed'));

-- Worker polling: find pending analysis jobs quickly
CREATE INDEX IF NOT EXISTS idx_audio_versions_analysis_pending
  ON track_audio_versions(spec_analysis_status, created_at)
  WHERE spec_analysis_status = 'pending';
