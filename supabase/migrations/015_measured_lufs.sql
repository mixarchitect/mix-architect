-- Add measured LUFS column to track_audio_versions
ALTER TABLE track_audio_versions
  ADD COLUMN IF NOT EXISTS measured_lufs numeric(6,2);

-- Add UPDATE policy (needed for caching waveform_peaks and measured_lufs)
CREATE POLICY track_audio_versions_update ON track_audio_versions
  FOR UPDATE USING (
    track_id IN (
      SELECT t.id FROM tracks t
      WHERE t.release_id IN (SELECT accessible_release_ids('client'))
    )
  );
