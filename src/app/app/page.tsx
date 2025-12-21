import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { StatTile } from "@/components/ui/stat-tile";
import { ReleaseCard } from "@/components/ui/release-card";
import { Button } from "@/components/ui/button";
import { Inspector } from "@/components/ui/inspector";

export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader className="flex items-start justify-between gap-6">
          <div>
            <div className="label text-[11px] text-faint">PIPELINE</div>
            <h1 className="mt-2 text-[44px] leading-[1.05] font-semibold h1 text-text">
              Releases
            </h1>
            <p className="mt-3 text-sm text-muted max-w-2xl">
              Albums, EPs and singles you are building mix blueprints for.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill className="font-mono">v1</Pill>
            <Link href="/app/releases/new">
              <Button variant="primary">New release</Button>
            </Link>
          </div>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatTile
            label="Active releases"
            value={String(releases?.length ?? 0)}
            note="In the pipeline"
          />
          <StatTile label="System" value="READY" note="Drafting table mode" />
          <StatTile label="Last sync" value="LIVE" note="Sessions aligned" />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold h2 text-text">List</div>
            <Pill>All</Pill>
          </div>
          <div className="text-xs text-muted font-mono">
            {String(releases?.length ?? 0).padStart(2, "0")} items
          </div>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {releases && releases.length > 0 ? (
            releases.map((r) => (
              <ReleaseCard
                key={r.id}
                id={r.id}
                name={r.name}
                artistName={r.artist_name}
                type={String(r.type ?? "").toUpperCase()}
                createdAt={r.created_at}
              />
            ))
          ) : (
            <div className="md:col-span-2 surface p-6">
              <div className="label text-[11px] text-faint">EMPTY</div>
              <div className="mt-2 text-base font-semibold">No releases yet</div>
              <div className="mt-2 text-sm text-muted">
                Start a blueprint to see it in your pipeline.
              </div>
              <div className="mt-5">
                <Link href="/app/releases/new">
                  <Button variant="primary">Create release</Button>
                </Link>
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Mobile inspector lives below main; desktop uses Shell's right column */}
      <div className="lg:hidden">
        <Inspector />
      </div>
    </div>
  );
}

