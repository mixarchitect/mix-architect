"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/** Default genre suggestions shown to all users */
export const DEFAULT_GENRES = [
  "Rock", "Pop", "Hip-Hop", "R&B", "Electronic", "Country", "Jazz",
  "Classical", "Indie", "Alternative", "Metal", "Folk", "Soul", "Funk",
  "Blues", "Reggae", "Latin", "Punk", "Lo-Fi", "Ambient",
];

/**
 * Fetch the user's genre suggestions: static defaults merged with
 * all genres the user has previously used across their releases.
 * New custom genres appear in the list for future use.
 */
export async function getUserGenreSuggestions(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_GENRES;

  const { data } = await supabase
    .from("releases")
    .select("genre_tags")
    .eq("user_id", user.id);

  const userGenres = new Set<string>();
  for (const r of data ?? []) {
    for (const tag of (r.genre_tags as string[]) ?? []) {
      userGenres.add(tag);
    }
  }

  // Merge: defaults first, then user genres, deduplicate case-insensitively
  const merged = new Map<string, string>();
  for (const g of DEFAULT_GENRES) merged.set(g.toLowerCase(), g);
  for (const g of userGenres) {
    if (!merged.has(g.toLowerCase())) merged.set(g.toLowerCase(), g);
  }

  return [...merged.values()].sort((a, b) => a.localeCompare(b));
}
