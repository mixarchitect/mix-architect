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

/** Common true peak ceiling used for pass/fail badge coloring.
 *  Most streaming platforms recommend ≤ -1.0 dBTP to leave headroom for
 *  lossy codec inter-sample peaks. Spotify (Loud) and Amazon Music are
 *  stricter at -2.0 dBTP; the per-platform table below holds those. */
export const TRUE_PEAK_CEILING = -1;

/** Per-platform true peak ceilings (dBTP). The mix should sit at or below
 *  each target for delivery to that platform. Unlike LUFS, true peak is a
 *  one-sided spec — being below the ceiling is always fine, being above
 *  it risks clipping after lossy encoding. */
export const TRUE_PEAK_TARGETS = [
  { name: "Spotify", dbtp: -1, group: "Streaming" },
  { name: "Spotify (Loud)", dbtp: -2, group: "Streaming" },
  { name: "Apple Music", dbtp: -1, group: "Streaming" },
  { name: "YouTube", dbtp: -1, group: "Streaming" },
  { name: "Tidal", dbtp: -1, group: "Streaming" },
  { name: "Amazon Music", dbtp: -2, group: "Streaming" },
  { name: "Deezer", dbtp: -1, group: "Streaming" },
  { name: "Qobuz", dbtp: -1, group: "Streaming" },
  { name: "Pandora", dbtp: -1, group: "Streaming" },
  { name: "EBU R128", dbtp: -1, group: "Broadcast" },
  { name: "ATSC A/85", dbtp: -2, group: "Broadcast" },
  { name: "ITU-R BS.1770", dbtp: -1, group: "Broadcast" },
  { name: "Instagram/Reels", dbtp: -1, group: "Social" },
  { name: "TikTok", dbtp: -1, group: "Social" },
  { name: "Facebook", dbtp: -1, group: "Social" },
] as const;

/* ------------------------------------------------------------------ */
/*  Quality thresholds (clipping, DC offset, sample peak at 0)         */
/* ------------------------------------------------------------------ */

/** DC offset above this magnitude is worth flagging. Typical clean masters
 *  come in well below 0.001; anything above 0.002 usually indicates a
 *  gain-stage or filtering issue. */
export const DC_OFFSET_THRESHOLD = 0.002;

/** Sample peak at or above this dBFS counts as "peaks at digital full
 *  scale" — leaves no headroom for downstream DSP or lossy codecs. */
export const SAMPLE_PEAK_AT_FULL_SCALE_DBFS = -0.1;

/** Clip sample counts above this are considered severe rather than
 *  borderline (a few clipped samples in a long track may be inaudible;
 *  thousands definitely aren't). Used for severity coloring only. */
export const CLIPPING_SEVERE_SAMPLE_COUNT = 1000;

export type QualityIssue = "clipping" | "dc_offset" | "peak_at_full_scale";

export type QualitySnapshot = {
  issues: QualityIssue[];
  /** true if any issue is considered severe (red badge) rather than
   *  borderline (amber badge). */
  severe: boolean;
  /** Raw values carried through for the popover render. */
  clipSampleCount: number | null;
  samplePeakDbfs: number | null;
  dcOffset: number | null;
};

/** Compute which quality issues are present for an audio version. Returns
 *  null when the worker hasn't populated any of the inputs (so the pill
 *  stays hidden rather than showing "no issues" for not-yet-analyzed rows). */
export function computeQualitySnapshot(input: {
  clipSampleCount: number | null | undefined;
  samplePeakDbfs: number | null | undefined;
  dcOffset: number | null | undefined;
}): QualitySnapshot | null {
  const { clipSampleCount, samplePeakDbfs, dcOffset } = input;
  const anyField =
    clipSampleCount != null || samplePeakDbfs != null || dcOffset != null;
  if (!anyField) return null;

  const issues: QualityIssue[] = [];
  if (clipSampleCount != null && clipSampleCount > 0) issues.push("clipping");
  if (
    samplePeakDbfs != null &&
    samplePeakDbfs >= SAMPLE_PEAK_AT_FULL_SCALE_DBFS &&
    // Don't double-count when clipping is already flagged, since clipping
    // implies sample peak at full scale. Keep this as a separate flag only
    // when clipping didn't trigger.
    !(clipSampleCount != null && clipSampleCount > 0)
  ) {
    issues.push("peak_at_full_scale");
  }
  if (dcOffset != null && Math.abs(dcOffset) > DC_OFFSET_THRESHOLD) {
    issues.push("dc_offset");
  }

  const severe =
    issues.length >= 2 ||
    (clipSampleCount != null && clipSampleCount > CLIPPING_SEVERE_SAMPLE_COUNT);

  return {
    issues,
    severe,
    clipSampleCount: clipSampleCount ?? null,
    samplePeakDbfs: samplePeakDbfs ?? null,
    dcOffset: dcOffset ?? null,
  };
}

export const AUTHOR_COLORS = [
  "#0D9488",
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
