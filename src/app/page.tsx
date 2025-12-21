import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { Pill } from "@/components/ui/pill";
import { StatTile } from "@/components/ui/stat-tile";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold tracking-tight text-text">
              Mix Architect
            </div>
            <div className="label text-[10px] text-faint hidden sm:block">
              DRAFTING TABLE
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

        {/* Main layout */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Hero panel */}
          <Panel>
            <PanelHeader>
              <div className="label text-[11px] text-faint">MIX ARCHITECT</div>
              <h1 className="mt-4 text-[38px] md:text-[52px] font-semibold leading-[1.02] h1 text-text">
                Blueprint every mix before you touch a fader.
              </h1>
              <p className="mt-5 text-[15px] md:text-[17px] text-muted max-w-xl leading-relaxed">
                Plan stereo and immersive releases with clear intent. Organize
                assets, define outcomes, and brief mixers with confidence.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/app">
                  <Button variant="primary">Enter the control room</Button>
                </Link>
                <Link href="/#how">
                  <Button variant="secondary">See how it works</Button>
                </Link>
              </div>
            </PanelHeader>
            <Rule />
            <PanelBody className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatTile
                  label="Blueprints"
                  value="Stereo + Atmos"
                  note="One workflow"
                />
                <StatTile
                  label="Outputs"
                  value="Mix brief"
                  note="Aligned and shareable"
                />
                <StatTile
                  label="Signal"
                  value="Clarity"
                  note="Less second‑guessing"
                />
              </div>
            </PanelBody>
          </Panel>

          {/* Inspector panel (clipboard feel) */}
          <Panel>
            <PanelHeader className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-text">Inspector</div>
                <div className="mt-1 text-sm text-muted">
                  Context, next steps, shortcuts.
                </div>
              </div>
              <span className="status-stamp status-stamp-draft">Draft mode</span>
            </PanelHeader>
            <Rule />
            <PanelBody className="pt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Pill>⌘K Command</Pill>
                <Pill>Release notes</Pill>
                <Pill>Session imports</Pill>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Mix Architect is a planning layer. Keep releases tidy: clear
                naming, add artist, and lock deliverables before mixing.
              </p>
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

        {/* Lower section */}
        <section id="how" className="mt-6">
          <Panel>
            <PanelHeader className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="label text-[11px] text-faint">WHAT YOU GET</div>
                <div className="mt-2 text-xl font-semibold h2 text-text">
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
            <PanelBody className="pt-5 grid gap-3 md:grid-cols-3">
              <Feature
                title="Blueprint"
                body="Define outcomes, references, and constraints before the session."
              />
              <Feature
                title="Organize"
                body="Keep assets, notes, and track intent in one place."
              />
              <Feature
                title="Brief"
                body="Export a clean, shareable mix brief for collaborators."
              />
            </PanelBody>
          </Panel>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-faint">
          <p>© 2024 Mix Architect. Blueprint your sound.</p>
        </footer>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border bg-panel2 px-5 py-4 transition-all duration-150 ease-out hover:-translate-y-px hover:border-border-strong">
      <div className="text-base font-semibold text-text">{title}</div>
      <div className="mt-2 text-sm text-muted leading-relaxed">{body}</div>
    </div>
  );
}
