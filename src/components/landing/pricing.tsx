import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FilledArrowRight } from "@/components/ui/filled-icon";

function PriceCard({
  title,
  price,
  period,
  subtitle,
  features,
  ctaLabel,
  highlighted = false,
}: {
  title: string;
  price: string;
  period?: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 flex flex-col ${
        highlighted
          ? "bg-[#0D9488]/8 border-[#0D9488]/25"
          : "bg-[#1a1a1a] border-white/8"
      }`}
    >
      <div className="mb-6">
        <div className="text-sm font-semibold text-white/60 mb-2">{title}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          {period && (
            <span className="text-base text-white/40">{period}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-white/50">{subtitle}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <CheckCircle2
              size={16}
              className={`shrink-0 mt-0.5 ${
                highlighted ? "text-[#0D9488]" : "text-white/30"
              }`}
            />
            <span className="text-sm text-white/70">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/auth/sign-in"
        className={`h-12 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2 rounded-xl transition-colors w-full ${
          highlighted
            ? "bg-[#0D9488] text-[#1a1a1a] hover:bg-[#0fb9ab]"
            : "bg-white/8 text-white border border-white/12 hover:bg-white/12"
        }`}
      >
        {ctaLabel}
        <FilledArrowRight size={16} />
      </Link>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Simple pricing
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PriceCard
            title="FREE"
            price="$0"
            subtitle="Perfect for trying it out"
            features={[
              "1 release",
              "All core features included",
              "Mix brief builder",
              "Release planning & timeline",
            ]}
            ctaLabel="Start Free"
          />
          <PriceCard
            title="PRO"
            price="$9"
            period="/month"
            subtitle="Everything you need"
            features={[
              "Unlimited releases",
              "All core features included",
              "Audio file storage",
              "Audio review with waveform & comments",
              "Audio format conversion",
              "Client delivery portal",
              "Payment tracking with export",
              "Priority support",
            ]}
            ctaLabel="Start Pro"
            highlighted
          />
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          No credit card required for the free tier. Cancel Pro anytime in two
          clicks.
        </p>
      </div>
    </section>
  );
}
