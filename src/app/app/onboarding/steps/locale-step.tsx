"use client";

import { ArrowLeft } from "lucide-react";
import {
  locales,
  localeDisplayNames,
  localeFlagEmojis,
  localeCurrencyMap,
  supportedCurrencies,
  type Locale,
} from "@/i18n/config";
import { useTranslations } from "next-intl";

type Props = {
  selected: Locale;
  onSelect: (locale: Locale) => void;
  onBack: () => void;
};

// Get symbol for a currency code
function getSymbol(code: string): string {
  return supportedCurrencies.find((c) => c.code === code)?.symbol ?? code;
}

export function LocaleStep({ selected, onSelect, onBack }: Props) {
  const t = useTranslations("onboarding.locale");
  const tCommon = useTranslations("common");

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-text mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-muted mb-8">
        {t("subtitle")} {t("note")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[400px] overflow-y-auto px-1">
        {locales.map((locale) => {
          const isSelected = selected === locale;
          const currency = localeCurrencyMap[locale];
          const symbol = getSymbol(currency);

          return (
            <button
              key={locale}
              type="button"
              onClick={() => onSelect(locale)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left hover:border-signal/60 ${
                isSelected
                  ? "border-signal bg-signal/5"
                  : "border-border hover:bg-panel2/50"
              }`}
            >
              <span className="text-xl shrink-0">{localeFlagEmojis[locale]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text truncate">
                  {localeDisplayNames[locale]}
                </div>
              </div>
              <div className="text-xs text-muted shrink-0">
                {symbol} {currency}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
      >
        <ArrowLeft size={14} />
        {tCommon("back")}
      </button>
    </div>
  );
}
