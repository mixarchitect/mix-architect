import type { AudioVersionData, TimelineComment } from "@/components/ui/audio-player";
import type { BriefIntent, BriefSpec, BriefReference } from "@/lib/db-types";

/** Portal share record (brief_shares row with portal columns). */
export type PortalShare = {
  id: string;
  release_id: string;
  share_token: string;
  active: boolean;
  show_direction: boolean;
  show_specs: boolean;
  show_references: boolean;
  show_payment_status: boolean;
  show_distribution: boolean;
  require_payment_for_download: boolean;
  portal_status: "in_review" | "approved" | "delivered";
};

export type ApprovalStatus = "awaiting_review" | "changes_requested" | "approved" | "delivered";

/** Per-track visibility settings for the portal. */
export type PortalTrackSetting = {
  id: string;
  brief_share_id: string;
  track_id: string;
  visible: boolean;
  download_enabled: boolean;
  approval_status: ApprovalStatus;
};

/** Per-version visibility settings for the portal. */
export type PortalVersionSetting = {
  id: string;
  brief_share_id: string;
  audio_version_id: string;
  visible: boolean;
};

/** Per-track distribution metadata (from track_distribution table). */
export type PortalDistribution = {
  isrc: string | null;
  iswc: string | null;
  producer: string | null;
  composers: string | null;
  language: string | null;
  explicit_lyrics: boolean;
  featured_artist: string | null;
  instrumental: boolean;
  cover_song: boolean;
};

/** Release-level distribution metadata (from releases table columns). */
export type PortalReleaseDistribution = {
  distributor: string | null;
  record_label: string | null;
  upc: string | null;
  copyright_holder: string | null;
  copyright_year: string | null;
  phonogram_copyright: string | null;
  catalog_number: string | null;
};

/** A track enriched with all portal-visible data. */
export type PortalTrack = {
  id: string;
  track_number: number;
  title: string;
  intent: BriefIntent | null;
  specs: BriefSpec | null;
  references: BriefReference[];
  versions: AudioVersionData[];
  comments: TimelineComment[];
  downloadEnabled: boolean;
  approvalStatus: ApprovalStatus;
  distribution: PortalDistribution | null;
  approvalDate: string | null;
};

/** Release metadata passed to the portal client. */
export type PortalRelease = {
  id: string;
  title: string;
  artist: string | null;
  release_type: string;
  format: string;
  cover_art_url: string | null;
  global_direction: string | null;
  payment_status: string;
  fee_total: number | null;
  fee_currency: string;
  paid_amount: number | null;
  engineer_name: string | null;
  distribution: PortalReleaseDistribution | null;
};
