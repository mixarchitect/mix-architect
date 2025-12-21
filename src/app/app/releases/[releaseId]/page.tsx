import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type ReleasePageProps = {
  params: { releaseId?: string };
};

export default async function ReleasePage({ params }: ReleasePageProps) {
  const supabase = await createSupabaseServerClient();

  if (!params?.releaseId) {
    // If the dynamic segment is missing, return to the releases list.
    redirect("/app");
  }

  const { data: release, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", params.releaseId)
    .maybeSingle();

  if (!release || error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{release.name}</h1>
          <p className="text-sm text-neutral-400">
            {release.artist_name
              ? `${release.artist_name} · ${release.type}`
              : release.type}
          </p>
        </div>

        <Link
          href="/app"
          className="text-sm text-neutral-400 hover:text-neutral-200"
        >
          ← Back to releases
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <Link
            href={`/app/releases/${release.id}/tracks/new`}
            className="inline-flex items-center rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
          >
            + Add track
          </Link>
        </div>

        <p className="text-sm text-neutral-500">
          No tracks yet. Add a track to start a Mix Architect blueprint.
        </p>
      </section>
    </div>
  );
}

