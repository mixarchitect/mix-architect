import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { TagBadge } from "@/components/ui/tag-badge";
import { StatTile } from "@/components/ui/stat-tile";
import { ReleaseCard } from "@/components/ui/release-card";
import { Rule } from "@/components/ui/rule";
import { Inspector } from "@/components/ui/inspector";
import { AccentPanel } from "@/components/ui/accent-panel";
import { DataGrid, DataCell } from "@/components/ui/data-grid";
import { StatusDot, StatusIndicator } from "@/components/ui/status-dot";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { Home, Layers, Settings, Plus, ExternalLink } from "lucide-react";

export default function StyleguidePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Panel variant="float">
        <PanelHeader>
          <div className="label text-[11px] text-faint">INTERNAL</div>
          <h1 className="mt-2 text-4xl font-bold h1 text-text">Styleguide</h1>
          <p className="mt-2 text-sm text-muted">
            Drafting Table design system components for Mix Architect.
            <br />
            Inspired by Petronex dashboard aesthetics.
          </p>
        </PanelHeader>
      </Panel>

      {/* Colors */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Color Palette</h2>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-bg border border-border" />
              <div className="text-xs font-mono text-muted">#E9E9E9 bg</div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-panel border border-border" />
              <div className="text-xs font-mono text-muted">#FFFFFF panel</div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-signal" />
              <div className="text-xs font-mono text-muted">#FE5E0E signal</div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-highlight border border-border" />
              <div className="text-xs font-mono text-muted">#FAF5B2 highlight</div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-charcoal" />
              <div className="text-xs font-mono text-muted">#2E2E2E charcoal</div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-md bg-text" />
              <div className="text-xs font-mono text-muted">#141414 text</div>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Buttons */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Buttons</h2>
          <p className="mt-1 text-sm text-muted">
            Primary (signal), secondary (paper), ghost, and dark variants.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="dark">Dark</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" disabled>Primary disabled</Button>
            <Button variant="secondary" disabled>Secondary disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <IconButton><Plus size={16} /></IconButton>
            <IconButton><ExternalLink size={16} /></IconButton>
            <IconButton variant="dark"><Settings size={16} /></IconButton>
          </div>
        </PanelBody>
      </Panel>

      {/* Status Indicators */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Status Indicators</h2>
          <p className="mt-1 text-sm text-muted">
            Colored dots and indicators (Petronex style).
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <StatusDot color="blue" />
            <StatusDot color="green" />
            <StatusDot color="orange" />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <StatusIndicator color="blue" label="Owned" />
            <StatusIndicator color="green" label="Held by Production" />
            <StatusIndicator color="orange" label="Draft" />
          </div>
        </PanelBody>
      </Panel>

      {/* Pills and Badges */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Pills &amp; Badges</h2>
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
          <h2 className="text-lg font-bold h2 text-text">Status Stamps</h2>
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

      {/* Data Grid */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Data Grid</h2>
          <p className="mt-1 text-sm text-muted">
            2-column data layout (Petronex style).
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5">
          <DataGrid>
            <DataCell label="Interests" value="02" />
            <DataCell label="Investments" value="$ 2.1m" />
            <DataCell label="Net Acres" value="628.1" />
            <DataCell label="Depth" value="5,000" unit="ft" />
          </DataGrid>
        </PanelBody>
      </Panel>

      {/* Stat Tiles */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Stat Tiles</h2>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile label="Releases" value="12" note="In pipeline" />
          <StatTile label="Status" value="READY" note="Operational" />
          <StatTile label="Sync" value="LIVE" note="Last: 2 min ago" />
          <StatTile label="Mode" value="DRAFT" variant="accent" />
        </PanelBody>
      </Panel>

      {/* Accent Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccentPanel>
          <div className="label-sm text-white/65 mb-2">ACCENT PANEL</div>
          <h3 className="text-2xl font-bold text-white h2">Bold Orange</h3>
          <p className="mt-2 text-sm text-white/70">
            Used for key highlights and calls to action.
          </p>
          <div className="mt-6 pt-4 border-t border-white/15">
            <DataGrid>
              <DataCell label="Depth" value="5,000" unit="ft" />
              <DataCell label="Status" value="Active" />
            </DataGrid>
          </div>
        </AccentPanel>

        <Panel variant="float">
          <PanelHeader>
            <h3 className="text-base font-semibold text-text">Float Panel</h3>
            <p className="mt-1 text-sm text-muted">Enhanced shadow for floating cards.</p>
          </PanelHeader>
          <Rule />
          <PanelBody className="pt-4">
            <p className="text-sm text-muted">This panel has a more pronounced shadow.</p>
          </PanelBody>
        </Panel>
      </div>

      {/* Toolbar */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Toolbar (Dark)</h2>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 flex justify-center">
          <Toolbar>
            <ToolbarButton active>
              <Home size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <Layers size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <Settings size={18} />
            </ToolbarButton>
          </Toolbar>
        </PanelBody>
      </Panel>

      {/* Release Cards */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Release Cards</h2>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReleaseCard
            id="demo-1"
            title="Midnight Sessions"
            artist="Aurora Keys"
            releaseType="album"
            format="stereo"
            status="ready"
            trackCount={8}
            completedTracks={6}
            updatedAt="2024-12-15"
          />
          <ReleaseCard
            id="demo-2"
            title="Summer Vibes EP"
            artist="The Wavelengths"
            releaseType="ep"
            format="atmos"
            status="in_progress"
            trackCount={5}
            completedTracks={2}
            updatedAt="2024-12-10"
          />
          <ReleaseCard
            id="demo-3"
            title="First Light"
            artist={null}
            releaseType="single"
            format="stereo"
            status="draft"
            trackCount={1}
            completedTracks={0}
            updatedAt="2024-12-01"
          />
        </PanelBody>
      </Panel>

      {/* Inputs */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Inputs</h2>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="label text-faint">Text input</label>
            <input type="text" className="input" placeholder="Enter text..." />
          </div>
          <div className="space-y-1.5">
            <label className="label text-faint">Select</label>
            <select className="input">
              <option>Single</option>
              <option>EP</option>
              <option>Album</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label text-faint">Disabled</label>
            <input type="text" className="input" disabled placeholder="Disabled..." />
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
