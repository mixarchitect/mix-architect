import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type LoudnessResult = {
  /** Integrated loudness (ITU-R BS.1770-4, gated) in LUFS. Null if silence. */
  integratedLufs: number | null;
  /** Loudness range in LU. Null if silence. */
  loudnessRange: number | null;
  /** Raw sample peak in dBFS. Null if silence. */
  samplePeakDbfs: number | null;
  /** True peak (4× oversampled) in dBTP. Null if silence. */
  truePeakDbtp: number | null;
  /** DC offset as a fraction of full scale (abs value across channels). */
  dcOffset: number | null;
  /** Number of samples at exactly ±full-scale (strict digital clipping). */
  clipSampleCount: number | null;
};

/* ------------------------------------------------------------------ */
/*  Analyze loudness + peak + clipping + DC offset in a single pass    */
/* ------------------------------------------------------------------ */

/**
 * Runs a single FFmpeg pass combining ebur128 (for LUFS/LRA/peaks) and
 * astats (for DC offset + clipping count). Both filters are pass-through
 * measurement filters, so chaining them does not alter the audio.
 *
 * Output is written to `-f null -` (discarded). All metrics are parsed
 * from stderr.
 */
export async function analyzeLoudness(filePath: string): Promise<LoudnessResult> {
  const { stderr } = await execFileAsync(
    "ffmpeg",
    [
      "-nostats",
      "-hide_banner",
      "-i", filePath,
      "-af", "ebur128=peak=sample+true,astats=metadata=1:reset=0",
      "-f", "null",
      "-",
    ],
    { maxBuffer: 256 * 1024 * 1024 },
  );

  return parseLoudnessOutput(stderr);
}

/* ------------------------------------------------------------------ */
/*  Parser                                                             */
/* ------------------------------------------------------------------ */

/**
 * Parses FFmpeg stderr output from a combined ebur128+astats run.
 * Exported for testability — callers should use analyzeLoudness.
 */
export function parseLoudnessOutput(stderr: string): LoudnessResult {
  return {
    integratedLufs: extractEbur128("Integrated loudness", "I", "LUFS", stderr),
    loudnessRange: extractEbur128("Loudness range", "LRA", "LU", stderr),
    samplePeakDbfs: extractEbur128("Sample peak", "Peak", "dBFS", stderr),
    truePeakDbtp: extractEbur128("True peak", "Peak", "dBFS", stderr),
    dcOffset: extractAstatsOverallAbsDcOffset(stderr),
    clipSampleCount: extractAstatsOverallPeakCount(stderr),
  };
}

/**
 * Extract a value from an ebur128 Summary sub-section. Handles the two-line
 * structure where the section header is on one line and the value on the next:
 *
 *   Integrated loudness:
 *     I:         -14.9 LUFS
 */
function extractEbur128(
  sectionLabel: string,
  valueLabel: string,
  unit: string,
  stderr: string,
): number | null {
  // `\s` matches newlines in JS regex by default, so this crosses lines.
  const pattern = new RegExp(
    `${escapeRegex(sectionLabel)}:\\s+${escapeRegex(valueLabel)}:\\s+(-?\\d+(?:\\.\\d+)?|-?inf)\\s+${escapeRegex(unit)}`,
  );
  const match = stderr.match(pattern);
  if (!match) return null;
  const raw = match[1];
  if (raw === "-inf" || raw === "inf") return null;
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * astats prints per-channel blocks, then an "Overall" block with the
 * aggregated values we want. Each metric line is prefixed with the
 * `[Parsed_astats_...] ` filter tag.
 *
 * We extract the Overall block first, then pull the requested metric.
 */
function getAstatsOverallBlock(stderr: string): string | null {
  // "Overall" appears after all per-channel blocks. There's no explicit
  // block terminator, so we capture to the end of astats output (or end of
  // stderr if astats is the last filter).
  const match = stderr.match(/Overall[\s\S]*$/);
  return match ? match[0] : null;
}

function extractAstatsOverallAbsDcOffset(stderr: string): number | null {
  const block = getAstatsOverallBlock(stderr);
  if (!block) return null;
  const match = block.match(/DC offset:\s+(-?\d+(?:\.\d+)?|-?inf)/);
  if (!match) return null;
  const raw = match[1];
  if (raw === "-inf" || raw === "inf") return null;
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  return Math.abs(value);
}

function extractAstatsOverallPeakCount(stderr: string): number | null {
  const block = getAstatsOverallBlock(stderr);
  if (!block) return null;
  // Peak count is the number of samples at exactly ±full-scale.
  // Format: "Peak count: 0" or "Peak count: 1247"
  const match = block.match(/Peak count:\s+(\d+)/);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
