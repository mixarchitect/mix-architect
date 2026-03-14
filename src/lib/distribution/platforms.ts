// Distribution platform and distributor constants

// ─── Platforms ──────────────────────────────────────────────────────

export const PLATFORMS = [
  { id: "spotify", label: "Spotify", color: "#1DB954" },
  { id: "apple_music", label: "Apple Music", color: "#FA243C" },
  { id: "tidal", label: "Tidal", color: "#000000" },
  { id: "amazon_music", label: "Amazon Music", color: "#25D1DA" },
  { id: "youtube_music", label: "YouTube Music", color: "#FF0000" },
  { id: "deezer", label: "Deezer", color: "#A238FF" },
  { id: "soundcloud", label: "SoundCloud", color: "#FF5500" },
  { id: "bandcamp", label: "Bandcamp", color: "#1DA0C3" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export function getPlatformLabel(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}

export function getPlatformColor(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.color ?? "#888888";
}

/** Map platform ID → SVG icon path in /public/icons/streaming/ */
export function getPlatformIcon(id: string): string {
  const map: Record<string, string> = {
    spotify: "/icons/streaming/spotify.svg",
    apple_music: "/icons/streaming/apple-music.svg",
    tidal: "/icons/streaming/tidal.svg",
    amazon_music: "/icons/streaming/amazon-music.svg",
    youtube_music: "/icons/streaming/youtube-music.svg",
    deezer: "/icons/streaming/deezer.svg",
    soundcloud: "/icons/streaming/soundcloud.svg",
    bandcamp: "/icons/streaming/bandcamp.svg",
  };
  return map[id] ?? "/icons/streaming/globe.svg";
}

// Platforms that support auto-detection
export const AUTO_DETECTABLE_PLATFORMS: PlatformId[] = [
  "spotify",
  "apple_music",
];

// ─── Statuses ───────────────────────────────────────────────────────

export const DISTRIBUTION_STATUSES = [
  "not_submitted",
  "submitted",
  "processing",
  "live",
  "rejected",
  "taken_down",
] as const;

export type DistributionStatus = (typeof DISTRIBUTION_STATUSES)[number];

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_submitted: "Not Submitted",
    submitted: "Submitted",
    processing: "Processing",
    live: "Live",
    rejected: "Rejected",
    taken_down: "Taken Down",
  };
  return labels[status] ?? status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    not_submitted: "var(--muted)",
    submitted: "var(--warning, #f59e0b)",
    processing: "var(--warning, #f59e0b)",
    live: "var(--signal)",
    rejected: "var(--danger, #ef4444)",
    taken_down: "var(--danger, #ef4444)",
  };
  return colors[status] ?? "var(--muted)";
}

// ─── Distributors ───────────────────────────────────────────────────

export const DISTRIBUTORS = [
  "DistroKid",
  "TuneCore",
  "CD Baby",
  "LANDR",
  "Ditto Music",
  "AWAL",
  "UnitedMasters",
  "Amuse",
  "RouteNote",
  "Self-released",
  "Other",
] as const;

/** Which platforms each distributor delivers to (for bulk submit pre-selection) */
export const DISTRIBUTOR_PLATFORMS: Record<string, PlatformId[]> = {
  DistroKid: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  TuneCore: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  "CD Baby": [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  LANDR: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  "Ditto Music": [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  AWAL: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  UnitedMasters: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  Amuse: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  RouteNote: [
    "spotify",
    "apple_music",
    "tidal",
    "amazon_music",
    "youtube_music",
    "deezer",
  ],
  "Self-released": [],
  Other: [],
};

// ─── Types ──────────────────────────────────────────────────────────

export type DistributionEntry = {
  id: string;
  release_id: string;
  platform: PlatformId;
  distributor: string | null;
  status: DistributionStatus;
  submitted_at: string | null;
  live_at: string | null;
  external_url: string | null;
  notes: string | null;
  auto_detected: boolean;
  created_at: string;
  updated_at: string;
};

export type DistributionHistoryEntry = {
  id: string;
  distribution_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  created_at: string;
};
