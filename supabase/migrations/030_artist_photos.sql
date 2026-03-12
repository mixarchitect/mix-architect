-- Artist photos: custom photo per artist, keyed by lowercased artist name
CREATE TABLE IF NOT EXISTS artist_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name_key text NOT NULL,
  photo_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, artist_name_key)
);

ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY artist_photos_owner ON artist_photos
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER artist_photos_updated_at
  BEFORE UPDATE ON artist_photos
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
