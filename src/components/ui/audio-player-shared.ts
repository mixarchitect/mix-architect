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

/** Loudness targets for the streaming / broadcast / social normalization
 *  table. The description field is shown as a tooltip when the user hovers
 *  a row's name, explaining what that platform does with loudness. */
export const LOUDNESS_TARGETS = [
  {
    name: "Spotify",
    lufs: -14,
    group: "Streaming",
    description: "Normalizes to -14 LUFS by default. Louder masters are turned down; quieter ones left as is.",
  },
  {
    name: "Apple Music",
    lufs: -16,
    group: "Streaming",
    description: "Sound Check normalizes to -16 LUFS. User-togglable but on by default.",
  },
  {
    name: "YouTube",
    lufs: -14,
    group: "Streaming",
    description: "Normalizes to roughly -14 LUFS. Loud masters are turned down automatically.",
  },
  {
    name: "Tidal",
    lufs: -14,
    group: "Streaming",
    description: "ReplayGain-based normalization to -14 LUFS.",
  },
  {
    name: "Amazon Music",
    lufs: -14,
    group: "Streaming",
    description: "Normalizes to -14 LUFS.",
  },
  {
    name: "Deezer",
    lufs: -15,
    group: "Streaming",
    description: "Normalizes to -15 LUFS on mobile and web playback.",
  },
  {
    name: "Qobuz",
    lufs: -14,
    group: "Streaming",
    description: "Optional ReplayGain normalization to -14 LUFS. Off by default in hi-res mode.",
  },
  {
    name: "Pandora",
    lufs: -14,
    group: "Streaming",
    description: "Normalizes to -14 LUFS.",
  },
  {
    name: "EBU R128",
    lufs: -23,
    group: "Broadcast",
    description: "European broadcast standard: -23 LUFS integrated loudness target for TV and radio.",
  },
  {
    name: "ATSC A/85",
    lufs: -24,
    group: "Broadcast",
    description: "US broadcast standard (CALM Act): -24 LKFS integrated loudness target.",
  },
  {
    name: "ITU-R BS.1770",
    lufs: -24,
    group: "Broadcast",
    description: "International loudness measurement spec: -24 LUFS reference used by both EBU and ATSC.",
  },
  {
    name: "Instagram/Reels",
    lufs: -14,
    group: "Social",
    description: "Normalizes to around -14 LUFS in feed playback.",
  },
  {
    name: "TikTok",
    lufs: -14,
    group: "Social",
    description: "Normalizes to around -14 LUFS in the in-feed audio path.",
  },
  {
    name: "Facebook",
    lufs: -16,
    group: "Social",
    description: "Normalizes to around -16 LUFS for video audio.",
  },
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
 *  it risks clipping after lossy encoding.
 *
 *  Description field is shown as a tooltip on each row's name and
 *  explains why the platform cares about this ceiling. */
export const TRUE_PEAK_TARGETS = [
  {
    name: "Spotify",
    dbtp: -1,
    group: "Streaming",
    description: "Spotify recommends -1 dBTP ceiling to avoid clipping after Ogg Vorbis encoding.",
  },
  {
    name: "Spotify (Loud)",
    dbtp: -2,
    group: "Streaming",
    description: "Loud normalization mode applies additional limiting; requires a stricter -2 dBTP ceiling.",
  },
  {
    name: "Apple Music",
    dbtp: -1,
    group: "Streaming",
    description: "Apple Digital Masters certification requires a -1 dBTP ceiling.",
  },
  {
    name: "YouTube",
    dbtp: -1,
    group: "Streaming",
    description: "Recommended -1 dBTP ceiling to leave headroom for AAC/Opus encoding.",
  },
  {
    name: "Tidal",
    dbtp: -1,
    group: "Streaming",
    description: "-1 dBTP ceiling recommended for lossy codec delivery.",
  },
  {
    name: "Amazon Music",
    dbtp: -2,
    group: "Streaming",
    description: "-2 dBTP ceiling recommended for their codec pipeline.",
  },
  {
    name: "Deezer",
    dbtp: -1,
    group: "Streaming",
    description: "-1 dBTP ceiling for lossy delivery.",
  },
  {
    name: "Qobuz",
    dbtp: -1,
    group: "Streaming",
    description: "-1 dBTP ceiling on both hi-res and lossy streams.",
  },
  {
    name: "Pandora",
    dbtp: -1,
    group: "Streaming",
    description: "-1 dBTP ceiling for their AAC delivery chain.",
  },
  {
    name: "EBU R128",
    dbtp: -1,
    group: "Broadcast",
    description: "European broadcast spec: maximum true peak of -1 dBTP for delivery masters.",
  },
  {
    name: "ATSC A/85",
    dbtp: -2,
    group: "Broadcast",
    description: "US broadcast spec: maximum true peak of -2 dBTP.",
  },
  {
    name: "ITU-R BS.1770",
    dbtp: -1,
    group: "Broadcast",
    description: "International true peak measurement reference, -1 dBTP ceiling.",
  },
  {
    name: "Instagram/Reels",
    dbtp: -1,
    group: "Social",
    description: "-1 dBTP recommended to avoid inter-sample overs on mobile playback.",
  },
  {
    name: "TikTok",
    dbtp: -1,
    group: "Social",
    description: "-1 dBTP recommended for their in-feed encoding chain.",
  },
  {
    name: "Facebook",
    dbtp: -1,
    group: "Social",
    description: "-1 dBTP recommended for the video encoding pipeline.",
  },
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

/** Minimum clip sample count to flag as clipping. IMPORTANT context: the
 *  worker populates clip_sample_count from FFmpeg astats' Peak_count, which
 *  is "number of occasions the signal attained either min or max values" —
 *  i.e. the signal's own min/max, not digital full scale. Every file has
 *  Peak_count ≥ 1 regardless of whether it's clipped.
 *
 *  To make this signal meaningful, the pill logic requires BOTH
 *  clip_sample_count > this threshold AND sample_peak_dbfs near full scale.
 *  This threshold is the "enough occasions to suggest a limiter sat at
 *  full scale" floor — clean files show 2-20, genuinely clipped files
 *  are in the thousands. */
export const CLIPPING_SAMPLE_COUNT_THRESHOLD = 1000;

/** Clip sample counts above this are considered severe rather than
 *  borderline (used for severity coloring only). */
export const CLIPPING_SEVERE_SAMPLE_COUNT = 10000;

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
  // Clipping requires BOTH a high Peak_count from astats AND the sample
  // peak being at/near full scale. Peak_count alone is unreliable (it
  // counts a clean file's own peaks too); pairing it with sample peak near
  // 0 dBFS is what makes it mean "the limiter sat on full scale for a while."
  const hasClipping =
    clipSampleCount != null &&
    clipSampleCount > CLIPPING_SAMPLE_COUNT_THRESHOLD &&
    samplePeakDbfs != null &&
    samplePeakDbfs >= SAMPLE_PEAK_AT_FULL_SCALE_DBFS;
  if (hasClipping) issues.push("clipping");

  if (
    samplePeakDbfs != null &&
    samplePeakDbfs >= SAMPLE_PEAK_AT_FULL_SCALE_DBFS &&
    // Don't double-count when clipping is already flagged, since clipping
    // implies sample peak at full scale. Keep this as a separate flag only
    // when clipping didn't trigger.
    !hasClipping
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
