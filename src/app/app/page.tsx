import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Releases</h1>
        <p className="text-neutral-400 text-sm">
          Albums, EPs and singles you are building mix blueprints for.
        </p>
      </div>

      <div>
        <Link
          href="/app/releases/new"
          className="inline-flex items-center rounded-md border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
        >
          + New release
        </Link>
      </div>

      <div className="space-y-3">
        {releases && releases.length > 0 ? (
          releases.map((r) => (
            <Link
              key={r.id}
              href={`/app/releases/${r.id}`}
              className="block rounded-md border border-neutral-800 px-4 py-3 hover:border-neutral-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.artist_name && (
                    <div className="text-xs text-neutral-400">
                      {r.artist_name}
                    </div>
                  )}
                </div>
                <div className="text-xs uppercase text-neutral-500">
                  {r.type}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-neutral-500">
            No releases yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}

