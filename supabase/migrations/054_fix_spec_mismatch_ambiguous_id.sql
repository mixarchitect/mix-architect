-- ── Migration 054: Fix check_spec_mismatch ambiguous column ────────
-- The trigger function added in 027_spec_mismatch_notification.sql
-- selects an unqualified `id` from a join between tracks and releases.
-- Both tables have an `id` column, so every UPDATE on
-- track_audio_versions has been raising:
--
--   ERROR 42702: column reference "id" is ambiguous
--
-- which causes the worker's analysis write-back to fail and every
-- upload to be marked spec_analysis_status = 'failed'.
--
-- This recreates the function with `t.id` explicitly qualified.

CREATE OR REPLACE FUNCTION check_spec_mismatch()
RETURNS TRIGGER AS $$
DECLARE
  v_track RECORD;
BEGIN
  -- Only run when analysis just completed
  IF NEW.spec_analysis_status = 'complete'
     AND (OLD.spec_analysis_status IS DISTINCT FROM 'complete')
  THEN
    SELECT t.id, t.title, t.release_id, r.user_id,
           t.target_sample_rate, t.target_bit_depth, t.target_channels, t.target_format
    INTO v_track
    FROM tracks t
    JOIN releases r ON r.id = t.release_id
    WHERE t.id = NEW.track_id;

    -- Check for any mismatch (only compare fields where both target and detected are set)
    IF (v_track.target_sample_rate IS NOT NULL
        AND NEW.sample_rate IS NOT NULL
        AND v_track.target_sample_rate != NEW.sample_rate)
    OR (v_track.target_bit_depth IS NOT NULL
        AND NEW.bit_depth IS NOT NULL
        AND v_track.target_bit_depth != NEW.bit_depth)
    OR (v_track.target_channels IS NOT NULL
        AND NEW.channels IS NOT NULL
        AND v_track.target_channels != NEW.channels)
    OR (v_track.target_format IS NOT NULL
        AND NEW.file_format IS NOT NULL
        AND LOWER(v_track.target_format) != LOWER(NEW.file_format))
    THEN
      INSERT INTO notifications (user_id, type, title, body, release_id, track_id, created_at)
      VALUES (
        v_track.user_id,
        'spec_mismatch',
        format('Spec mismatch: %s', v_track.title),
        format('Uploaded audio does not match the target delivery specs.'),
        v_track.release_id,
        v_track.id,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
