import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import Link from "next/link";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { StatTile } from "@/components/ui/stat-tile";
import { ReleaseCard } from "@/components/ui/release-card";
import { Button, IconButton } from "@/components/ui/button";
import { Inspector } from "@/components/ui/inspector";
import { AccentPanel } from "@/components/ui/accent-panel";
import { DataGrid, DataCell } from "@/components/ui/data-grid";
import { StatusIndicator } from "@/components/ui/status-dot";
import { Plus, ExternalLink, X } from "lucide-react";

export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: releases } = await supabase
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  const releaseCount = releases?.length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary header with accent stat */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Panel variant="float">
          <PanelHeader className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <StatusIndicator color="green" label="System Ready" />
              </div>
              <h1 className="text-[44px] leading-[0.95] font-bold h1 text-text">
                Releases
              </h1>
              <p className="mt-4 text-sm text-muted max-w-xl">
                Albums, EPs and singles you are building mix blueprints for.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton>
                <ExternalLink size={16} />
              </IconButton>
              <Link href="/app/releases/new">
                <Button variant="primary">
                  <Plus size={16} />
                  New release
                </Button>
              </Link>
            </div>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <DataGrid>
              <DataCell label="Active Releases" value={String(releaseCount).padStart(2, "0")} />
              <DataCell label="System Status" value="READY" />
              <DataCell label="Sync" value="LIVE" />
              <DataCell label="Mode" value="Drafting" />
            </DataGrid>
          </PanelBody>
        </Panel>

        {/* Accent stat panel */}
        <AccentPanel className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-sm text-white/65">PIPELINE</span>
              <button className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="text-4xl font-bold text-white mono">
              {String(releaseCount).padStart(2, "0")}
            </div>
            <div className="text-sm text-white/70 mt-1">Active releases</div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/15">
            <div className="flex justify-between text-sm">
              <span className="text-white/65">Status</span>
              <span className="font-semibold text-white">In Production</span>
            </div>
          </div>
        </AccentPanel>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile
          label="Active"
          value={String(releaseCount).padStart(2, "0")}
          note="In pipeline"
        />
        <StatTile label="System" value="READY" note="Operational" />
        <StatTile label="Sync" value="LIVE" note="Sessions aligned" />
        <StatTile
          label="Mode"
          value="DRAFT"
          note="Drafting table"
          variant="accent"
        />
      </div>

      {/* List section */}
      <Panel>
        <PanelHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold h2 text-text">List</div>
            <Pill active>All</Pill>
            <Pill>Singles</Pill>
            <Pill>EPs</Pill>
            <Pill>Albums</Pill>
          </div>
          <div className="text-xs text-muted font-mono tracking-tight">
            {String(releaseCount).padStart(2, "0")} items
          </div>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {releases && releases.length > 0 ? (
            releases.map((r, idx) => (
              <ReleaseCard
                key={r.id}
                id={r.id}
                name={r.name}
                artistName={r.artist_name}
                type={String(r.type ?? "").toUpperCase()}
                createdAt={r.created_at}
                status={idx === 0 ? "live" : idx === 1 ? "active" : "draft"}
              />
            ))
          ) : (
            <div className="md:col-span-2">
              <Panel variant="inset" className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-signal-muted mx-auto flex items-center justify-center mb-4">
                  <Plus size={24} className="text-signal" />
                </div>
                <div className="text-lg font-semibold text-text">
                  No releases yet
                </div>
                <div className="mt-2 text-sm text-muted max-w-sm mx-auto">
                  Start a blueprint to see it in your pipeline.
                </div>
                <div className="mt-6">
                  <Link href="/app/releases/new">
                    <Button variant="primary">Create release</Button>
                  </Link>
                </div>
              </Panel>
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Mobile inspector */}
      <div className="lg:hidden">
        <Inspector />
      </div>
    </div>
  );
}
