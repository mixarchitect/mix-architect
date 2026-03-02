import Link from "next/link";
import { CheckCircle2, Music, Headphones } from "lucide-react";
import { FilledArrowRight } from "@/components/ui/filled-icon";

function PersonaCard({
  icon,
  title,
  subtitle,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
}) {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] border border-white/8 p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#0D9488]/15 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-white/50 text-sm leading-relaxed mb-6">{subtitle}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <CheckCircle2
              size={16}
              className="text-[#0D9488] shrink-0 mt-0.5"
            />
            <span className="text-sm text-white/70">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/auth/sign-in"
        className="btn-primary h-12 px-6 text-sm inline-flex items-center justify-center gap-2 w-full"
      >
        Start Free
        <FilledArrowRight size={16} />
      </Link>
    </div>
  );
}

export function PersonaSplit() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Built for how you work
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Whether you&apos;re releasing your own music or managing client
            projects, Mix Architect adapts to your workflow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PersonaCard
            icon={<Music size={20} className="text-[#0D9488]" />}
            title="For Artists"
            subtitle="You're releasing your own music and want to get it right."
            features={[
              "Release timeline management",
              "Mix brief builder with intent & references",
              "Distributor task checklist",
              "Audio review with waveform & comments",
              "Technical specs (LUFS targets, format, sample rate)",
              "Audio format conversion",
            ]}
          />

          <PersonaCard
            icon={<Headphones size={20} className="text-[#0D9488]" />}
            title="For Engineers & Producers"
            subtitle="You're running a business and need to manage client projects professionally."
            features={[
              "Everything artists get, plus:",
              "Payment tracking with export",
              "Client delivery portal with your branding",
              "Download gating until payment confirmed",
              "Multi-project dashboard with outstanding balances",
              "Audio format conversion (WAV, AIFF, FLAC, MP3)",
            ]}
          />
        </div>
      </div>
    </section>
  );
}
