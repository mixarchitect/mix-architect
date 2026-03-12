import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ArtistsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("artist, client_name, client_email, updated_at")
    .order("updated_at", { ascending: false });

  // Deduplicate artists (case-insensitive) and count releases per artist
  const artistMap = new Map<string, { displayName: string; releaseCount: number; clientName: string | null; clientEmail: string | null; lastUpdated: string }>();

  for (const r of releases ?? []) {
    const artist = r.artist as string | null;
    if (!artist) continue;
    const key = artist.toLowerCase();
    const existing = artistMap.get(key);
    if (existing) {
      existing.releaseCount++;
      if (!existing.clientName && r.client_name) existing.clientName = r.client_name as string;
      if (!existing.clientEmail && r.client_email) existing.clientEmail = r.client_email as string;
    } else {
      artistMap.set(key, {
        displayName: artist,
        releaseCount: 1,
        clientName: (r.client_name as string | null) ?? null,
        clientEmail: (r.client_email as string | null) ?? null,
        lastUpdated: r.updated_at as string,
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
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: "var(--signal)" }}
                >
                  {a.displayName[0].toUpperCase()}
                </div>
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
