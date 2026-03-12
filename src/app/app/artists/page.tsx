import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ArtistPhoto } from "@/components/ui/artist-photo";

type ArtistEntry = {
  displayName: string;
  releaseCount: number;
  clientName: string | null;
  clientEmail: string | null;
  lastUpdated: string;
  latestCoverArtUrl: string | null;
  customPhotoUrl: string | null;
};

export default async function ArtistsPage() {
  const supabase = await createSupabaseServerClient();

  const [releasesRes, photosRes] = await Promise.all([
    supabase
      .from("releases")
      .select("artist, client_name, client_email, updated_at, cover_art_url, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("artist_photos").select("artist_name_key, photo_url"),
  ]);

  const releases = releasesRes.data;
  const photos = photosRes.data;

  // Build photo lookup
  const photoMap = new Map<string, string>();
  for (const p of photos ?? []) {
    photoMap.set(p.artist_name_key as string, p.photo_url as string);
  }

  // Deduplicate artists (case-insensitive) and count releases per artist
  const artistMap = new Map<string, ArtistEntry>();

  for (const r of releases ?? []) {
    const artist = r.artist as string | null;
    if (!artist) continue;
    const key = artist.toLowerCase();
    const existing = artistMap.get(key);
    if (existing) {
      existing.releaseCount++;
      if (!existing.clientName && r.client_name) existing.clientName = r.client_name as string;
      if (!existing.clientEmail && r.client_email) existing.clientEmail = r.client_email as string;
      // Since ordered by created_at desc, first entry has latest cover
      if (!existing.latestCoverArtUrl && r.cover_art_url) {
        existing.latestCoverArtUrl = r.cover_art_url as string;
      }
    } else {
      artistMap.set(key, {
        displayName: artist,
        releaseCount: 1,
        clientName: (r.client_name as string | null) ?? null,
        clientEmail: (r.client_email as string | null) ?? null,
        lastUpdated: r.updated_at as string,
        latestCoverArtUrl: (r.cover_art_url as string | null) ?? null,
        customPhotoUrl: photoMap.get(key) ?? null,
      });
    }
  }

  const artists = [...artistMap.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">Artists</h1>
      </div>

      {artists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {artists.map((a) => (
            <Link
              key={a.displayName}
              href={`/app?artist=${encodeURIComponent(a.displayName)}`}
              className="card px-5 py-4 hover:border-signal/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ArtistPhoto
                  artistName={a.displayName}
                  photoUrl={a.customPhotoUrl ?? a.latestCoverArtUrl}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="text-base font-semibold text-text truncate group-hover:text-signal transition-colors">
                    {a.displayName}
                  </div>
                  <div className="text-sm text-muted">
                    {a.releaseCount} release{a.releaseCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              {(a.clientName || a.clientEmail) && (
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted truncate">
                  {a.clientName && <span>{a.clientName}</span>}
                  {a.clientName && a.clientEmail && <span className="mx-1">/</span>}
                  {a.clientEmail && <span>{a.clientEmail}</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          size="lg"
          title="No artists yet"
          description="Artists will appear here once you create releases with artist names."
        />
      )}
    </div>
  );
}
