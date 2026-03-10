-- Fire a notification when spec analysis completes and a mismatch is detected.

CREATE OR REPLACE FUNCTION check_spec_mismatch()
RETURNS TRIGGER AS $$
DECLARE
  v_track RECORD;
BEGIN
  -- Only run when analysis just completed
  IF NEW.spec_analysis_status = 'complete'
     AND (OLD.spec_analysis_status IS DISTINCT FROM 'complete')
  THEN
    SELECT id, title, release_id, user_id,
           target_sample_rate, target_bit_depth, target_channels, target_format
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

CREATE TRIGGER audio_version_spec_check
  AFTER UPDATE ON track_audio_versions
  FOR EACH ROW
  EXECUTE FUNCTION check_spec_mismatch();
