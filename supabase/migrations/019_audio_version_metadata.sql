-- Add audio file metadata columns to track_audio_versions
ALTER TABLE track_audio_versions
  ADD COLUMN IF NOT EXISTS sample_rate integer,
  ADD COLUMN IF NOT EXISTS bit_depth smallint,
  ADD COLUMN IF NOT EXISTS file_format text;
