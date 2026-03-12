-- Store embedded metadata summary on conversion jobs
-- so the UI can show what tags were written into the converted file.
ALTER TABLE conversion_jobs
  ADD COLUMN IF NOT EXISTS embedded_metadata jsonb;
