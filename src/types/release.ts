export type ReleaseStatus = "draft" | "in_progress" | "ready";
export type ReleaseType = "single" | "ep" | "album";
export type ReleaseFormat = "stereo" | "atmos" | "both";

/**
 * Shape returned by the dashboard query — a release row
 * with aggregated track progress counts.
 */
export interface DashboardRelease {
  id: string;
  title: string;
  artist: string | null;
  release_type: ReleaseType;
  format: ReleaseFormat;
  status: ReleaseStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  track_count: number;
  completed_tracks: number;
  pinned?: boolean;
  payment_status?: string | null;
  fee_total?: number | null;
  fee_currency?: string | null;
  cover_art_url?: string | null;
}
