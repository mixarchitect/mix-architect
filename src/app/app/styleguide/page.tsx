import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { TagBadge } from "@/components/ui/tag-badge";
import { StatTile } from "@/components/ui/stat-tile";
import { ReleaseCard } from "@/components/ui/release-card";
import { Rule } from "@/components/ui/rule";
import { Inspector } from "@/components/ui/inspector";

export default function StyleguidePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Panel>
        <PanelHeader>
          <div className="label text-[11px] text-faint">INTERNAL</div>
          <h1 className="mt-2 text-3xl font-semibold h1 text-text">Styleguide</h1>
          <p className="mt-2 text-sm text-muted">
            Drafting Table design system components for Mix Architect.
          </p>
        </PanelHeader>
      </Panel>

      {/* Buttons */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Buttons</h2>
          <p className="mt-1 text-sm text-muted">
            Primary (signal), secondary (paper), and ghost variants.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" disabled>Primary disabled</Button>
            <Button variant="secondary" disabled>Secondary disabled</Button>
            <Button variant="ghost" disabled>Ghost disabled</Button>
          </div>
        </PanelBody>
      </Panel>

      {/* Pills and Badges */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Pills &amp; Badges</h2>
          <p className="mt-1 text-sm text-muted">
            Filter chips and type badges.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Pill>Default</Pill>
            <Pill active>Active</Pill>
            <Pill>⌘K Command</Pill>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <TagBadge>SINGLE</TagBadge>
            <TagBadge>EP</TagBadge>
            <TagBadge>ALBUM</TagBadge>
          </div>
        </PanelBody>
      </Panel>

      {/* Status Stamps */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Status Stamps</h2>
          <p className="mt-1 text-sm text-muted">
            Mono instrument readouts for status indication.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="status-stamp">Default</span>
            <span className="status-stamp status-stamp-draft">Draft</span>
            <span className="status-stamp status-stamp-ready">Ready</span>
            <span className="status-stamp status-stamp-live">Live</span>
          </div>
        </PanelBody>
      </Panel>

      {/* Stat Tiles */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Stat Tiles</h2>
          <p className="mt-1 text-sm text-muted">
            Label + mono value + helper text.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatTile label="Releases" value="12" note="In pipeline" />
          <StatTile label="Status" value="READY" note="System operational" />
          <StatTile label="Sync" value="LIVE" note="Last: 2 min ago" />
        </PanelBody>
      </Panel>

      {/* Release Cards */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Release Cards</h2>
          <p className="mt-1 text-sm text-muted">
            Clickable cards for the releases list.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <ReleaseCard
            id="demo-1"
            name="Midnight Sessions"
            artistName="Aurora Keys"
            type="ALBUM"
            createdAt="2024-12-15"
          />
          <ReleaseCard
            id="demo-2"
            name="Summer Vibes EP"
            artistName="The Wavelengths"
            type="EP"
            createdAt="2024-12-10"
          />
          <ReleaseCard
            id="demo-3"
            name="First Light"
            artistName={null}
            type="SINGLE"
            createdAt="2024-12-01"
          />
        </PanelBody>
      </Panel>

      {/* Rules */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Rules (Dividers)</h2>
          <p className="mt-1 text-sm text-muted">
            Hairline and dashed variants.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <div>
            <p className="text-xs text-muted mb-2">Solid hairline</p>
            <Rule />
          </div>
          <div>
            <p className="text-xs text-muted mb-2">Dashed (blueprint style)</p>
            <Rule dashed />
          </div>
        </PanelBody>
      </Panel>

      {/* Panel Variants */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Panel Variants</h2>
          <p className="mt-1 text-sm text-muted">
            Default, inset, and flat variants.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <Panel variant="inset" className="p-4">
            <p className="text-sm text-muted">Inset panel (for nested sections)</p>
          </Panel>
          <Panel variant="flat" className="p-4">
            <p className="text-sm text-muted">Flat panel (no shadow, for inside panels)</p>
          </Panel>
        </PanelBody>
      </Panel>

      {/* Inputs */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Inputs</h2>
          <p className="mt-1 text-sm text-muted">
            Text inputs, selects, and states.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="label text-faint">Text input</label>
            <input type="text" className="input" placeholder="Enter text..." />
          </div>
          <div className="space-y-1">
            <label className="label text-faint">Select</label>
            <select className="input">
              <option>Single</option>
              <option>EP</option>
              <option>Album</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="label text-faint">Disabled</label>
            <input type="text" className="input" disabled placeholder="Disabled..." />
          </div>
        </PanelBody>
      </Panel>

      {/* Rows */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-semibold h2 text-text">Rows (Checklist style)</h2>
          <p className="mt-1 text-sm text-muted">
            Drafting checklist rows with mono key/value.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-2 max-w-md">
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
        </PanelBody>
      </Panel>

      {/* Inspector */}
      <div className="max-w-md">
        <Inspector />
      </div>
    </div>
  );
}

