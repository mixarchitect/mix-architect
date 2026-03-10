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

    // 4. Convert (or use source directly if already in target format)
    let outputPath: string;

    if (isSourceFormat(job.target_format, sourceInfo)) {
      console.log(`  Source is already ${job.target_format} — using as-is`);
      outputPath = sourcePath;
    } else {
      const ext = getExtension(job.target_format);
      outputPath = path.join(jobDir, `output.${ext}`);
      await convertAudio(sourcePath, outputPath, job.target_format, sourceInfo);
      console.log(`  Converted to ${job.target_format}`);
    }

    // 5. Upload to Supabase Storage
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

    // 6. Get output file size
    const fileSize = await getFileSize(outputPath);

    // 7. Mark job complete
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await supabase
      .from("conversion_jobs")
      .update({
        status: "completed",
        output_url: signedUrl,
        output_file_size: fileSize,
        completed_at: new Date().toISOString(),
        expires_at: expiresAt,
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
  // Grab the oldest pending analysis
  const { data: rows } = await supabase
    .from("track_audio_versions")
    .select("id, audio_url, file_name")
    .eq("spec_analysis_status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);

  if (!rows?.length) return;
  const row = rows[0];

  // Claim the analysis (optimistic lock)
  const { error: claimError } = await supabase
    .from("track_audio_versions")
    .update({ spec_analysis_status: "analyzing" })
    .eq("id", row.id)
    .eq("spec_analysis_status", "pending");

  if (claimError) {
    console.warn(`Failed to claim analysis ${row.id}:`, claimError.message);
    return;
  }

  console.log(`Analyzing specs for ${row.id} (${row.file_name ?? "unknown"})`);

  const analysisDir = path.join(TEMP_DIR, `analyze-${row.id}`);
  await fs.mkdir(analysisDir, { recursive: true });

  try {
    // Download source audio
    const ext = row.file_name?.split(".").pop() ?? "wav";
    const sourcePath = path.join(analysisDir, `source.${ext}`);
    await downloadSourceAudio(row.audio_url, sourcePath);

    // Run ffprobe
    const info = await probeSource(sourcePath);
    const format = normalizeFormat(info.formatName, info.codecName);
    const lossy = isLossyCodec(info.codecName);

    // Write results back
    const { error } = await supabase
      .from("track_audio_versions")
      .update({
        sample_rate: info.sampleRate,
        bit_depth: lossy ? null : info.bitDepth,
        channels: info.channels,
        codec: info.codecName,
        file_format: format,
        duration_seconds: info.duration > 0 ? info.duration : null,
        spec_analysis_status: "complete",
      })
      .eq("id", row.id);

    if (error) throw error;

    console.log(
      `  Detected: ${format}, ${info.sampleRate}Hz, ${lossy ? "lossy" : `${info.bitDepth}-bit`}, ${info.channels}ch`,
    );
    console.log(`✅ Analysis ${row.id} complete`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Analysis ${row.id} failed:`, message);

    try {
      await supabase
        .from("track_audio_versions")
        .update({ spec_analysis_status: "failed" })
        .eq("id", row.id);
    } catch {
      // Ignore cleanup errors
    }
  } finally {
    await fs.rm(analysisDir, { recursive: true, force: true }).catch(() => {});
  }
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
