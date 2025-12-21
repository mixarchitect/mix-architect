import * as React from "react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Pill } from "@/components/ui/pill";
import { Rule } from "@/components/ui/rule";

type Props = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function Inspector({
  title = "Inspector",
  subtitle = "Context, next steps, shortcuts.",
  children,
}: Props) {
  return (
    <Panel>
      <PanelHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold h2 text-text">{title}</div>
            <div className="mt-1 text-sm text-muted">{subtitle}</div>
          </div>
          <span className="status-stamp status-stamp-draft">Draft</span>
        </div>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-5 space-y-4">
        {children ?? (
          <>
            <div className="flex flex-wrap gap-2">
              <Pill>⌘K Command</Pill>
              <Pill>Release notes</Pill>
              <Pill>Export brief</Pill>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Treat Mix Architect like a drafting layer: define intent, lock
              deliverables, and reduce second‑guessing before the session starts.
            </p>
            <div className="space-y-2">
              <div className="row">
                <span className="rowKey">Step 01</span>
                <span className="rowVal">Create release</span>
              </div>
              <div className="row">
                <span className="rowKey">Step 02</span>
                <span className="rowVal">Add tracks</span>
              </div>
              <div className="row">
                <span className="rowKey">Step 03</span>
                <span className="rowVal">Export brief</span>
              </div>
            </div>
          </>
        )}
      </PanelBody>
    </Panel>
  );
}
