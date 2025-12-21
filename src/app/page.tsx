import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm font-semibold tracking-tight">Mix Architect</div>
            <div className="label text-[11px] text-muted hidden sm:block">CONTROL ROOM</div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app" className="btn-ghost">
              Enter
            </Link>
            <Link href="/app/auth" className="btn-primary">
              Sign in
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="surface p-8 md:p-10">
            <div className="label text-[11px] text-muted">Mix Architect</div>

            <h1 className="mt-3 text-[40px] md:text-[54px] font-semibold leading-[1.05] h1">
              Blueprint every mix before you touch a fader.
            </h1>

            <p className="mt-5 text-[15px] md:text-[17px] text-muted max-w-xl">
              Plan stereo and immersive releases with clear intent. Organize assets,
              define outcomes, and brief mixers with confidence.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/app" className="btn-primary">
                Enter the control room
              </Link>
              <Link href="/#how" className="btn-ghost">
                See how it works
              </Link>
            </div>

            <div className="mt-10 rounded-[16px] border border-hairline bg-white/45 backdrop-blur-md overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3">
                <Stat label="Blueprints" value="Stereo + Atmos" sub="One workflow" />
                <Stat label="Outputs" value="Mix brief" sub="Aligned and sharable" divider />
                <Stat label="Signal" value="Clarity" sub="Less second-guessing" divider />
              </div>
            </div>
          </section>

          <aside className="surface p-7 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Inspector</div>
                <div className="mt-1 text-sm text-muted">Context, next steps, shortcuts.</div>
              </div>
              <div className="pill">Blueprint mode</div>
            </div>

            <div className="mt-6 border-t border-hairline pt-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="chip">⌘K Command</span>
                <span className="chip">Release notes</span>
                <span className="chip">Session imports</span>
              </div>

              <p className="text-sm text-muted leading-relaxed">
                Mix Architect is a planning layer. Keep releases tidy: clear naming, add artist, and lock the
                deliverables before you start mixing.
              </p>

              <div className="mt-4 grid gap-2">
                <div className="row">
                  <span className="rowKey">Step 01</span>
                  <span className="rowVal">Create release</span>
                </div>
                <div className="row">
                  <span className="rowKey">Step 02</span>
                  <span className="rowVal">Add tracks + references</span>
                </div>
                <div className="row">
                  <span className="rowKey">Step 03</span>
                  <span className="rowVal">Export brief</span>
                </div>
              </div>

              <div className="pt-3">
                <Link href="/app" className="btn-primary w-full text-center block">
                  Start a release
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <section id="how" className="mt-8 surface p-7 md:p-8">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="label text-[11px] text-muted">What you get</div>
              <div className="mt-2 text-xl font-semibold h2">A mix plan you can trust</div>
              <div className="mt-2 text-sm text-muted max-w-2xl">
                Fewer “what did we decide?” moments. More intent, faster sessions, cleaner handoffs.
              </div>
            </div>

            <div className="flex gap-2">
              <span className="pill">Stereo</span>
              <span className="pill">Atmos</span>
              <span className="pill">Deliverables</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Feature title="Blueprint" body="Define outcomes, references, and constraints before the session." />
            <Feature title="Organize" body="Keep assets, notes, and track intent in one place." />
            <Feature title="Brief" body="Export a clean, shareable mix brief for collaborators." />
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  divider,
}: {
  label: string;
  value: string;
  sub: string;
  divider?: boolean;
}) {
  return (
    <div className={`p-5 ${divider ? "sm:border-l border-hairline" : ""}`}>
      <div className="label text-[11px] text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold h2">{value}</div>
      <div className="mt-1 text-sm text-muted">{sub}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[16px] border border-hairline bg-white/45 backdrop-blur-md p-5 hover:translate-y-[-2px] transition-transform">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-muted leading-relaxed">{body}</div>
    </div>
  );
}
