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

/* ------------------------------------------------------------------ */
/*  Audio metadata formatters                                          */
/* ------------------------------------------------------------------ */

/** Format a sample rate in Hz to a human-readable string, e.g. "48kHz", "44.1kHz". */
export function formatSampleRate(hz: number): string {
  const khz = hz / 1000;
  // One decimal for non-integer kHz (44.1, 88.2), none for round values (48, 96)
  return khz % 1 === 0 ? `${khz}kHz` : `${khz}kHz`;
}

/** Format bit depth for display, e.g. "24-bit" or "32-bit float". */
export function formatBitDepth(
  bitDepth: number,
  fileFormat?: string | null,
): string {
  // 32-bit WAV/AIFF is typically IEEE float
  if (
    bitDepth === 32 &&
    (fileFormat === "WAV" || fileFormat === "AIFF")
  ) {
    return "32-bit float";
  }
  return `${bitDepth}-bit`;
}
