-- ── Migration 085: Audio quality alerts ────────────────────
-- The analyzer measured loudness, true peak, and clipping and then dropped
-- them: user_defaults.default_* was read by nothing, track_specs.target_loudness
-- was null on every track, and check_spec_mismatch() compared only the four
-- format dimensions against tracks.target_* columns that were never seeded.
--
-- This migration wires the chain together:
--   1. tracks.target_lufs (numeric) — the loudness target the trigger reads.
--   2. BEFORE INSERT triggers seed tracks.target_* and track_specs display
--      fields from the release owner's user_defaults (DB-side, so no app
--      code path can skip it), plus a backfill for existing rows.
--   3. check_spec_mismatch() gains loudness / true-peak / clipping arms with
--      distinct notification types.
--   4. notifications type CHECK re-declared — including distribution_live,
--      which migration 052 accidentally dropped (its inserts have been
--      failing the CHECK in production since).

ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS target_lufs numeric(6,2);

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'comment',
  'portal_comment',
  'status_change',
  'payment_update',
  'approval',
  'audio_upload',
  'collaborator_joined',
  'export_complete',
  'spec_mismatch',
  'distribution_live',
  'feature_submission_approved',
  'feature_submission_declined',
  'clipping_detected',
  'loudness_mismatch',
  'true_peak_over'
));

-- ── Parsing helpers for the text-typed user_defaults fields ─────────

-- '48kHz' → 48000, '44.1kHz' → 44100, '96000' → 96000
CREATE OR REPLACE FUNCTION public.parse_sample_rate_hz(t text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
  SELECT CASE
    WHEN n IS NULL THEN NULL
    WHEN n < 1000 THEN (n * 1000)::integer
    ELSE n::integer
  END
  FROM (SELECT (regexp_match(coalesce(t, ''), '\d+(?:\.\d+)?'))[1]::numeric AS n) x;
$$;

-- '24-bit' → 24
CREATE OR REPLACE FUNCTION public.parse_bit_depth(t text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
  SELECT (regexp_match(coalesce(t, ''), '\d+'))[1]::integer;
$$;

-- '-14 LUFS' → -14
CREATE OR REPLACE FUNCTION public.parse_lufs(t text)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
  SELECT (regexp_match(coalesce(t, ''), '-?\d+(?:\.\d+)?'))[1]::numeric;
$$;

REVOKE EXECUTE ON FUNCTION public.parse_sample_rate_hz(text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.parse_bit_depth(text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.parse_lufs(text) FROM public, anon, authenticated;

-- ── Seed targets at creation ────────────────────────────────────────
-- BEFORE INSERT (filling NEW in place) rather than AFTER INSERT rows in
-- another table, so the app's own track_specs inserts (bare or
-- template-seeded) never hit a conflict and template values always win.

CREATE OR REPLACE FUNCTION public.seed_track_targets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_d RECORD;
BEGIN
  SELECT d.default_sample_rate, d.default_bit_depth, d.default_loudness
  INTO v_d
  FROM public.releases r
  JOIN public.user_defaults d ON d.user_id = r.user_id
  WHERE r.id = NEW.release_id;

  IF FOUND THEN
    NEW.target_sample_rate := coalesce(NEW.target_sample_rate, public.parse_sample_rate_hz(v_d.default_sample_rate));
    NEW.target_bit_depth := coalesce(NEW.target_bit_depth, public.parse_bit_depth(v_d.default_bit_depth));
    NEW.target_lufs := coalesce(NEW.target_lufs, public.parse_lufs(v_d.default_loudness));
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.seed_track_targets() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS tracks_seed_targets ON public.tracks;
CREATE TRIGGER tracks_seed_targets
  BEFORE INSERT ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_track_targets();

CREATE OR REPLACE FUNCTION public.seed_track_spec_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_d RECORD;
BEGIN
  SELECT d.default_sample_rate, d.default_bit_depth, d.default_loudness
  INTO v_d
  FROM public.tracks t
  JOIN public.releases r ON r.id = t.release_id
  JOIN public.user_defaults d ON d.user_id = r.user_id
  WHERE t.id = NEW.track_id;

  IF FOUND THEN
    NEW.target_loudness := coalesce(NEW.target_loudness, v_d.default_loudness);
    NEW.sample_rate := coalesce(NEW.sample_rate, v_d.default_sample_rate);
    NEW.bit_depth := coalesce(NEW.bit_depth, v_d.default_bit_depth);
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.seed_track_spec_defaults() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS track_specs_seed_defaults ON public.track_specs;
CREATE TRIGGER track_specs_seed_defaults
  BEFORE INSERT ON public.track_specs
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_track_spec_defaults();

-- ── Backfill existing rows ──────────────────────────────────────────

UPDATE public.tracks t
SET target_sample_rate = coalesce(t.target_sample_rate, public.parse_sample_rate_hz(d.default_sample_rate)),
    target_bit_depth = coalesce(t.target_bit_depth, public.parse_bit_depth(d.default_bit_depth)),
    target_lufs = coalesce(t.target_lufs, public.parse_lufs(d.default_loudness))
FROM public.releases r
JOIN public.user_defaults d ON d.user_id = r.user_id
WHERE r.id = t.release_id;

UPDATE public.track_specs s
SET target_loudness = coalesce(s.target_loudness, d.default_loudness),
    sample_rate = coalesce(s.sample_rate, d.default_sample_rate),
    bit_depth = coalesce(s.bit_depth, d.default_bit_depth)
FROM public.tracks t
JOIN public.releases r ON r.id = t.release_id
JOIN public.user_defaults d ON d.user_id = r.user_id
WHERE t.id = s.track_id;

-- ── Extend the analysis trigger ─────────────────────────────────────
-- Fires on first completion AND on re-analysis (analysis_version change),
-- so rows re-processed after the clip-detector fix can alert. Each alert
-- type dedupes per track so re-analysis never floods the bell.
--
-- The clipping arm requires BOTH a large count and sample peak at the rail,
-- mirroring computeQualitySnapshot() in audio-player-shared.ts: legacy rows
-- still carrying the astats "Peak count" floor of 2 can never fire it.

CREATE OR REPLACE FUNCTION public.check_spec_mismatch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_track RECORD;
  v_completed boolean;
  v_reanalyzed boolean;
BEGIN
  v_completed := NEW.spec_analysis_status = 'complete'
    AND (OLD.spec_analysis_status IS DISTINCT FROM 'complete');
  v_reanalyzed := NEW.analysis_version IS DISTINCT FROM OLD.analysis_version
    AND coalesce(NEW.analysis_version, 0) > 0;

  IF NOT (v_completed OR v_reanalyzed) THEN
    RETURN NEW;
  END IF;

  SELECT t.id, t.title, t.release_id, r.user_id,
         t.target_sample_rate, t.target_bit_depth, t.target_channels,
         t.target_format, t.target_lufs
  INTO v_track
  FROM tracks t
  JOIN releases r ON r.id = t.release_id
  WHERE t.id = NEW.track_id;

  -- Format-dimension mismatch: unchanged behavior, first completion only.
  IF v_completed AND (
       (v_track.target_sample_rate IS NOT NULL AND NEW.sample_rate IS NOT NULL
        AND v_track.target_sample_rate != NEW.sample_rate)
    OR (v_track.target_bit_depth IS NOT NULL AND NEW.bit_depth IS NOT NULL
        AND v_track.target_bit_depth != NEW.bit_depth)
    OR (v_track.target_channels IS NOT NULL AND NEW.channels IS NOT NULL
        AND v_track.target_channels != NEW.channels)
    OR (v_track.target_format IS NOT NULL AND NEW.file_format IS NOT NULL
        AND LOWER(v_track.target_format) != LOWER(NEW.file_format))
  ) THEN
    INSERT INTO notifications (user_id, type, title, body, release_id, track_id, created_at)
    VALUES (
      v_track.user_id,
      'spec_mismatch',
      format('Spec mismatch: %s', v_track.title),
      'Uploaded audio does not match the target delivery specs.',
      v_track.release_id, v_track.id, NOW()
    );
  END IF;

  -- Loudness off target (±1 LU tolerance).
  IF v_track.target_lufs IS NOT NULL AND NEW.measured_lufs IS NOT NULL
     AND abs(NEW.measured_lufs - v_track.target_lufs) > 1.0
     AND NOT EXISTS (
       SELECT 1 FROM notifications n
       WHERE n.track_id = v_track.id AND n.type = 'loudness_mismatch'
     )
  THEN
    INSERT INTO notifications (user_id, type, title, body, release_id, track_id, created_at)
    VALUES (
      v_track.user_id,
      'loudness_mismatch',
      format('Loudness off target: %s', v_track.title),
      format('Measured %s LUFS against a %s LUFS target.',
             round(NEW.measured_lufs::numeric, 1), round(v_track.target_lufs, 1)),
      v_track.release_id, v_track.id, NOW()
    );
  END IF;

  -- True peak over the ceiling. Needs no user-set target: over -0.1 dBTP is
  -- objectively wrong for delivery, which is what makes this alert work for
  -- the user who configured nothing. Sample peak at/over 0 dBFS is implied.
  IF NEW.true_peak_dbtp IS NOT NULL AND NEW.true_peak_dbtp > -0.1
     AND NOT EXISTS (
       SELECT 1 FROM notifications n
       WHERE n.track_id = v_track.id AND n.type = 'true_peak_over'
     )
  THEN
    INSERT INTO notifications (user_id, type, title, body, release_id, track_id, created_at)
    VALUES (
      v_track.user_id,
      'true_peak_over',
      format('True peak over ceiling: %s', v_track.title),
      format('True peak is %s dBTP. Lossy encodes will distort; keep it under -1 dBTP.',
             round(NEW.true_peak_dbtp::numeric, 1)),
      v_track.release_id, v_track.id, NOW()
    );
  END IF;

  -- Digital clipping.
  IF coalesce(NEW.clip_sample_count, 0) > 1000
     AND coalesce(NEW.sample_peak_dbfs, -100) >= -0.1
     AND NOT EXISTS (
       SELECT 1 FROM notifications n
       WHERE n.track_id = v_track.id AND n.type = 'clipping_detected'
     )
  THEN
    INSERT INTO notifications (user_id, type, title, body, release_id, track_id, created_at)
    VALUES (
      v_track.user_id,
      'clipping_detected',
      format('Clipping detected: %s', v_track.title),
      format('%s samples at digital full scale.', NEW.clip_sample_count),
      v_track.release_id, v_track.id, NOW()
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Re-apply the 059/065 hardening that CREATE OR REPLACE would otherwise drop.
REVOKE EXECUTE ON FUNCTION public.check_spec_mismatch() FROM public, anon, authenticated;
