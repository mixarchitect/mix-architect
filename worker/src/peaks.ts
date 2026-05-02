import { spawn } from "node:child_process";

/* ------------------------------------------------------------------ */
/*  Waveform peak generation                                           */
/* ------------------------------------------------------------------ */

/**
 * Target peak count per track. Chosen to be high enough that wide
 * desktop waveforms render at native resolution (~1400 px → ~480 bars
 * at barWidth=3 + barGap=1) without aliasing, and low enough to keep
 * the JSON payload small (~50 KB).
 */
const PEAK_COUNT = 8000;

/**
 * Sample rate to extract PCM at. Lower = faster + cheaper, but loses
 * peak fidelity for short percussive transients. 8 kHz is enough
 * accuracy for waveform display since each bucket already aggregates
 * many samples.
 */
const PCM_SAMPLE_RATE = 8000;

/**
 * Compute waveform peaks from an audio file using FFmpeg.
 *
 * Returns a `number[][]` shaped to match WaveSurfer's `peaks` config:
 * a single-channel mono representation where each value is the absolute
 * peak amplitude in [0, 1] for one bucket of samples.
 *
 * Storing peaks in `track_audio_versions.waveform_peaks` lets the
 * client render the waveform without decoding the source audio,
 * eliminating the cold-render outlier (multi-second AudioBuffer decode
 * for a fresh track).
 */
export async function computeWaveformPeaks(
  filePath: string,
  durationSec: number,
): Promise<number[][]> {
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    throw new Error(`Invalid duration: ${durationSec}`);
  }

  const buffer = await extractMonoFloatPcm(filePath);
  const peaks = bucketPeaks(buffer, PEAK_COUNT);
  return [peaks];
}

/**
 * Pipe the file through FFmpeg, downmixing to mono and resampling to
 * 8 kHz, and collect the raw 32-bit float little-endian PCM stream.
 */
function extractMonoFloatPcm(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-nostats",
      "-hide_banner",
      "-i", filePath,
      "-ac", "1",
      "-ar", String(PCM_SAMPLE_RATE),
      "-f", "f32le",
      "-acodec", "pcm_f32le",
      "-",
    ]);

    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let stderr = "";

    ff.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      totalBytes += chunk.length;
    });
    ff.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    ff.once("error", reject);
    ff.once("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `ffmpeg pcm extraction exited with code ${code}: ${stderr.slice(-512)}`,
          ),
        );
      }
      resolve(Buffer.concat(chunks, totalBytes));
    });
  });
}

/**
 * Bucket Float32 PCM samples into `peakCount` peak values, each the
 * max absolute amplitude in its bucket.
 */
function bucketPeaks(buf: Buffer, peakCount: number): number[] {
  const sampleCount = Math.floor(buf.length / 4);
  if (sampleCount === 0 || peakCount === 0) return [];

  const targetCount = Math.min(peakCount, sampleCount);
  const peaks: number[] = new Array(targetCount).fill(0);
  const samplesPerBucket = sampleCount / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * samplesPerBucket);
    const end = Math.min(sampleCount, Math.floor((i + 1) * samplesPerBucket));
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(buf.readFloatLE(j * 4));
      if (v > max) max = v;
    }
    peaks[i] = max;
  }
  return peaks;
}
