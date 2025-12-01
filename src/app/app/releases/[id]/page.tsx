import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type ReleasePageProps = {
  params: { id: string };
};

export default async function ReleaseDetailPage({ params }: ReleasePageProps) {
  const supabase = await createSupabaseServerClient();

  const { data: release, error: releaseError } = await supabase
    .from("releases")
    .select("*")
    .eq("id", params.id)
    .single();

  if (releaseError || !release) {
    notFound();
  }

  const { data: tracks } = await supabase
    .from("projects")
    .select("*")
    .eq("release_id", params.id)
    .order("track_number", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{release.name}</h1>
          {release.artist_name && (
            <p className="text-neutral-400 text-sm">{release.artist_name}</p>
          )}
        </div>
        <Link
          href={`/app/releases/${release.id}/tracks/new`}
          className="inline-flex items-center rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
        >
          + Add track
        </Link>
      </div>

      <div className="space-y-3">
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => (
            <div
              key={track.id}
              className="rounded-md border border-neutral-800 px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {track.track_number ? `${track.track_number}. ` : ""}
                  {track.name}
                </div>
                <div className="text-xs uppercase text-neutral-500">
                  {track.mix_format || "Unspecified"}
                </div>
              </div>
              <Link
                href={`/app/projects/${track.id}/wizard`}
                className="text-sm text-neutral-300 underline underline-offset-4"
              >
                Open blueprint
              </Link>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">
            No tracks yet. Add a track to begin building a blueprint.
          </p>
        )}
      </div>
    </div>
  );
}

