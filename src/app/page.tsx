import Link from "next/link";
import Image from "next/image";
import { Panel } from "@/components/ui/panel";
import { Rule } from "@/components/ui/rule";
import { FileText, Layers, Share2, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ─────────────────────────────────────────────────────
          FLOATING NAV
      ───────────────────────────────────────────────────── */}
      <nav aria-label="Main" className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <div className="w-[calc(100vw-24px)] sm:w-[92vw] md:w-[78vw] lg:w-[1100px] max-w-6xl flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-border-strong rounded-full px-3 py-3 shadow-float">
          <Link href="/" className="flex items-center pl-2 pr-4">
            <Image
              src="/mix-architect-logo.svg"
              alt="Mix Architect"
              width={180}
              height={36}
              priority
              className="h-8 w-auto"
            />
          </Link>
          
          <div className="hidden md:flex flex-1 items-center justify-center gap-1 text-sm">
            <a
              href="#features"
              className="px-4 py-2 rounded-full text-muted hover:text-text hover:bg-panel-2 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-4 py-2 rounded-full text-muted hover:text-text hover:bg-panel-2 transition-colors"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <Link href="/auth/sign-in" className="px-4 py-2 text-sm text-muted hover:text-text transition-colors">
              Sign in
            </Link>
            <Link href="/app" className="px-5 py-2 text-sm font-semibold text-white bg-signal rounded-full hover:bg-signal/90 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────
          HERO (Full viewport with video)
      ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/recordingconsole.mov" type="video/quicktime" />
            <source src="/recordingconsole.mov" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70" />
          {/* Bottom fade to page background */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center px-6 pt-24 pb-32">
          <h1 className="text-[44px] md:text-[72px] font-bold leading-[0.95] tracking-tight h1 text-white">
            Plan your mix
            <br />
            before you mix
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Mix Architect helps audio engineers define intent, organize references, 
            and create shareable mix briefs—before touching a single fader.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/app" className="btn-primary h-14 px-10 text-base inline-flex items-center gap-2">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary h-14 px-10 text-base inline-flex items-center gap-2 bg-white text-text border-white hover:bg-white/90">
              See how it works
            </a>
          </div>

          <p className="mt-8 text-sm text-white/50">
            Free to use. No credit card required.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          FEATURES
      ───────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="label text-faint mb-3">FEATURES</div>
            <h2 className="text-3xl md:text-4xl font-bold h2 text-text">
              Everything you need to plan a mix
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              Stop guessing, start documenting. Mix Architect gives you a clear 
              framework for every project.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<FileText size={24} />}
              title="Define intent"
              description="Set clear goals for each track before you start. What should this mix feel like? What are the references?"
            />
            <FeatureCard
              icon={<Layers size={24} />}
              title="Organize assets"
              description="Keep stems, references, notes, and revision history in one place. Never lose track of what was decided."
            />
            <FeatureCard
              icon={<Share2 size={24} />}
              title="Share briefs"
              description="Export clean, professional mix briefs to share with clients, collaborators, or your future self."
            />
          </div>
        </div>
      </section>

      <Rule className="max-w-6xl mx-auto" />

      {/* ─────────────────────────────────────────────────────
          HOW IT WORKS
      ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 py-24 bg-panel-2">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="label text-faint mb-3">HOW IT WORKS</div>
            <h2 className="text-3xl md:text-4xl font-bold h2 text-text">
              Three steps to a better mix
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Create a release"
              description="Start by naming your project. Is it a single, EP, or album? Stereo or Atmos?"
            />
            <Step
              number="02"
              title="Add your tracks"
              description="For each track, define the intent, add references, and note any technical constraints."
            />
            <Step
              number="03"
              title="Export your brief"
              description="Generate a clean, printable mix brief that captures everything in one document."
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          BENEFITS
      ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="label text-faint mb-3">WHY MIX ARCHITECT</div>
              <h2 className="text-3xl md:text-4xl font-bold h2 text-text">
                Spend less time confused,
                <br />
                more time creating
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Most mixing problems aren&apos;t technical—they&apos;re communication problems. 
                Mix Architect helps you clarify what success looks like before you start.
              </p>

              <ul className="mt-8 space-y-4">
                <BenefitItem text="No more 'what did we decide?' moments" />
                <BenefitItem text="Clear handoffs between collaborators" />
                <BenefitItem text="Faster sessions with defined outcomes" />
                <BenefitItem text="Professional documentation for clients" />
              </ul>
            </div>

            <Panel variant="float" className="p-8">
              <div className="label text-faint mb-2">SAMPLE BRIEF</div>
              <div className="text-xl font-semibold text-text mb-6">
                &quot;Midnight Drive&quot; — Track 03
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Format</span>
                  <span className="font-mono text-text">Stereo + Atmos</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Target loudness</span>
                  <span className="font-mono text-text">-14 LUFS</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted">Reference</span>
                  <span className="font-mono text-text">Blinding Lights</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted">Intent</span>
                  <span className="text-text text-right max-w-[200px]">
                    Wide, punchy, vocal-forward
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <Rule className="max-w-6xl mx-auto" />

      {/* ─────────────────────────────────────────────────────
          CTA
      ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold h2 text-text">
            Ready to plan your next mix?
          </h2>
          <p className="mt-4 text-muted">
            Start organizing your projects today. It&apos;s free.
          </p>
          <div className="mt-8">
            <Link href="/app" className="btn-primary h-12 px-8 text-base inline-flex items-center gap-2">
              Get started for free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/mix-architect-logo.svg"
              alt="Mix Architect"
              width={120}
              height={24}
              className="h-5 w-auto opacity-60"
            />
          </div>
          <p className="text-sm text-faint">
            © {new Date().getFullYear()} Mix Architect. Blueprint your sound.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────── */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Panel className="p-6">
      <div className="w-12 h-12 rounded-lg bg-signal-light border border-signal/20 flex items-center justify-center text-signal mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
    </Panel>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-panel border border-border-strong text-xl font-bold font-mono text-text mb-5">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={20} className="text-signal shrink-0 mt-0.5" />
      <span className="text-text">{text}</span>
    </li>
  );
}
