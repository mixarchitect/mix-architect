import { spawn } from "node:child_process";

/* ------------------------------------------------------------------ */
/*  Clipped-sample counting                                            */
/* ------------------------------------------------------------------ */

/**
 * A decoded sample counts as clipped at/above this absolute value.
 *
 * FFmpeg's int→float conversion divides by 2^(bits-1), so positive full
 * scale lands just below 1.0 (32767/32768 for 16-bit) while negative full
 * scale is exactly -1.0. The threshold sits above 16-bit positive rail
 * minus one code (32766/32768 ≈ 0.999939) so only true rail samples count,
 * for any integer bit depth. Float sources can legitimately exceed 1.0;
 * those count too, since they clip on any integer export.
 */
const CLIP_THRESHOLD = 0.99995;

const FFMPEG_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Count samples at digital full scale by streaming the file's PCM through
 * FFmpeg at native sample rate and channel count (no downmix — a single
 * clipped channel must be visible).
 *
 * This replaces the earlier astats "Peak count" parse: that field counts
 * occurrences of the channel's own min/max, not full scale, so every
 * non-silent stereo file reported exactly 2 regardless of level.
 */
export function countClippedSamples(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-nostats",
      "-hide_banner",
      "-i", filePath,
      "-f", "f32le",
      "-acodec", "pcm_f32le",
      "-",
    ]);

    let clipped = 0;
    // Bytes carried over when a chunk boundary splits a 4-byte float.
    let carry = Buffer.alloc(0);
    let stderr = "";
    let timedOut = false;

    const killTimer = setTimeout(() => {
      timedOut = true;
      ff.kill("SIGKILL");
    }, FFMPEG_TIMEOUT_MS);

    ff.stdout.on("data", (chunk: Buffer) => {
      const buf = carry.length > 0 ? Buffer.concat([carry, chunk]) : chunk;
      const sampleCount = Math.floor(buf.length / 4);
      for (let i = 0; i < sampleCount; i++) {
        const v = buf.readFloatLE(i * 4);
        if (v >= CLIP_THRESHOLD || v <= -CLIP_THRESHOLD) clipped++;
      }
      // Copy (not view) the ≤3-byte remainder so the full chunk can be GC'd.
      carry = Buffer.from(buf.subarray(sampleCount * 4));
    });
    ff.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    ff.once("error", (err) => {
      clearTimeout(killTimer);
      reject(err);
    });
    ff.once("close", (code) => {
      clearTimeout(killTimer);
      if (timedOut) {
        return reject(
          new Error(`ffmpeg clip scan killed after ${FFMPEG_TIMEOUT_MS}ms`),
        );
      }
      if (code !== 0) {
        return reject(
          new Error(
            `ffmpeg clip scan exited with code ${code}: ${stderr.slice(-512)}`,
          ),
        );
      }
      resolve(clipped);
    });
  });
}
