/**
 * Spec validation: compare detected audio specs against target delivery specs.
 */

export interface TrackTargetSpecs {
  target_sample_rate: number | null;
  target_bit_depth: number | null;
  target_channels: number | null;
  target_format: string | null;
}

export interface DetectedSpecs {
  sample_rate: number | null;
  bit_depth: number | null;
  channels: number | null;
  file_format: string | null;
}

export interface SpecMismatch {
  field: "sample_rate" | "bit_depth" | "channels" | "format";
  label: string;
  expected: string;
  actual: string;
}

export function compareSpecs(
  target: TrackTargetSpecs,
  detected: DetectedSpecs,
): SpecMismatch[] {
  const mismatches: SpecMismatch[] = [];

  if (
    target.target_sample_rate != null &&
    detected.sample_rate != null &&
    target.target_sample_rate !== detected.sample_rate
  ) {
    mismatches.push({
      field: "sample_rate",
      label: "Sample Rate",
      expected: formatSampleRateShort(target.target_sample_rate),
      actual: formatSampleRateShort(detected.sample_rate),
    });
  }

  if (
    target.target_bit_depth != null &&
    detected.bit_depth != null &&
    target.target_bit_depth !== detected.bit_depth
  ) {
    mismatches.push({
      field: "bit_depth",
      label: "Bit Depth",
      expected: `${target.target_bit_depth}-bit`,
      actual: `${detected.bit_depth}-bit`,
    });
  }

  if (
    target.target_channels != null &&
    detected.channels != null &&
    target.target_channels !== detected.channels
  ) {
    mismatches.push({
      field: "channels",
      label: "Channels",
      expected: formatChannels(target.target_channels),
      actual: formatChannels(detected.channels),
    });
  }

  if (
    target.target_format != null &&
    detected.file_format != null &&
    target.target_format.toLowerCase() !== detected.file_format.toLowerCase()
  ) {
    mismatches.push({
      field: "format",
      label: "Format",
      expected: target.target_format.toUpperCase(),
      actual: detected.file_format.toUpperCase(),
    });
  }

  return mismatches;
}

export function formatSampleRateShort(rate: number): string {
  const khz = rate / 1000;
  return `${khz}kHz`;
}

export function formatChannels(channels: number): string {
  if (channels === 1) return "Mono";
  if (channels === 2) return "Stereo";
  return `${channels}ch`;
}

/** Check whether any target specs are configured on a track. */
export function hasTargetSpecs(target: TrackTargetSpecs): boolean {
  return (
    target.target_sample_rate != null ||
    target.target_bit_depth != null ||
    target.target_channels != null ||
    target.target_format != null
  );
}
