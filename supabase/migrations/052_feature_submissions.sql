-- ── Migration 052: Feature Submissions ─────────────────────
-- Users can submit their releases for consideration on the
-- "What We're Spinning" featured releases blog.

-- ═══════════════════════════════════════════════════════════
-- 1. FEATURE_SUBMISSIONS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.feature_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who submitted
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which release
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,

  -- Snapshot of key data at submission time
  release_title text NOT NULL,
  artist_name text NOT NULL,

  -- User's pitch
  pitch_note text,

  -- Permission
  permission_granted boolean NOT NULL DEFAULT false,

  -- Admin review
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes text,
  reviewed_at timestamptz,

  -- Link to the featured release if approved
  featured_release_id uuid REFERENCES public.featured_releases(id) ON DELETE SET NULL,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- One submission per release
  CONSTRAINT unique_release_submission UNIQUE (release_id)
);

-- ═══════════════════════════════════════════════════════════
-- 2. INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_feature_submissions_status ON feature_submissions(status);
CREATE INDEX idx_feature_submissions_user ON feature_submissions(user_id);

-- ═══════════════════════════════════════════════════════════
-- 3. ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE feature_submissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own submissions
CREATE POLICY "Users can view own submissions"
  ON feature_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can create submissions"
  ON feature_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own pending submissions (withdraw)
CREATE POLICY "Users can withdraw pending submissions"
  ON feature_submissions FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can read all submissions
CREATE POLICY "Admins can view all submissions"
  ON feature_submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admins can update any submission (approve/decline)
CREATE POLICY "Admins can update submissions"
  ON feature_submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Updated_at trigger (reuse existing set_updated_at from migration 001)
CREATE TRIGGER set_feature_submissions_updated_at
  BEFORE UPDATE ON feature_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 4. ADD AUDIO COLUMNS TO FEATURED_RELEASES
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.featured_releases
  ADD COLUMN IF NOT EXISTS audio_file_path text,
  ADD COLUMN IF NOT EXISTS audio_file_name text,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds numeric;

-- ═══════════════════════════════════════════════════════════
-- 5. FEATURED-AUDIO STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('featured-audio', 'featured-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload featured audio
CREATE POLICY "Admins can upload featured audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'featured-audio'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow public read (for blog playback)
CREATE POLICY "Public can read featured audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'featured-audio');

-- Allow admins to delete featured audio
CREATE POLICY "Admins can delete featured audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'featured-audio'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ═══════════════════════════════════════════════════════════
-- 6. EXPAND NOTIFICATION TYPES
-- ═══════════════════════════════════════════════════════════

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'comment',
    'portal_comment',
    'status_change',
    'payment_update',
    'approval',
    'audio_upload',
    'collaborator_joined',
    'export_complete',
    'spec_mismatch',
    'feature_submission_approved',
    'feature_submission_declined'
  ));

-- ═══════════════════════════════════════════════════════════
-- 7. NOTIFICATION TRIGGER ON STATUS CHANGE
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION notify_feature_submission_status()
RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO notifications (user_id, type, title, body, release_id)
    VALUES (
      NEW.user_id,
      'feature_submission_approved',
      'Your release has been selected for What We''re Spinning!',
      'Your release "' || NEW.release_title || '" by ' || NEW.artist_name || ' has been selected for our What We''re Spinning blog feature.',
      NEW.release_id
    );
  ELSIF OLD.status = 'pending' AND NEW.status = 'declined' THEN
    INSERT INTO notifications (user_id, type, title, body, release_id)
    VALUES (
      NEW.user_id,
      'feature_submission_declined',
      'Update on your feature submission',
      'Thanks for submitting "' || NEW.release_title || '" for consideration. We weren''t able to feature it this time, but keep creating!',
      NEW.release_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_feature_submission_status_change
  AFTER UPDATE OF status ON feature_submissions
  FOR EACH ROW EXECUTE FUNCTION notify_feature_submission_status();
