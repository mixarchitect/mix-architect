import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TagBadge } from "@/components/ui/tag-badge";
import { Button } from "@/components/ui/button";
import { Inspector } from "@/components/ui/inspector";

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
          <h1 className="text-2xl font-semibold text-text">Release not found</h1>
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
          <h1 className="text-2xl font-semibold text-text">Release not found</h1>
          <p className="text-sm text-muted">Tried to load release with id:</p>
          <pre className="text-xs font-mono border border-border rounded-md p-3 bg-panel2 overflow-x-auto">
            {params.releaseId}
          </pre>
          {error && (
            <div className="mt-3">
              <p className="text-sm text-red-600">Supabase error:</p>
              <pre className="mt-1 text-xs font-mono border border-red-200 rounded-md p-3 bg-red-50 overflow-x-auto">
                {error.message}
              </pre>
            </div>
          )}
        </PanelHeader>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Release header */}
      <Panel>
        <PanelHeader className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="label text-[11px] text-faint">RELEASE</div>
            <h1 className="text-3xl font-semibold leading-[1.05] h1 text-text">
              {release.name}
            </h1>
            <div className="text-sm text-muted">
              {release.artist_name ? `${release.artist_name} · ${release.type}` : release.type}
            </div>
            <div className="flex items-center gap-2">
              <TagBadge>{String(release.type ?? "").toUpperCase()}</TagBadge>
              <span className="text-xs font-mono text-faint tracking-tight">
                ID {release.id.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="title-block text-right">
              <div className="flex items-center gap-3">
                <span className="label text-[10px] text-faint">STATUS</span>
                <span className="status-stamp status-stamp-ready">READY</span>
              </div>
              <div className="text-[10px] text-faint mt-2 font-mono">
                {release.created_at ? new Date(release.created_at).toLocaleDateString() : "—"}
              </div>
            </div>
            <Link href="/app">
              <Button variant="ghost">← Back to releases</Button>
            </Link>
          </div>
        </PanelHeader>
      </Panel>

      {/* Tracks section */}
      <Panel>
        <PanelHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold h2 text-text">Tracks</div>
            <Pill className="font-mono text-xs">0 items</Pill>
          </div>
          <Link href={`/app/releases/${release.id}/tracks/new`}>
            <Button variant="primary">Add track</Button>
          </Link>
        </PanelHeader>
        <Rule dashed />
        <PanelBody className="pt-5">
          <Panel variant="inset" className="p-5">
            <div className="label text-[11px] text-faint">EMPTY</div>
            <div className="mt-2 text-base font-semibold text-text">No tracks yet</div>
            <div className="mt-1 text-sm text-muted">
              Add a track to start a Mix Architect blueprint.
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
