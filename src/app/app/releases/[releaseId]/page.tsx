import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TagBadge } from "@/components/ui/tag-badge";
import { Button, IconButton } from "@/components/ui/button";
import { Inspector } from "@/components/ui/inspector";
import { AccentPanel } from "@/components/ui/accent-panel";
import { DataGrid, DataCell } from "@/components/ui/data-grid";
import { StatusIndicator } from "@/components/ui/status-dot";
import { ExternalLink, X, Plus } from "lucide-react";

type ReleasePageProps = {
  params: { releaseId?: string };
};

export default async function ReleasePage({ params }: ReleasePageProps) {
  const supabase = await createSupabaseServerClient();

  if (!params?.releaseId) {
    return (
      <Panel>
        <PanelHeader className="space-y-3">
          <Link href="/app" className="text-sm text-muted hover:text-text transition-colors">
            ← Back to releases
          </Link>
          <h1 className="text-2xl font-bold text-text">Release not found</h1>
          <p className="text-sm text-muted">
            Missing route param <code className="font-mono text-xs">releaseId</code>.
          </p>
        </PanelHeader>
      </Panel>
    );
  }

  const { data: release, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", params.releaseId)
    .maybeSingle();

  if (!release || error) {
    return (
      <Panel>
        <PanelHeader className="space-y-3">
          <Link href="/app" className="text-sm text-muted hover:text-text transition-colors">
            ← Back to releases
          </Link>
          <h1 className="text-2xl font-bold text-text">Release not found</h1>
          <p className="text-sm text-muted">Tried to load release with id:</p>
          <pre className="text-xs font-mono border border-border rounded-md p-3 bg-panel2 overflow-x-auto">
            {params.releaseId}
          </pre>
          {error && (
            <div className="mt-3">
              <p className="text-sm text-signal">Supabase error:</p>
              <pre className="mt-1 text-xs font-mono border border-signal/30 rounded-md p-3 bg-signal-muted overflow-x-auto">
                {error.message}
              </pre>
            </div>
          )}
        </PanelHeader>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Release header with accent panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Panel variant="float">
          <PanelHeader className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Link href="/app" className="text-sm text-muted hover:text-text transition-colors">
                  ← Releases
                </Link>
                <StatusIndicator color="green" label="Active" />
              </div>
              <h1 className="text-[40px] leading-[0.95] font-bold h1 text-text">
                {release.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-muted">
                  {release.artist_name || "No artist"}
                </span>
                <TagBadge>{String(release.type ?? "").toUpperCase()}</TagBadge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton>
                <ExternalLink size={16} />
              </IconButton>
              <IconButton>
                <X size={16} />
              </IconButton>
            </div>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-5">
            <DataGrid>
              <DataCell label="Type" value={String(release.type ?? "—").toUpperCase()} />
              <DataCell label="Status" value="ACTIVE" />
              <DataCell
                label="Created"
                value={release.created_at ? new Date(release.created_at).toLocaleDateString() : "—"}
                size="small"
              />
              <DataCell label="Tracks" value="0" />
            </DataGrid>
          </PanelBody>
        </Panel>

        {/* Accent info panel */}
        <AccentPanel className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-sm text-white/65">RELEASE</span>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  ←
                </button>
                <button className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  →
                </button>
              </div>
            </div>
            <div className="text-2xl font-bold text-white h2">
              {release.name}
            </div>
            <p className="mt-1 text-sm text-white/70">
              {release.artist_name || "No artist"} · {release.type}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/15 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/65">ID</span>
              <span className="font-mono text-white">{release.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/65">Status</span>
              <span className="font-semibold text-white">In Production</span>
            </div>
          </div>
        </AccentPanel>
      </div>

      {/* Tracks section */}
      <Panel>
        <PanelHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold h2 text-text">Tracks</div>
            <Pill className="font-mono text-xs">0 items</Pill>
          </div>
          <Link href={`/app/releases/${release.id}/tracks/new`}>
            <Button variant="primary">
              <Plus size={16} />
              Add track
            </Button>
          </Link>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <Panel variant="inset" className="p-8 text-center">
            <div className="w-12 h-12 rounded-lg bg-signal-muted mx-auto flex items-center justify-center mb-4">
              <Plus size={24} className="text-signal" />
            </div>
            <div className="text-base font-semibold text-text">No tracks yet</div>
            <div className="mt-1 text-sm text-muted">
              Add a track to start a Mix Architect blueprint.
            </div>
            <div className="mt-5">
              <Link href={`/app/releases/${release.id}/tracks/new`}>
                <Button variant="secondary">Add your first track</Button>
              </Link>
            </div>
          </Panel>
        </PanelBody>
      </Panel>

      {/* Mobile inspector */}
      <div className="lg:hidden">
        <Inspector title="Release Actions" subtitle="Quick actions for this release.">
          <div className="space-y-2">
            <div className="row">
              <span className="rowKey">Step 01</span>
              <span className="rowVal">Add tracks</span>
            </div>
            <div className="row">
              <span className="rowKey">Step 02</span>
              <span className="rowVal">Define references</span>
            </div>
            <div className="row">
              <span className="rowKey">Step 03</span>
              <span className="rowVal">Export brief</span>
            </div>
          </div>
        </Inspector>
      </div>
    </div>
  );
}
