"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { localeCurrencyMap, type Locale } from "@/i18n/config";
import { PersonaStep } from "./steps/persona-step";
import { LocaleStep } from "./steps/locale-step";
import { ConfirmationStep } from "./steps/confirmation-step";

type Persona = "artist" | "engineer" | "both" | "other";

type Props = {
  userId: string;
};

export function OnboardingFlow({ userId }: Props) {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<Persona>("artist");
  const [locale, setLocale] = useState<Locale>("en-US");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const defaultCurrency = localeCurrencyMap[locale];

  const handlePersonaSelect = useCallback((p: Persona) => {
    setPersona(p);
    setStep(2);
  }, []);

  const handleLocaleSelect = useCallback((l: Locale) => {
    setLocale(l);
    setStep(3);
  }, []);

  const handleComplete = useCallback(
    async (destination: "release" | "dashboard") => {
      setSaving(true);
      const supabase = createSupabaseBrowserClient();

      // Determine payments_enabled based on persona
      const paymentsEnabled = persona !== "artist";

      const { error } = await supabase
        .from("user_defaults")
        .update({
          persona,
          locale,
          default_currency: defaultCurrency,
          payments_enabled: paymentsEnabled,
          onboarding_completed: true,
        })
        .eq("user_id", userId);

      if (error) {
        // If no row exists yet, insert
        await supabase.from("user_defaults").upsert({
          user_id: userId,
          persona,
          locale,
          default_currency: defaultCurrency,
          payments_enabled: paymentsEnabled,
          onboarding_completed: true,
        });
      }

      // Set the locale cookie for next-intl
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

      router.push(destination === "release" ? "/app/releases/new" : "/app");
      router.refresh();
    },
    [persona, locale, defaultCurrency, userId, router],
  );

  const logoSrc =
    resolvedTheme === "dark"
      ? "/mix-architect-logo-white.svg"
      : "/mix-architect-logo.svg";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--panel)" }}>
      {/* Logo */}
      <div className="mb-8">
        <img src={logoSrc} alt="Mix Architect" className="h-7 w-auto" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => s < step && setStep(s)}
            disabled={s >= step}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              s === step
                ? "bg-signal"
                : s < step
                  ? "bg-signal/40 cursor-pointer hover:bg-signal/60"
                  : "bg-border"
            }`}
            aria-label={`Step ${s}`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <PersonaStep
            selected={persona}
            onSelect={handlePersonaSelect}
          />
        )}
        {step === 2 && (
          <LocaleStep
            selected={locale}
            onSelect={handleLocaleSelect}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ConfirmationStep
            persona={persona}
            locale={locale}
            currency={defaultCurrency}
            saving={saving}
            onComplete={handleComplete}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
