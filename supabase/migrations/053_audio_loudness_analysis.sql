-- ── Migration 053: Audio Loudness Analysis ─────────────────
-- Extend track_audio_versions with full loudness/peak/quality
-- metrics produced by the worker's FFmpeg ebur128 + astats pass.
--
-- measured_lufs already exists (added in 015). These columns
-- complete the QC picture: true peak, sample peak, loudness
-- range, DC offset, and clipping sample count.
--
-- analysis_version lets us re-run analysis when the algorithm
-- changes. NULL = never analyzed with the new pipeline (includes
-- both pre-migration rows and newly-uploaded rows awaiting
-- worker processing). Worker sets this to 1 after a successful
-- analysis pass writes all fields.

ALTER TABLE track_audio_versions
  ADD COLUMN IF NOT EXISTS true_peak_dbtp     numeric(6,2),
  ADD COLUMN IF NOT EXISTS sample_peak_dbfs   numeric(6,2),
  ADD COLUMN IF NOT EXISTS loudness_range     numeric(6,2),
  ADD COLUMN IF NOT EXISTS dc_offset          numeric(6,4),
  ADD COLUMN IF NOT EXISTS clip_sample_count  integer,
  ADD COLUMN IF NOT EXISTS analysis_version   smallint;
