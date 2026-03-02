import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

/* ------------------------------------------------------------------ */
/*  Supabase client (service role — bypasses RLS)                      */
/* ------------------------------------------------------------------ */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* ------------------------------------------------------------------ */
/*  Download source audio from the public track-audio bucket           */
/* ------------------------------------------------------------------ */

export async function downloadSourceAudio(
  audioUrl: string,
  destPath: string,
): Promise<void> {
  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buffer);
}

/* ------------------------------------------------------------------ */
/*  Upload converted file to the private track-conversions bucket      */
/* ------------------------------------------------------------------ */

export async function uploadConvertedFile(
  filePath: string,
  storagePath: string,
  contentType: string,
): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);

  const { error } = await supabase.storage
    .from("track-conversions")
    .upload(storagePath, fileBuffer, {
      upsert: true,
      contentType,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Generate a 7-day signed URL
  const { data: signedData, error: signError } = await supabase.storage
    .from("track-conversions")
    .createSignedUrl(storagePath, 7 * 24 * 60 * 60);

  if (signError || !signedData?.signedUrl) {
    throw new Error(`Signed URL failed: ${signError?.message ?? "unknown"}`);
  }

  return signedData.signedUrl;
}

/* ------------------------------------------------------------------ */
/*  Get the file size of a local file                                  */
/* ------------------------------------------------------------------ */

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/* ------------------------------------------------------------------ */
/*  Fetch track title for naming the output file                       */
/* ------------------------------------------------------------------ */

export async function getTrackTitle(trackId: string): Promise<string> {
  const { data } = await supabase
    .from("tracks")
    .select("title")
    .eq("id", trackId)
    .single();
  return data?.title ?? "Untitled";
}

/* ------------------------------------------------------------------ */
/*  Get the source audio URL from track_audio_versions                 */
/* ------------------------------------------------------------------ */

export async function getAudioVersionUrl(
  audioVersionId: string,
): Promise<string> {
  const { data } = await supabase
    .from("track_audio_versions")
    .select("audio_url")
    .eq("id", audioVersionId)
    .single();

  if (!data?.audio_url) {
    throw new Error(`Audio version ${audioVersionId} not found or has no URL`);
  }

  return data.audio_url;
}

/* ------------------------------------------------------------------ */
/*  Sanitize a filename for storage paths                              */
/* ------------------------------------------------------------------ */

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_.()]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

/* ------------------------------------------------------------------ */
/*  MIME type from format                                               */
/* ------------------------------------------------------------------ */

export function getContentType(format: string): string {
  const map: Record<string, string> = {
    wav: "audio/wav",
    aiff: "audio/aiff",
    flac: "audio/flac",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
  };
  const ext = path.extname(format).replace(".", "") || format;
  return map[ext] ?? "application/octet-stream";
}
