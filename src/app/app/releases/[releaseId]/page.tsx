import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type ReleasePageProps = {
  params: { releaseId?: string };
};

export default async function ReleasePage({ params }: ReleasePageProps) {
  const supabase = await createSupabaseServerClient();

  if (!params?.releaseId) {
    return (
      <div className="space-y-4 card p-5">
        <Link
          href="/app"
          className="text-sm text-subtle hover:text-black"
        >
          ← Back to releases
        </Link>

        <h1 className="text-2xl font-semibold">Release not found</h1>
        <p className="text-sm text-neutral-400">
          Missing route param <code>releaseId</code>. Raw params object:
        </p>
        <pre className="text-xs bg-neutral-900 border border-neutral-800 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    );
  }

  const { data: release, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", params.releaseId)
    .maybeSingle();

  if (!release || error) {
    return (
      <div className="space-y-4 card p-5">
        <Link
          href="/app"
          className="text-sm text-subtle hover:text-black"
        >
          ← Back to releases
        </Link>

        <h1 className="text-2xl font-semibold">Release not found</h1>

        <p className="text-sm text-subtle">
          Tried to load release with id:
        </p>
        <pre className="text-xs bg-[#f6f6f6] border border-[#e2e2e2] rounded-md p-3 overflow-x-auto">
          {params.releaseId}
        </pre>

        {error && (
          <>
            <p className="text-sm text-red-400">Supabase error:</p>
            <pre className="text-xs bg-[#f6f6f6] border border-red-200 rounded-md p-3 overflow-x-auto">
              {error.message}
            </pre>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{release.name}</h1>
          <p className="text-sm text-subtle">
            {release.artist_name
              ? `${release.artist_name} · ${release.type}`
              : release.type}
          </p>
        </div>

        <Link
          href="/app"
          className="btn-ghost text-sm"
        >
          ← Back to releases
        </Link>
      </div>

      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <Link
            href={`/app/releases/${release.id}/tracks/new`}
            className="btn-primary text-sm"
          >
            + Add track
          </Link>
        </div>

        <p className="text-sm text-subtle">
          No tracks yet. Add a track to start a Mix Architect blueprint.
        </p>
      </section>
    </div>
  );
}
