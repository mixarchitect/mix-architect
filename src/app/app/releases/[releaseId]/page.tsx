import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { TagBadge } from "@/components/ui/tag-badge";
import { Button } from "@/components/ui/button";

type ReleasePageProps = {
  params: { releaseId?: string };
};

export default async function ReleasePage({ params }: ReleasePageProps) {
  const supabase = await createSupabaseServerClient();

  if (!params?.releaseId) {
    return (
      <Panel>
        <PanelHeader className="space-y-3">
          <Link href="/app" className="text-sm text-muted hover:text-text">
            ← Back to releases
          </Link>
          <h1 className="text-2xl font-semibold">Release not found</h1>
          <p className="text-sm text-muted">
            Missing route param <code>releaseId</code>. Raw params object:
          </p>
          <pre className="text-xs border border-border rounded-md p-3 bg-panel-2 overflow-x-auto">
            {JSON.stringify(params, null, 2)}
          </pre>
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
          <Link href="/app" className="text-sm text-muted hover:text-text">
            ← Back to releases
          </Link>
          <h1 className="text-2xl font-semibold">Release not found</h1>
          <p className="text-sm text-muted">Tried to load release with id:</p>
          <pre className="text-xs border border-border rounded-md p-3 bg-panel-2 overflow-x-auto">
            {params.releaseId}
          </pre>
          {error && (
            <div className="text-xs text-muted">
              <p className="text-sm text-red-500">Supabase error:</p>
              <pre className="mt-1 border border-border rounded-md p-3 bg-panel-2 overflow-x-auto">
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
      <Panel className="ticks">
        <PanelHeader className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="label text-faint">RELEASE</div>
            <h1 className="text-3xl font-semibold leading-[1.05] h1 text-text">
              {release.name}
            </h1>
            <div className="text-sm text-muted">
              {release.artist_name ? `${release.artist_name} · ${release.type}` : release.type}
            </div>
            <div className="flex items-center gap-2 text-xs text-faint">
              <TagBadge>{String(release.type ?? "").toUpperCase()}</TagBadge>
              <Pill className="mono text-xs">ID {release.id}</Pill>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="title-block text-right">
              <div className="flex items-center justify-between">
                <span className="label text-[10px] text-faint">STATUS</span>
                <span className="mono text-text">READY</span>
              </div>
              <div className="text-[10px] text-faint mt-1">
                Updated {release.created_at ? new Date(release.created_at).toLocaleDateString() : "—"}
              </div>
            </div>
            <Link href="/app">
              <Button variant="ghost">← Back to releases</Button>
            </Link>
          </div>
        </PanelHeader>
      </Panel>

      <Panel>
        <PanelHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold h2 text-text">Tracks</div>
            <Pill className="mono text-xs">0 items</Pill>
          </div>
          <Link href={`/app/releases/${release.id}/tracks/new`}>
            <Button variant="primary">Add track</Button>
          </Link>
        </PanelHeader>
        <Rule dashed />
        <PanelBody className="pt-5">
          <div className="text-sm text-muted">
            No tracks yet. Add a track to start a Mix Architect blueprint.
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
