"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FilledArrowRight } from "@/components/ui/filled-icon";
import { PRICING, type BillingInterval } from "@/lib/pricing";

/* ------------------------------------------------------------------ */
/*  Billing toggle                                                     */
/* ------------------------------------------------------------------ */

function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (i: BillingInterval) => void;
}) {
  return (
    <div className="flex justify-center mb-12">
      <div className="relative inline-flex items-center">
        <div className="inline-flex rounded-full bg-white/6 p-1">
          <button
            type="button"
            onClick={() => onChange("monthly")}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              interval === "monthly"
                ? "bg-[#0D9488] text-[#1a1a1a]"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onChange("annual")}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              interval === "annual"
                ? "bg-[#0D9488] text-[#1a1a1a]"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            Annual
          </button>
        </div>
        {interval === "annual" && (
          <span className="absolute left-full ml-2 text-xs font-semibold text-[#0D9488] bg-[#0D9488]/10 border border-[#0D9488]/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Save {PRICING.PRO.annualSavingsPercent}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Price card                                                         */
/* ------------------------------------------------------------------ */

function PriceCard({
  title,
  price,
  period,
  subtitle,
  features,
  ctaLabel,
  highlighted = false,
  annualNote,
}: {
  title: string;
  price: string;
  period?: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
  annualNote?: string;
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
        {annualNote && (
          <p className="mt-1 text-xs text-white/40">{annualNote}</p>
        )}
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

/* ------------------------------------------------------------------ */
/*  Pricing section                                                    */
/* ------------------------------------------------------------------ */

export function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const proPrice =
    interval === "annual"
      ? `$${PRICING.PRO.annualMonthlyEquivalent}`
      : `$${PRICING.PRO.monthlyPrice}`;

  const annualNote =
    interval === "annual"
      ? `Billed annually at $${PRICING.PRO.annualPrice}/year`
      : undefined;

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

        <BillingToggle interval={interval} onChange={setInterval} />

        <div className="grid gap-6 md:grid-cols-2">
          <PriceCard
            title="FREE"
            price={`$${PRICING.FREE.monthlyPrice}`}
            subtitle={PRICING.FREE.description}
            features={[...PRICING.FREE.features]}
            ctaLabel="Start Free"
          />
          <PriceCard
            title="PRO"
            price={proPrice}
            period="/month"
            subtitle={PRICING.PRO.description}
            features={[...PRICING.PRO.features]}
            ctaLabel="Start Pro"
            highlighted
            annualNote={annualNote}
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
