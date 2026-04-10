/**
 * Signed URL utilities for the track-audio storage bucket.
 *
 * The track-audio bucket is private. Audio file paths are stored in
 * track_audio_versions.audio_url as storage paths (e.g. "userId/trackId/v1.wav").
 * Server components call signAudioVersions() before passing data to clients.
 */

import { createSupabaseServiceClient } from "./supabaseServiceClient";

const BUCKET = "track-audio";
const SIGNED_URL_EXPIRY = 7200; // 2 hours in seconds

/** Public URL prefix to strip when normalizing legacy full URLs to paths */
const PUBLIC_PREFIX_RE =
  /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/track-audio\//;

/**
 * Normalize a value that might be a full public URL or a bare storage path.
 * Returns the bare storage path in both cases.
 */
export function extractStoragePath(urlOrPath: string): string {
  return urlOrPath.replace(PUBLIC_PREFIX_RE, "");
}

/**
 * Generate a signed URL for a single storage path.
 */
export async function getSignedAudioUrl(
  storagePath: string,
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const path = extractStoragePath(storagePath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.warn("[storage-urls] Failed to sign:", path, error?.message);
    return storagePath; // fallback to raw path
  }
  return data.signedUrl;
}

/**
 * Batch-sign multiple storage paths. Returns a Map<path, signedUrl>.
 */
export async function getSignedAudioUrls(
  storagePaths: string[],
): Promise<Map<string, string>> {
  if (storagePaths.length === 0) return new Map();

  const supabase = createSupabaseServiceClient();
  const normalized = storagePaths.map(extractStoragePath);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(normalized, SIGNED_URL_EXPIRY);

  const result = new Map<string, string>();
  if (error || !data) {
    console.warn("[storage-urls] Batch sign failed:", error?.message);
    // Fallback: map each path to itself
    for (const p of normalized) result.set(p, p);
    return result;
  }

  for (let i = 0; i < normalized.length; i++) {
    result.set(normalized[i], data[i]?.signedUrl ?? normalized[i]);
  }
  return result;
}

/**
 * Sign all audio_url values in an array of audio versions.
 * Sets audio_url to the signed URL and storage_path to the raw path.
 *
 * T must have at least { audio_url: string }.
 */
export async function signAudioVersions<
  T extends { audio_url: string; storage_path?: string },
>(versions: T[]): Promise<T[]> {
  if (versions.length === 0) return versions;

  const paths = versions.map((v) => extractStoragePath(v.audio_url));
  const signedMap = await getSignedAudioUrls(paths);

  return versions.map((v, i) => ({
    ...v,
    storage_path: paths[i],
    audio_url: signedMap.get(paths[i]) ?? v.audio_url,
  }));
}
