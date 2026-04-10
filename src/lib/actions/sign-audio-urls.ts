"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getSignedAudioUrls, extractStoragePath } from "@/lib/storage-urls";

/**
 * Server action for client components that need signed audio URLs.
 * Validates the caller is authenticated before signing.
 *
 * Accepts an array of storage paths (or legacy full URLs).
 * Returns a record mapping each input path to its signed URL.
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
  const signedMap = await getSignedAudioUrls(normalized);

  const result: Record<string, string> = {};
  for (let i = 0; i < paths.length; i++) {
    result[paths[i]] = signedMap.get(normalized[i]) ?? paths[i];
  }
  return result;
}
