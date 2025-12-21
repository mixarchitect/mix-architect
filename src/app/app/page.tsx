import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Rail } from "@/components/ui/rail";
import { Surface, SurfaceBody, SurfaceHeader } from "@/components/ui/surface";
import { Tag } from "@/components/ui/tag";
import { Kpi } from "@/components/ui/kpi";
import { EmptyState } from "@/components/ui/empty-state";
import { Folder, Plus, Settings, Sparkles } from "lucide-react";

export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="relative">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex gap-4">
          <Rail
            items={[
              { href: "/app", icon: <Folder size={18} />, label: "Releases" },
              { href: "/app/releases/new", icon: <Plus size={18} />, label: "New release" },
              { href: "/app/settings", icon: <Settings size={18} />, label: "Settings" },
            ]}
          />

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Surface>
              <SurfaceHeader className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-subtle uppercase tracking-[0.24em]">
                    Pipeline
                  </p>
                  <h1 className="h1 text-3xl font-semibold leading-tight">Releases</h1>
                  <p className="text-subtle text-sm mt-1">
                    Albums, EPs and singles you are building mix blueprints for.
                  </p>
                </div>
                <Link href="/app/releases/new" className="btn-primary">
                  + New release
                </Link>
              </SurfaceHeader>
              <SurfaceBody className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Kpi label="Active releases" value={String(releases?.length ?? 0)} hint="In the pipeline" />
                <Kpi label="Last updated" value="Live" hint="Sessions synced" />
                <Kpi label="Blueprint mode" value="Ready" hint="Mix briefs aligned" />
              </SurfaceBody>
            </Surface>

            <Surface>
              <SurfaceHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold h2">List</h2>
                  <Tag>All</Tag>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Sparkles size={14} />
                  Curated for clarity
                </div>
              </SurfaceHeader>
              <SurfaceBody className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {releases && releases.length > 0 ? (
                  releases.map((r) => (
                    <Link
                      key={r.id}
                      href={`/app/releases/${r.id}`}
                      className="group rounded-lg border border-stroke bg-surface/50 px-4 py-3 shadow-panel transition duration-200 hover:-translate-y-[3px] hover:border-strokeHover hover:shadow-panel2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-base font-semibold text-text leading-tight">
                            {r.name}
                          </div>
                          {r.artist_name && (
                            <div className="text-xs text-muted">{r.artist_name}</div>
                          )}
                        </div>
                        <Tag className="text-[11px] uppercase">{r.type}</Tag>
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        Updated{" "}
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "Recently"}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="md:col-span-2">
                    <EmptyState
                      title="No releases yet"
                      description="Start a blueprint to see it in your pipeline."
                      action={
                        <Link href="/app/releases/new" className="btn-primary">
                          Create release
                        </Link>
                      }
                    />
                  </div>
                )}
              </SurfaceBody>
            </Surface>
          </div>

          <aside className="hidden lg:block w-[360px] shrink-0">
            <Surface className="sticky top-4">
              <SurfaceHeader>
                <div className="text-sm font-semibold h2">Inspector</div>
                <div className="text-xs text-muted mt-1">
                  Context, next steps, shortcuts.
                </div>
              </SurfaceHeader>
              <SurfaceBody className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Tag>⌘K Command</Tag>
                  <Tag>Blueprint mode</Tag>
                  <Tag>Release notes</Tag>
                </div>
                <div className="text-xs text-muted leading-relaxed">
                  Keep releases tidy: prefer clear naming, add artist, and align type before briefing mixers.
                </div>
              </SurfaceBody>
            </Surface>
          </aside>
        </div>

        <div className="lg:hidden mt-4">
          <Surface>
            <SurfaceHeader>
              <div className="text-sm font-semibold h2">Inspector</div>
              <div className="text-xs text-muted mt-1">
                Context, next steps, shortcuts.
              </div>
            </SurfaceHeader>
            <SurfaceBody className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Tag>⌘K Command</Tag>
                <Tag>Blueprint mode</Tag>
                <Tag>Release notes</Tag>
              </div>
              <div className="text-xs text-muted leading-relaxed">
                Keep releases tidy: prefer clear naming, add artist, and align type before briefing mixers.
              </div>
            </SurfaceBody>
          </Surface>
        </div>
      </div>
    </div>
  );
}

