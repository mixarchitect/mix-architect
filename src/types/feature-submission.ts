export interface FeatureSubmission {
  id: string;
  user_id: string;
  release_id: string;
  release_title: string;
  artist_name: string;
  pitch_note: string | null;
  permission_granted: boolean;
  status: "pending" | "approved" | "declined";
  admin_notes: string | null;
  reviewed_at: string | null;
  featured_release_id: string | null;
  created_at: string;
  updated_at: string;
}
