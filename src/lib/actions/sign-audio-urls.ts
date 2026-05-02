"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getSignedAudioUrls, extractStoragePath } from "@/lib/storage-urls";

/**
 * Server action for client components that need signed audio URLs.
 *
 * Authorization: the user-scoped Supabase client below is RLS-bound, so
 * a query for `track_audio_versions` with `audio_url IN (paths)` only
 * returns rows the caller is allowed to read. We sign URLs ONLY for
 * paths backed by a row the caller can see, dropping any path that
 * isn't theirs from the result.
 *
 * Accepts an array of storage paths (or legacy full URLs).
 * Returns a record mapping each input path to its signed URL. Paths
 * the caller is not authorized for are omitted from the response.
 */
export async function signAudioUrlsAction(
  paths: string[],
): Promise<Record<string, string>> {
  // Guard against abuse — limit batch size
  if (!paths.length || paths.length > 100) return {};

  // Auth check
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const normalized = paths.map(extractStoragePath);

  // Build the set of values to look up. Some legacy rows store the
  // full public URL in `audio_url` rather than a bare path, so we
  // probe both forms.
  const lookupValues = new Set<string>();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  for (const p of normalized) {
    lookupValues.add(p);
    if (supabaseUrl) {
      lookupValues.add(`${supabaseUrl}/storage/v1/object/public/track-audio/${p}`);
    }
  }

  // RLS-enforced ownership check — only rows the caller can read come back.
  const { data: rows } = await supabase
    .from("track_audio_versions")
    .select("audio_url")
    .in("audio_url", Array.from(lookupValues));

  const allowed = new Set<string>();
  for (const row of rows ?? []) {
    allowed.add(extractStoragePath(row.audio_url));
  }

  // Sign only the allowed paths.
  const allowedPaths = normalized.filter((p) => allowed.has(p));
  const signedMap = await getSignedAudioUrls(allowedPaths);

  const result: Record<string, string> = {};
  for (let i = 0; i < paths.length; i++) {
    if (allowed.has(normalized[i])) {
      result[paths[i]] = signedMap.get(normalized[i]) ?? paths[i];
    }
    // Unauthorized paths are silently omitted from the response.
  }
  return result;
}
