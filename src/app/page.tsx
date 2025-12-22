import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { StatTile } from "@/components/ui/stat-tile";
import { AccentPanel } from "@/components/ui/accent-panel";
import { DataGrid, DataCell } from "@/components/ui/data-grid";
import { StatusIndicator } from "@/components/ui/status-dot";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { Home, Layers, Settings, Mic2, FileText, Share2, Music } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Top bar with yellow highlight */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="highlight-dot">
              <Music size={14} className="text-charcoal" />
            </Link>
            <div className="text-base font-semibold tracking-tight text-text">
              Mix Architect
            </div>
            <div className="label-sm text-faint hidden sm:block">
              CONTROL ROOM
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app">
              <Button variant="ghost">Enter</Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="primary">Sign in</Button>
            </Link>
          </div>
        </header>

        {/* Main layout - inspired by Petronex */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Hero panel */}
            <Panel variant="float">
              <PanelHeader>
                <div className="flex items-center gap-3 mb-4">
                  <StatusIndicator color="green" label="System Ready" />
                </div>
                <h1 className="text-[42px] md:text-[56px] font-bold leading-[0.95] h1 text-text">
                  Blueprint
                  <br />
                  Your Mix
                </h1>
              </PanelHeader>
              <Rule />
              <PanelBody className="pt-5">
                <p className="text-[15px] md:text-[17px] text-muted max-w-xl leading-relaxed">
                  Plan every mix before you touch a fader. Organize stereo and 
                  immersive releases with clear intent and defined outcomes.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/app">
                    <Button variant="primary">Enter the control room</Button>
                  </Link>
                  <Link href="/#how">
                    <Button variant="secondary">See how it works</Button>
                  </Link>
                </div>
              </PanelBody>
            </Panel>

            {/* Stats row - Music relevant */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatTile label="Formats" value="Stereo" note="+ Atmos ready" />
              <StatTile label="Workflow" value="Unified" note="One source of truth" />
              <StatTile label="Output" value="Brief" note="Shareable PDF" />
              <StatTile label="Status" value="Ready" note="Start anytime" />
            </div>

            {/* Lower section - Features */}
            <section id="how">
              <Panel>
                <PanelHeader className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <div className="label text-[11px] text-faint">WHAT YOU GET</div>
                    <div className="mt-2 text-2xl font-bold h2 text-text">
                      A mix plan you can trust
                    </div>
                    <div className="mt-2 text-sm text-muted max-w-2xl">
                      Fewer &quot;what did we decide?&quot; moments. More intent, faster
                      sessions, cleaner handoffs.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Pill>Stereo</Pill>
                    <Pill>Atmos</Pill>
                    <Pill>Deliverables</Pill>
                  </div>
                </PanelHeader>
                <Rule />
                <PanelBody className="pt-5 grid gap-4 md:grid-cols-3">
                  <Feature
                    icon={<FileText size={20} />}
                    title="Blueprint"
                    body="Define outcomes, references, and constraints before the session."
                  />
                  <Feature
                    icon={<Layers size={20} />}
                    title="Organize"
                    body="Keep assets, notes, and track intent in one place."
                  />
                  <Feature
                    icon={<Share2 size={20} />}
                    title="Brief"
                    body="Export a clean, shareable mix brief for collaborators."
                  />
                </PanelBody>
              </Panel>
            </section>
          </div>

          {/* Right column - Accent panel + Inspector */}
          <div className="space-y-6">
            {/* Accent panel (Petronex orange style) */}
            <AccentPanel>
              <div className="flex items-center justify-between mb-4">
                <div className="label-sm text-white/70">RELEASE</div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    ←
                  </button>
                  <button className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    →
                  </button>
                </div>
              </div>
              <h2 className="text-2xl font-bold h2 text-white">
                Mix Architect
                <br />
                <span className="text-white/80">Control Room</span>
              </h2>
              <p className="mt-2 text-sm text-white/70">Your mixing command center</p>

              <div className="mt-6 pt-6 border-t border-white/20">
                <DataGrid>
                  <DataCell label="Format" value="Stereo" />
                  <DataCell label="Output" value="Brief" />
                  <DataCell label="Tracks" value="∞" />
                  <DataCell label="Refs" value="Unlimited" size="small" />
                </DataGrid>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Code</span>
                  <span className="font-semibold text-white font-mono">MX-001</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Type</span>
                  <span className="font-semibold text-white">Drafting</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Status</span>
                  <span className="font-semibold text-white">Active</span>
                </div>
              </div>
            </AccentPanel>

            {/* Inspector panel */}
            <Panel variant="float">
              <PanelHeader className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-text">Inspector</div>
                  <div className="mt-1 text-sm text-muted">
                    Context, next steps, shortcuts.
                  </div>
                </div>
                <StatusIndicator color="blue" label="Ready" />
              </PanelHeader>
              <Rule />
              <PanelBody className="pt-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Pill>⌘K Command</Pill>
                  <Pill>Release notes</Pill>
                  <Pill>Export brief</Pill>
                </div>
                <div className="space-y-2">
                  <div className="row">
                    <span className="rowKey">Step 01</span>
                    <span className="rowVal">Create release</span>
                  </div>
                  <div className="row">
                    <span className="rowKey">Step 02</span>
                    <span className="rowVal">Add tracks + refs</span>
                  </div>
                  <div className="row">
                    <span className="rowKey">Step 03</span>
                    <span className="rowVal">Export brief</span>
                  </div>
                </div>
                <Link href="/app" className="block">
                  <Button variant="primary" className="w-full">
                    Start a release
                  </Button>
                </Link>
              </PanelBody>
            </Panel>
          </div>
        </div>

        {/* Bottom toolbar (Petronex style) */}
        <div className="mt-10 flex justify-center">
          <Toolbar>
            <ToolbarButton active>
              <Home size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <Layers size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <Mic2 size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <FileText size={18} />
            </ToolbarButton>
            <ToolbarButton>
              <Settings size={18} />
            </ToolbarButton>
          </Toolbar>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-faint">
          <p>© 2024 Mix Architect. Blueprint your sound.</p>
        </footer>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card px-5 py-5">
      <div className="w-10 h-10 rounded-md bg-panel2 border border-border-strong flex items-center justify-center text-muted mb-4">
        {icon}
      </div>
      <div className="text-base font-semibold text-text">{title}</div>
      <div className="mt-2 text-sm text-muted leading-relaxed">{body}</div>
    </div>
  );
}
