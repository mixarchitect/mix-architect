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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] text-subtle uppercase tracking-[0.24em]">
            Pipeline
          </p>
          <h1 className="text-2xl font-semibold leading-tight">Releases</h1>
          <p className="text-subtle text-sm">
            Albums, EPs and singles you are building mix blueprints for.
          </p>
        </div>

        <Link href="/app/releases/new" className="btn-primary">
          + New release
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {releases && releases.length > 0 ? (
          releases.map((r) => (
            <Link key={r.id} href={`/app/releases/${r.id}`} className="card p-4 hover:border-[#f6a43a]/60 transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{r.name}</div>
                  {r.artist_name && (
                    <div className="text-xs text-subtle">{r.artist_name}</div>
                  )}
                </div>
                <div className="pill uppercase text-xs">{r.type}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-4 text-sm text-subtle">
            No releases yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

