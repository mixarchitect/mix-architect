/** Shared constants and utilities for audio players (main app + portal). */

/** Read waveform CSS variables from the live document. */
export function getWaveColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    wave: s.getPropertyValue("--wave").trim() || "rgba(20, 20, 20, 0.15)",
    progress:
      s.getPropertyValue("--wave-progress").trim() ||
      "rgba(20, 20, 20, 0.38)",
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Reference LUFS target used for the delta badge comparison. */
export const LUFS_REFERENCE = -14;

/** Loudness targets for the streaming / broadcast / social normalization table. */
export const LOUDNESS_TARGETS = [
  { name: "Spotify", lufs: -14, group: "Streaming" },
  { name: "Apple Music", lufs: -16, group: "Streaming" },
  { name: "YouTube", lufs: -14, group: "Streaming" },
  { name: "Tidal", lufs: -14, group: "Streaming" },
  { name: "Amazon Music", lufs: -14, group: "Streaming" },
  { name: "Deezer", lufs: -15, group: "Streaming" },
  { name: "Qobuz", lufs: -14, group: "Streaming" },
  { name: "Pandora", lufs: -14, group: "Streaming" },
  { name: "EBU R128", lufs: -23, group: "Broadcast" },
  { name: "ATSC A/85", lufs: -24, group: "Broadcast" },
  { name: "ITU-R BS.1770", lufs: -24, group: "Broadcast" },
  { name: "Instagram/Reels", lufs: -14, group: "Social" },
  { name: "TikTok", lufs: -14, group: "Social" },
  { name: "Facebook", lufs: -16, group: "Social" },
] as const;

export const LOUDNESS_GROUPS = ["Streaming", "Broadcast", "Social"] as const;

export const AUTHOR_COLORS = [
  "#FE5E0E",
  "#6B8AFF",
  "#8B5CF6",
  "#22C55E",
  "#EAB308",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];
