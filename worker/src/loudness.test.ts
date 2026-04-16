/**
 * Smoke tests for the loudness parser. Run with: npx tsx src/loudness.test.ts
 *
 * These do NOT invoke ffmpeg — they validate parsing against canonical
 * stderr samples. End-to-end worker tests happen on Railway.
 */

import { parseLoudnessOutput } from "./loudness.js";

type Test = { name: string; fn: () => void };
const tests: Test[] = [];
function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}
function assertEq<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Canonical ebur128 + astats stderr for a well-behaved stereo WAV.
// Structure matches FFmpeg 6.x output with peak=sample+true and astats
// metadata=1. Values chosen to exercise positive, negative, and fractional parsing.
const CANONICAL_OUTPUT = `
Input #0, wav, from 'test.wav':
  Duration: 00:04:12.34, bitrate: 2304 kb/s
  Stream #0:0: Audio: pcm_s24le, 48000 Hz, stereo, s32 (24 bit), 2304 kb/s
Stream mapping:
  Stream #0:0 -> #0:0 (pcm_s24le (native) -> pcm_s16le (native))
Press [q] to stop, [?] for help
Output #0, null, to 'pipe:':
  Metadata:
    encoder         : Lavf60.16.100
  Stream #0:0: Audio: pcm_s16le, 48000 Hz, stereo, s16, 1536 kb/s
[Parsed_astats_1 @ 0x55c0] Channel: 1
[Parsed_astats_1 @ 0x55c0] DC offset: 0.000012
[Parsed_astats_1 @ 0x55c0] Min level: -0.986389
[Parsed_astats_1 @ 0x55c0] Max level: 0.987091
[Parsed_astats_1 @ 0x55c0] Peak level dB: -0.114326
[Parsed_astats_1 @ 0x55c0] RMS level dB: -18.440000
[Parsed_astats_1 @ 0x55c0] Peak count: 0
[Parsed_astats_1 @ 0x55c0] Number of samples: 12100000
[Parsed_astats_1 @ 0x55c0] Channel: 2
[Parsed_astats_1 @ 0x55c0] DC offset: 0.000008
[Parsed_astats_1 @ 0x55c0] Peak level dB: -0.098421
[Parsed_astats_1 @ 0x55c0] Peak count: 1247
[Parsed_astats_1 @ 0x55c0] Number of samples: 12100000
[Parsed_astats_1 @ 0x55c0] Overall
[Parsed_astats_1 @ 0x55c0] DC offset: 0.000010
[Parsed_astats_1 @ 0x55c0] Min level: -0.986389
[Parsed_astats_1 @ 0x55c0] Max level: 0.987091
[Parsed_astats_1 @ 0x55c0] Peak level dB: -0.098421
[Parsed_astats_1 @ 0x55c0] RMS level dB: -18.440000
[Parsed_astats_1 @ 0x55c0] Peak count: 1247
[Parsed_astats_1 @ 0x55c0] Number of samples: 24200000
[Parsed_ebur128_0 @ 0x55c0] Summary:

  Integrated loudness:
    I:         -14.87 LUFS
    Threshold: -25.32 LUFS

  Loudness range:
    LRA:         6.23 LU
    Threshold: -35.31 LUFS
    LRA low:   -20.12 LUFS
    LRA high:  -13.89 LUFS

  Sample peak:
    Peak:       -0.10 dBFS

  True peak:
    Peak:       -0.08 dBFS
`;

test("parses ebur128 integrated LUFS", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  assertEq(result.integratedLufs, -14.87, "integratedLufs");
});

test("parses ebur128 loudness range", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  assertEq(result.loudnessRange, 6.23, "loudnessRange");
});

test("parses ebur128 sample peak", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  assertEq(result.samplePeakDbfs, -0.1, "samplePeakDbfs");
});

test("parses ebur128 true peak", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  assertEq(result.truePeakDbtp, -0.08, "truePeakDbtp");
});

test("parses astats DC offset from Overall block (not per-channel)", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  // Overall DC offset is 0.000010, not per-channel 0.000012
  assertEq(result.dcOffset, 0.00001, "dcOffset");
});

test("parses astats Peak count from Overall block", () => {
  const result = parseLoudnessOutput(CANONICAL_OUTPUT);
  assertEq(result.clipSampleCount, 1247, "clipSampleCount");
});

test("returns null for silence (-inf LUFS)", () => {
  const silent = `
[Parsed_ebur128_0 @ 0x0] Summary:

  Integrated loudness:
    I:         -inf LUFS
    Threshold: -70.00 LUFS

  Loudness range:
    LRA:         0.00 LU
    Threshold: -inf LUFS

  Sample peak:
    Peak:       -inf dBFS

  True peak:
    Peak:       -inf dBFS
`;
  const result = parseLoudnessOutput(silent);
  assertEq(result.integratedLufs, null, "integratedLufs should be null for -inf");
  assertEq(result.samplePeakDbfs, null, "samplePeakDbfs should be null for -inf");
  assertEq(result.truePeakDbtp, null, "truePeakDbtp should be null for -inf");
});

test("handles true peak exceeding 0 dBFS (inter-sample peak overs)", () => {
  const hot = `
[Parsed_ebur128_0 @ 0x0] Summary:

  Integrated loudness:
    I:         -8.00 LUFS
    Threshold: -18.00 LUFS

  Loudness range:
    LRA:         2.00 LU
    Threshold: -28.00 LUFS

  Sample peak:
    Peak:       -0.00 dBFS

  True peak:
    Peak:        0.47 dBFS
`;
  const result = parseLoudnessOutput(hot);
  assertEq(result.truePeakDbtp, 0.47, "truePeakDbtp positive value");
});

test("handles missing astats (returns null, not throw)", () => {
  const ebur128Only = `
[Parsed_ebur128_0 @ 0x0] Summary:

  Integrated loudness:
    I:         -14.00 LUFS
    Threshold: -24.00 LUFS

  Loudness range:
    LRA:         5.00 LU
    Threshold: -34.00 LUFS

  Sample peak:
    Peak:       -1.00 dBFS

  True peak:
    Peak:       -0.50 dBFS
`;
  const result = parseLoudnessOutput(ebur128Only);
  assertEq(result.integratedLufs, -14, "integratedLufs still parses");
  assertEq(result.dcOffset, null, "dcOffset null when astats missing");
  assertEq(result.clipSampleCount, null, "clipSampleCount null when astats missing");
});

/* ------------------------------------------------------------------ */

let passed = 0;
let failed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log(`✓ ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${t.name}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
