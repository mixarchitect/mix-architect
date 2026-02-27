"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export type SearchResultType = "artist" | "release" | "track" | "reference";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  href: string;
  status?: string | null;
};

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const search = useCallback(
    (term: string) => {
      setQuery(term);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!term.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      debounceRef.current = setTimeout(async () => {
        const pattern = `%${term.trim()}%`;

        const [releasesRes, tracksRes, refsRes] = await Promise.all([
          supabase
            .from("releases")
            .select("id, title, artist, status, client_name")
            .or(`title.ilike.${pattern},artist.ilike.${pattern},client_name.ilike.${pattern}`)
            .order("updated_at", { ascending: false })
            .limit(5),

          supabase
            .from("tracks")
            .select("id, title, status, track_number, release_id, releases(id, title, artist)")
            .ilike("title", pattern)
            .order("updated_at", { ascending: false })
            .limit(5),

          supabase
            .from("mix_references")
            .select("id, song_title, artist, release_id, track_id")
            .or(`song_title.ilike.${pattern},artist.ilike.${pattern}`)
            .limit(5),
        ]);

        const mapped: SearchResult[] = [];

        // Deduplicate artist names from matching releases
        if (releasesRes.data) {
          const seenArtists = new Set<string>();
          for (const r of releasesRes.data) {
            const artist = r.artist as string | null;
            if (artist && !seenArtists.has(artist.toLowerCase())) {
              seenArtists.add(artist.toLowerCase());
              mapped.push({
                id: `artist-${artist}`,
                type: "artist",
                title: artist,
                subtitle: null,
                href: `/app?artist=${encodeURIComponent(artist)}`,
              });
            }
          }

          for (const r of releasesRes.data) {
            mapped.push({
              id: r.id,
              type: "release",
              title: r.title,
              subtitle: r.artist || r.client_name || null,
              href: `/app/releases/${r.id}`,
              status: r.status,
            });
          }
        }

        if (tracksRes.data) {
          for (const t of tracksRes.data) {
            const release = Array.isArray(t.releases) ? t.releases[0] : t.releases;
            const rel = release as { title?: string; artist?: string } | null;
            const parts = [rel?.artist, rel?.title].filter(Boolean);
            mapped.push({
              id: t.id,
              type: "track",
              title: t.title,
              subtitle: parts.length > 0 ? parts.join(" · ") : null,
              href: `/app/releases/${t.release_id}/tracks/${t.id}`,
              status: t.status,
            });
          }
        }

        if (refsRes.data) {
          for (const ref of refsRes.data) {
            const href = ref.track_id
              ? `/app/releases/${ref.release_id}/tracks/${ref.track_id}`
              : `/app/releases/${ref.release_id}`;
            mapped.push({
              id: ref.id,
              type: "reference",
              title: ref.song_title,
              subtitle: ref.artist || null,
              href,
            });
          }
        }

        setResults(mapped);
        setIsSearching(false);
      }, 250);
    },
    [supabase],
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsSearching(false);
  }, []);

  return { query, results, isSearching, search, clear };
}
