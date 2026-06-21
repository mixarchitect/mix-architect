-- Ensure the tables the browser subscribes to via supabase.channel(...)
-- are members of the supabase_realtime publication.
--
-- Without this, the websocket subscription connects fine but never
-- receives any UPDATE/INSERT events because Postgres logical
-- replication doesn't broadcast changes for non-published tables.
--
-- Symptom this caused: worker writes track_audio_versions.spec_analysis_status
-- = 'complete' after analyzing an upload, but the audio-player on the
-- track-detail page never picks up the change — pills stay stuck on
-- "Analyzing" / "Measurements processing" until a full page reload
-- (and even then, only if there's no stale cache layer in between).
--
-- Idempotent: ALTER PUBLICATION ADD TABLE fails if the table is
-- already present, so wrap each in a DO block that checks first.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'track_audio_versions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.track_audio_versions;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
