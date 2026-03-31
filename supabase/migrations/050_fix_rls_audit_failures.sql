-- Fix RLS audit failures: ownership transfer + cover-art storage isolation
--
-- 1. Prevent users from transferring release ownership by changing user_id
-- 2. Add missing storage policies for the cover-art bucket

-- ─── Fix 1: Prevent release ownership transfer ──────────────────
-- The existing releases_update policy (from migration 004) allows
-- updates with USING (accessible_release_ids) but has no WITH CHECK,
-- so a user can UPDATE user_id to another user's ID.
--
-- Add WITH CHECK to ensure user_id remains auth.uid() after update.

DROP POLICY IF EXISTS releases_update ON releases;
CREATE POLICY releases_update ON releases
  FOR UPDATE
  USING (id IN (SELECT accessible_release_ids('collaborator')))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─── Fix 2: Cover-art storage bucket policies ──────────────────
-- The cover-art bucket has no RLS policies, allowing any authenticated
-- user to read/write any file. Files are stored as {user_id}/filename.

-- Users can only download their own cover art
CREATE POLICY "cover_art_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cover-art'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only upload into their own directory
CREATE POLICY "cover_art_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cover-art'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only update/overwrite their own files
CREATE POLICY "cover_art_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cover-art'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cover-art'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can only delete their own files
CREATE POLICY "cover_art_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cover-art'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
