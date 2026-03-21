"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  localeDisplayNames,
  localeFlagEmojis,
  supportedCurrencies,
  type Locale,
} from "@/i18n/config";
import { useTranslations } from "next-intl";

type Persona = "artist" | "engineer" | "both" | "other";

type Props = {
  persona: Persona;
  locale: Locale;
  currency: string;
  saving: boolean;
  onComplete: (destination: "release" | "dashboard") => void;
  onBack: () => void;
};

const personaKeys: Record<Persona, string> = {
  artist: "labelArtist",
  engineer: "labelEngineer",
  both: "labelBoth",
  other: "labelOther",
};

function getSymbol(code: string): string {
  return supportedCurrencies.find((c) => c.code === code)?.symbol ?? code;
}

export function ConfirmationStep({
  persona,
  locale,
  currency,
  saving,
  onComplete,
  onBack,
}: Props) {
  const t = useTranslations("onboarding.confirmation");
  const tCommon = useTranslations("common");

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-signal/15 flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-signal" />
      </div>

      <h1 className="text-2xl font-semibold text-text mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-muted mb-6">
        {t("summary")}
      </p>

      {/* Summary */}
      <div className="inline-flex items-center gap-2 text-sm text-text mb-8 flex-wrap justify-center">
        <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: "var(--panel2)" }}>
          {t(personaKeys[persona])}
        </span>
        <span className="text-muted">&middot;</span>
        <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: "var(--panel2)" }}>
          {localeFlagEmojis[locale]} {localeDisplayNames[locale]}
        </span>
        <span className="text-muted">&middot;</span>
        <span className="px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: "var(--panel2)" }}>
          {getSymbol(currency)} {currency}
        </span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => onComplete("release")}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          style={{ background: "var(--signal)", color: "var(--signal-on)" }}
        >
          {saving ? tCommon("settingUp") : t("createRelease")}
          {!saving && <ArrowRight size={16} />}
        </button>

        <button
          type="button"
          onClick={() => onComplete("dashboard")}
          disabled={saving}
          className="text-sm text-muted hover:text-text transition-colors disabled:opacity-50"
        >
          {t("goToDashboard")}
        </button>
      </div>

      <p className="text-xs text-muted mt-8">
        {t("changeNote")}
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          {tCommon("back")}
        </button>
      </div>
    </div>
  );
}
