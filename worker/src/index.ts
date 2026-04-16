import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  supabase,
  downloadSourceAudio,
  uploadConvertedFile,
  getFileSize,
  getTrackTitle,
  getAudioVersionUrl,
  getTrackMetadata,
  downloadArtwork,
  sanitizeFilename,
  getContentType,
} from "./storage.js";
import {
  probeSource,
  isSourceFormat,
  isLossyCodec,
  normalizeFormat,
  convertAudio,
  getExtension,
} from "./converter.js";
import { analyzeLoudness } from "./loudness.js";

/** Current loudness analysis algorithm version. Bump when parser or
 *  FFmpeg filter chain changes in a way that should trigger reanalysis. */
const LOUDNESS_ANALYSIS_VERSION = 1;

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS ?? "5000", 10);
const TEMP_DIR = path.join(os.tmpdir(), "mix-architect-worker");

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ConversionJob = {
  id: string;
  audio_version_id: string;
  track_id: string;
  source_format: string;
  target_format: string;
  requested_by: string;
};

/* ------------------------------------------------------------------ */
/*  Main loop                                                          */
/* ------------------------------------------------------------------ */

async function main() {
  await fs.mkdir(TEMP_DIR, { recursive: true });

  console.log("🎵 Mix Architect audio converter worker started");
  console.log(`   Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`   Temp directory: ${TEMP_DIR}`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await processNextJob();
      await processNextAnalysis();
    } catch (err) {
      console.error("Worker loop error:", err);
    }
    await sleep(POLL_INTERVAL);
  }
}

/* ------------------------------------------------------------------ */
/*  Process a single job                                               */
/* ------------------------------------------------------------------ */

async function processNextJob() {
  // Grab the oldest pending job
  const { data: jobs } = await supabase
    .from("conversion_jobs")
    .select("id, audio_version_id, track_id, source_format, target_format, requested_by")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);

  if (!jobs?.length) return;
  const job = jobs[0] as ConversionJob;

  // Claim the job (optimistic lock)
  const { error: claimError } = await supabase
    .from("conversion_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "pending");

  if (claimError) {
    console.warn(`Failed to claim job ${job.id}:`, claimError.message);
    return;
  }

  console.log(
    `Processing job ${job.id}: ${job.source_format} → ${job.target_format}`,
  );

  const jobDir = path.join(TEMP_DIR, job.id);
  await fs.mkdir(jobDir, { recursive: true });

  try {
    // 1. Get the source audio URL
    const audioUrl = await getAudioVersionUrl(job.audio_version_id);

    // 2. Download source audio
    const sourceExt = job.source_format || "wav";
    const sourcePath = path.join(jobDir, `source.${sourceExt}`);
    await downloadSourceAudio(audioUrl, sourcePath);
    console.log(`  Downloaded source (${sourceExt})`);

    // 3. Probe source properties
    const sourceInfo = await probeSource(sourcePath);
    console.log(
      `  Source: ${sourceInfo.codecName}, ${sourceInfo.sampleRate}Hz, ${sourceInfo.bitDepth}-bit, ${sourceInfo.channels}ch`,
    );

    // 4. Fetch metadata for embedding in tagged formats
    const { metadata, artworkUrl } = await getTrackMetadata(
      job.track_id,
      job.audio_version_id,
    );
    console.log(
      `  Metadata: ${Object.keys(metadata).length} tags, artwork: ${artworkUrl ? "yes" : "no"}`,
    );

    // 5. Download artwork if available
    let artworkPath: string | null = null;
    if (artworkUrl) {
      artworkPath = await downloadArtwork(artworkUrl, jobDir);
      if (artworkPath) console.log(`  Downloaded cover art`);
    }

    // 6. Convert (or use source directly if already in target format)
    let outputPath: string;

    if (isSourceFormat(job.target_format, sourceInfo)) {
      console.log(`  Source is already ${job.target_format} — using as-is`);
      outputPath = sourcePath;
    } else {
      const ext = getExtension(job.target_format);
      outputPath = path.join(jobDir, `output.${ext}`);
      await convertAudio(
        sourcePath,
        outputPath,
        job.target_format,
        sourceInfo,
        metadata,
        artworkPath,
      );
      console.log(`  Converted to ${job.target_format}`);
    }

    // 7. Upload to Supabase Storage
    const trackTitle = await getTrackTitle(job.track_id);
    const ext = getExtension(job.target_format);
    const safeName = sanitizeFilename(trackTitle);
    const storagePath = `${job.requested_by}/${job.track_id}/${job.audio_version_id}/${safeName}.${ext}`;
    const mimeType = getContentType(ext);

    const signedUrl = await uploadConvertedFile(
      outputPath,
      storagePath,
      mimeType,
    );
    console.log(`  Uploaded to storage`);

    // 8. Get output file size
    const fileSize = await getFileSize(outputPath);

    // 9. Mark job complete
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Build a summary of what was embedded (for UI display)
    const embeddedSummary: Record<string, string | boolean> = {};
    for (const [key, val] of Object.entries(metadata)) {
      if (key === "lyrics") {
        // Show word count instead of full text
        const words = val.trim().split(/\s+/).length;
        embeddedSummary.lyrics = `${words} words`;
      } else {
        embeddedSummary[key] = val;
      }
    }
    if (artworkPath) embeddedSummary.artwork = true;

    await supabase
      .from("conversion_jobs")
      .update({
        status: "completed",
        output_url: signedUrl,
        output_file_size: fileSize,
        completed_at: new Date().toISOString(),
        expires_at: expiresAt,
        embedded_metadata: embeddedSummary,
      })
      .eq("id", job.id);

    // Notify the requesting user that their export is ready
    const { data: track } = await supabase
      .from("tracks")
      .select("release_id, title")
      .eq("id", job.track_id)
      .single();

    if (track?.release_id) {
      await supabase.from("notifications").insert({
        user_id: job.requested_by,
        type: "export_complete",
        title: `Export ready: ${track.title ?? "Untitled"}`,
        body: `Your ${job.target_format.toUpperCase()} conversion is ready for download`,
        release_id: track.release_id,
        track_id: job.track_id,
      });
    }

    console.log(`✅ Job ${job.id} complete`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Job ${job.id} failed:`, message);

    await supabase
      .from("conversion_jobs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  } finally {
    // Cleanup temp files
    await fs.rm(jobDir, { recursive: true, force: true }).catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/*  Process a single spec analysis                                     */
/* ------------------------------------------------------------------ */

async function processNextAnalysis() {
  // Grab the oldest row that needs (re)analysis. Two classes qualify:
  //   (a) Newly uploaded rows: spec_analysis_status = 'pending'
  //   (b) Stale rows from older pipeline: status = 'complete' but
  //       analysis_version is NULL (never ran through the loudness pass)
  const { data: rows } = await supabase
    .from("track_audio_versions")
    .select("id, audio_url, file_name, spec_analysis_status, analysis_version")
    .or(
      `spec_analysis_status.eq.pending,and(spec_analysis_status.eq.complete,analysis_version.is.null)`,
    )
    .order("created_at", { ascending: true })
    .limit(1);

  if (!rows?.length) return;
  const row = rows[0];
  const isBackfill = row.spec_analysis_status === "complete";

  // Claim the analysis (optimistic lock). For pending rows we transition
  // to 'analyzing'. For backfill rows we leave spec_analysis_status alone
  // (it's already 'complete') and use analysis_version as the lock: only
  // claim if it's still NULL.
  if (isBackfill) {
    const { error: claimError, data: claimed } = await supabase
      .from("track_audio_versions")
      .update({ analysis_version: 0 }) // 0 = "in progress" sentinel
      .eq("id", row.id)
      .is("analysis_version", null)
      .select("id");

    if (claimError || !claimed?.length) {
      if (claimError) {
        console.warn(`Failed to claim backfill ${row.id}:`, claimError.message);
      }
      return;
    }
  } else {
    const { error: claimError } = await supabase
      .from("track_audio_versions")
      .update({ spec_analysis_status: "analyzing" })
      .eq("id", row.id)
      .eq("spec_analysis_status", "pending");

    if (claimError) {
      console.warn(`Failed to claim analysis ${row.id}:`, claimError.message);
      return;
    }
  }

  console.log(
    `${isBackfill ? "Backfilling" : "Analyzing"} loudness for ${row.id} (${row.file_name ?? "unknown"})`,
  );

  const analysisDir = path.join(TEMP_DIR, `analyze-${row.id}`);
  await fs.mkdir(analysisDir, { recursive: true });

  try {
    // Download source audio
    const ext = row.file_name?.split(".").pop() ?? "wav";
    const sourcePath = path.join(analysisDir, `source.${ext}`);
    await downloadSourceAudio(row.audio_url, sourcePath);

    // Run ffprobe + loudness analysis in parallel (both read the same file
    // but from different processes — OS page cache makes the second read
    // cheap).
    const [info, loudness] = await Promise.all([
      probeSource(sourcePath),
      analyzeLoudness(sourcePath),
    ]);
    const format = normalizeFormat(info.formatName, info.codecName);
    const lossy = isLossyCodec(info.codecName);

    // Build update payload. For backfill rows, only touch loudness fields
    // so we don't disturb format metadata that's already correct.
    const update: Record<string, unknown> = {
      measured_lufs: loudness.integratedLufs,
      loudness_range: loudness.loudnessRange,
      sample_peak_dbfs: loudness.samplePeakDbfs,
      true_peak_dbtp: loudness.truePeakDbtp,
      dc_offset: loudness.dcOffset,
      clip_sample_count: loudness.clipSampleCount,
      analysis_version: LOUDNESS_ANALYSIS_VERSION,
    };

    if (!isBackfill) {
      update.sample_rate = info.sampleRate;
      update.bit_depth = lossy ? null : info.bitDepth;
      update.channels = info.channels;
      update.codec = info.codecName;
      update.file_format = format;
      update.duration_seconds = info.duration > 0 ? info.duration : null;
      update.spec_analysis_status = "complete";
    }

    const { error } = await supabase
      .from("track_audio_versions")
      .update(update)
      .eq("id", row.id);

    if (error) throw error;

    console.log(
      `  Detected: ${format}, ${info.sampleRate}Hz, ${lossy ? "lossy" : `${info.bitDepth}-bit`}, ${info.channels}ch`,
    );
    console.log(
      `  Loudness: ${fmt(loudness.integratedLufs, "LUFS")}, true peak ${fmt(loudness.truePeakDbtp, "dBTP")}, ${loudness.clipSampleCount ?? "?"} clipped`,
    );
    console.log(`✅ Analysis ${row.id} complete`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Analysis ${row.id} failed:`, message);

    try {
      if (isBackfill) {
        // Reset the sentinel so the row can be retried on the next pass.
        // (Could mark it -1 to prevent retry loops if this becomes an
        // issue, but with 10 existing files that's overkill.)
        await supabase
          .from("track_audio_versions")
          .update({ analysis_version: null })
          .eq("id", row.id);
      } else {
        await supabase
          .from("track_audio_versions")
          .update({ spec_analysis_status: "failed" })
          .eq("id", row.id);
      }
    } catch {
      // Ignore cleanup errors
    }
  } finally {
    await fs.rm(analysisDir, { recursive: true, force: true }).catch(() => {});
  }
}

function fmt(value: number | null, unit: string): string {
  return value == null ? `—` : `${value.toFixed(1)} ${unit}`;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
