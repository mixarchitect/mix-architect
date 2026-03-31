"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FilledArrowRight } from "@/components/ui/filled-icon";
import { PRICING, type BillingInterval } from "@/lib/pricing";
import { useTranslations } from "next-intl";

/* ------------------------------------------------------------------ */
/*  Billing toggle                                                     */
/* ------------------------------------------------------------------ */

function BillingToggle({
  interval,
  onChange,
  labels,
}: {
  interval: BillingInterval;
  onChange: (i: BillingInterval) => void;
  labels: { monthly: string; annual: string; savePercent: string };
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
                ? "bg-[#14B8A6] text-[#1a1a1a]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {labels.monthly}
          </button>
          <button
            type="button"
            onClick={() => onChange("annual")}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              interval === "annual"
                ? "bg-[#14B8A6] text-[#1a1a1a]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {labels.annual}
          </button>
        </div>
        {interval === "annual" && (
          <span className="absolute left-full ml-2 text-xs font-semibold text-[#14B8A6] bg-[#14B8A6]/10 border border-[#14B8A6]/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            {labels.savePercent}
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
      className={`rounded-2xl border p-8 flex flex-col min-h-[480px] ${
        highlighted
          ? "bg-[#14B8A6]/8 border-[#14B8A6]/25"
          : "bg-[#1a1a1a] border-white/8"
      }`}
    >
      <div className="mb-6">
        <div className="text-sm font-semibold text-white/60 mb-2">{title}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          {period && (
            <span className="text-base text-zinc-400">{period}</span>
          )}
        </div>
        {annualNote && (
          <p className="mt-1 text-xs text-zinc-400">{annualNote}</p>
        )}
        <p className="mt-2 text-sm text-white/50">{subtitle}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <CheckCircle2
              size={16}
              className={`shrink-0 mt-0.5 ${
                highlighted ? "text-[#14B8A6]" : "text-zinc-400"
              }`}
            />
            <span className="text-sm text-white/70">{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/auth/sign-in?mode=signup"
        className={`h-12 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2 rounded-xl transition-colors w-full ${
          highlighted
            ? "bg-[#14B8A6] text-[#1a1a1a] hover:bg-[#2dd4bf]"
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
  const t = useTranslations("landing");
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const proPrice =
    interval === "annual"
      ? `$${PRICING.PRO.annualMonthlyEquivalent}`
      : `$${PRICING.PRO.monthlyPrice}`;

  const annualNote =
    interval === "annual"
      ? t("billedAnnually", { price: PRICING.PRO.annualPrice })
      : undefined;

  const freeFeatures = [
    t("pricingFreeF1"), t("pricingFreeF2"), t("pricingFreeF3"),
    t("pricingFreeF4"), t("pricingFreeF5"), t("pricingFreeF6"),
  ];
  const proFeatures = [
    t("pricingProF1"), t("pricingProF2"), t("pricingProF3"),
    t("pricingProF4"), t("pricingProF5"), t("pricingProF6"),
    t("pricingProF7"), t("pricingProF8"),
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="px-6 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-white">
            {t("pricingHeadline")}
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            {t("pricingSubheadline")}
          </p>
        </div>

        <BillingToggle
          interval={interval}
          onChange={setInterval}
          labels={{
            monthly: t("monthly"),
            annual: t("annual"),
            savePercent: t("savePercent", { percent: PRICING.PRO.annualSavingsPercent }),
          }}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <PriceCard
            title="FREE"
            price={`$${PRICING.FREE.monthlyPrice}`}
            subtitle={t("pricingFreeDesc")}
            features={freeFeatures}
            ctaLabel={t("startFree")}
          />
          <PriceCard
            title="PRO"
            price={proPrice}
            period={t("perMonth")}
            subtitle={t("pricingProDesc")}
            features={proFeatures}
            ctaLabel={t("startPro")}
            highlighted
            annualNote={annualNote}
          />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {t("pricingNote")}
        </p>
      </div>
    </section>
  );
}
