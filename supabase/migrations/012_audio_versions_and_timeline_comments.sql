-- Audio version storage per track
CREATE TABLE IF NOT EXISTS track_audio_versions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id         uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  version_number   int NOT NULL DEFAULT 1,
  audio_url        text NOT NULL,
  file_name        text,
  file_size        bigint,
  duration_seconds numeric(8,2),
  waveform_peaks   jsonb,
  uploaded_by      text NOT NULL DEFAULT 'You',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_track_audio_versions_track
  ON track_audio_versions(track_id);

-- Extend revision_notes with timeline comment fields
ALTER TABLE revision_notes
  ADD COLUMN IF NOT EXISTS timecode_seconds numeric(8,2);
ALTER TABLE revision_notes
  ADD COLUMN IF NOT EXISTS audio_version_id uuid
    REFERENCES track_audio_versions(id) ON DELETE SET NULL;

-- RLS policies (same pattern as revision_notes in migration 004)
ALTER TABLE track_audio_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY track_audio_versions_select ON track_audio_versions
  FOR SELECT USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
    OR track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT release_id FROM brief_shares)
    )
  );

CREATE POLICY track_audio_versions_insert ON track_audio_versions
  FOR INSERT WITH CHECK (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );

CREATE POLICY track_audio_versions_delete ON track_audio_versions
  FOR DELETE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('collaborator'))
    )
  );
