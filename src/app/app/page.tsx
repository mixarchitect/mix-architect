import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReleaseCard } from "@/components/ui/release-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*, tracks(id, status)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold h2 text-text">Your Releases</h1>
        <Link href="/app/releases/new">
          <Button variant="primary">
            <Plus size={16} />
            New Release
          </Button>
        </Link>
      </div>

      {releases && releases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {releases.map((r: Record<string, unknown> & { tracks?: { id: string; status: string }[] }) => {
            const trackCount = r.tracks?.length ?? 0;
            const completedTracks =
              r.tracks?.filter((t) => t.status === "complete").length ?? 0;
            return (
              <ReleaseCard
                key={r.id as string}
                id={r.id as string}
                title={r.title as string}
                artist={r.artist as string | null}
                releaseType={r.release_type as string}
                format={r.format as string}
                status={r.status as string}
                trackCount={trackCount}
                completedTracks={completedTracks}
                updatedAt={r.updated_at as string | null}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No releases yet"
          description="Create your first release to start planning your mix."
          action={
            <Link href="/app/releases/new">
              <Button variant="primary">
                <Plus size={16} />
                Create Release
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
