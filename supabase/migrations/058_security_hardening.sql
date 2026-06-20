-- Security hardening pass — addresses Critical + High findings from the
-- 2026-06-20 audit:
--
--   1. track-audio bucket: assert RLS policies in source control (they
--      were only configured in the Supabase dashboard before this).
--   2. Storage buckets: enforce server-side file-size + mime allowlists
--      (client-side validation can be trivially bypassed).
--   3. stripe_processed_events: lock down with an explicit deny-all
--      policy so future SELECT additions can't accidentally leak event
--      ids / types.
--   4. rate_limit_attempts table backing the new shared rate limiter
--      (the in-memory Map in src/lib/rate-limit.ts is per-Vercel-Lambda
--      and doesn't hold across cold starts).

-- ─── 1. track-audio storage policies ───────────────────────────────
-- Files are stored as {user_id}/{track_id}/v{n}.{ext}. The owner is
-- whoever's auth.uid() matches the first path segment.
--
-- IF NOT EXISTS isn't supported on storage.objects policies; drop the
-- ones we manage to make the migration re-runnable. (Other dashboard-
-- generated policies on storage.objects are untouched.)

DROP POLICY IF EXISTS "track_audio_select_own" ON storage.objects;
DROP POLICY IF EXISTS "track_audio_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "track_audio_update_own" ON storage.objects;
DROP POLICY IF EXISTS "track_audio_delete_own" ON storage.objects;

CREATE POLICY "track_audio_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'track-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "track_audio_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'track-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "track_audio_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'track-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'track-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "track_audio_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'track-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── 2. Bucket-level size + mime caps ──────────────────────────────
-- These are enforced by storage-api BEFORE the client even uploads,
-- so a malicious client bypassing the JS file-type check still can't
-- land a polyglot HTML/JPEG in cover-art or a 10 GB binary in
-- track-audio.

UPDATE storage.buckets
SET
  file_size_limit = 600 * 1024 * 1024,  -- 600 MB (audio originals)
  allowed_mime_types = ARRAY[
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/aiff',
    'audio/x-aiff',
    'audio/flac',
    'audio/x-flac',
    'audio/mpeg',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg'
  ]
WHERE id = 'track-audio';

UPDATE storage.buckets
SET
  file_size_limit = 10 * 1024 * 1024,   -- 10 MB (cover art)
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
WHERE id = 'cover-art';

-- ─── 3. stripe_processed_events deny-all policy ────────────────────
-- Migration 057 enables RLS with zero policies (intent: service-role
-- only). RLS-on + no-policies is "deny all" today, but if anyone
-- adds even a permissive SELECT for debugging it would leak event
-- ids/types. Make the intent explicit with an explicit false policy.

DROP POLICY IF EXISTS stripe_processed_events_no_user_access
  ON stripe_processed_events;

CREATE POLICY stripe_processed_events_no_user_access
  ON stripe_processed_events
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ─── 4. Shared rate-limit table ────────────────────────────────────
-- One row per attempt. Window queries are `attempted_at > now() - X`
-- so we don't need a status column. A periodic cleanup keeps the
-- table bounded.

CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id        bigserial PRIMARY KEY,
  key       text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_attempts_key_time_idx
  ON rate_limit_attempts (key, attempted_at DESC);

ALTER TABLE rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Service-role only. No policies for anon/authenticated.
DROP POLICY IF EXISTS rate_limit_attempts_no_user_access
  ON rate_limit_attempts;
CREATE POLICY rate_limit_attempts_no_user_access
  ON rate_limit_attempts
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Atomic check-and-consume. Counts attempts in the rolling window,
-- inserts the current attempt if under the limit, and returns the
-- result in a single round trip.
CREATE OR REPLACE FUNCTION consume_rate_limit(
  p_key text,
  p_limit int,
  p_window_ms int
)
RETURNS TABLE (allowed boolean, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_attempts int;
  v_cutoff timestamptz := now() - (p_window_ms || ' milliseconds')::interval;
BEGIN
  SELECT count(*) INTO v_attempts
  FROM rate_limit_attempts
  WHERE key = p_key AND attempted_at > v_cutoff;

  IF v_attempts >= p_limit THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  INSERT INTO rate_limit_attempts (key) VALUES (p_key);

  -- Opportunistic cleanup: every ~100th call, drop stale rows older
  -- than 24h. Cheap, bounded, no separate cron required.
  IF floor(random() * 100)::int = 0 THEN
    DELETE FROM rate_limit_attempts
    WHERE attempted_at < now() - interval '24 hours';
  END IF;

  RETURN QUERY SELECT true, (p_limit - v_attempts - 1);
END;
$$;

REVOKE EXECUTE ON FUNCTION consume_rate_limit(text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text, int, int) TO service_role;
