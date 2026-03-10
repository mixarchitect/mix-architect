-- Target delivery specs on tracks for upload validation.
-- All nullable: if not set, no validation occurs for that field.

ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS target_sample_rate  INTEGER,
  ADD COLUMN IF NOT EXISTS target_bit_depth    INTEGER,
  ADD COLUMN IF NOT EXISTS target_channels     INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS target_format       TEXT;
