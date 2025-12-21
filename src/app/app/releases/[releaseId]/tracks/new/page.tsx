import Link from "next/link";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";

type NewTrackPageProps = {
  params: { releaseId: string };
};

export default function NewTrackPage({ params }: NewTrackPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader>
          <div className="label text-[11px] text-faint">TRACKS</div>
          <h1 className="mt-2 text-2xl font-semibold h1 text-text">New track</h1>
          <p className="mt-2 text-sm text-muted">
            Add a track to your release blueprint.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-5 max-w-md">
          <div className="space-y-1.5">
            <label className="label text-faint">Track name</label>
            <input
              type="text"
              className="input"
              placeholder="Enter track name..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="label text-faint">Track number</label>
            <input
              type="number"
              className="input"
              placeholder="1"
              min={1}
            />
          </div>

          <Panel variant="inset" className="p-4">
            <p className="text-sm text-muted">
              Full track wizard coming soon. Release ID:{" "}
              <code className="font-mono text-xs">{params.releaseId}</code>
            </p>
          </Panel>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" disabled>
              Add track (coming soon)
            </Button>
            <Link href={`/app/releases/${params.releaseId}`}>
              <Button variant="ghost">← Back to release</Button>
            </Link>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
