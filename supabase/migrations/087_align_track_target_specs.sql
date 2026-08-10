-- Target specs lived in two stores that could disagree: track_specs
-- (label strings, edited on the track Brief tab) and tracks.target_*
-- (integers, read by the upload-mismatch validator). The app now treats
-- track_specs as canonical for sample rate and bit depth and dual-writes
-- the mirror on edit; this migration re-aligns legacy rows where the two
-- stores diverged (e.g. a Brief tab showing 96 kHz while the validator
-- warned against a 48 kHz target).
--
-- Labels are normalized on whitespace/case because older writers spelled
-- them "48kHz" while the Brief tab writes "48 kHz".

UPDATE tracks t
SET target_sample_rate = m.hz
FROM track_specs ts,
LATERAL (
  SELECT CASE replace(lower(ts.sample_rate), ' ', '')
    WHEN '44.1khz'  THEN 44100
    WHEN '48khz'    THEN 48000
    WHEN '88.2khz'  THEN 88200
    WHEN '96khz'    THEN 96000
    WHEN '176.4khz' THEN 176400
    WHEN '192khz'   THEN 192000
  END AS hz
) m
WHERE ts.track_id = t.id
  AND ts.sample_rate IS NOT NULL
  AND m.hz IS NOT NULL
  AND t.target_sample_rate IS DISTINCT FROM m.hz;

UPDATE tracks t
SET target_bit_depth = m.bits
FROM track_specs ts,
LATERAL (
  SELECT CASE replace(lower(ts.bit_depth), ' ', '')
    WHEN '16-bit'      THEN 16
    WHEN '16bit'       THEN 16
    WHEN '24-bit'      THEN 24
    WHEN '24bit'       THEN 24
    WHEN '32-bitfloat' THEN 32
    WHEN '32bitfloat'  THEN 32
  END AS bits
) m
WHERE ts.track_id = t.id
  AND ts.bit_depth IS NOT NULL
  AND m.bits IS NOT NULL
  AND t.target_bit_depth IS DISTINCT FROM m.bits;
