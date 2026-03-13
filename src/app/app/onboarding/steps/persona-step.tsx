"use client";

import { Music, SlidersHorizontal, Combine } from "lucide-react";
import { useTranslations } from "next-intl";

type Persona = "artist" | "engineer" | "both" | "other";

type Props = {
  selected: Persona;
  onSelect: (persona: Persona) => void;
};

const personaIds = [
  { id: "artist" as const, icon: Music },
  { id: "engineer" as const, icon: SlidersHorizontal },
  { id: "both" as const, icon: Combine },
];

const descKeys: Record<"artist" | "engineer" | "both", string> = {
  artist: "artistDesc",
  engineer: "engineerDesc",
  both: "bothDesc",
};

export function PersonaStep({ selected, onSelect }: Props) {
  const t = useTranslations("onboarding.persona");

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-text mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-muted mb-8">
        {t("note")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {personaIds.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:border-signal/60 ${
                isSelected
                  ? "border-signal bg-signal/5"
                  : "border-border hover:bg-panel2/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? "bg-signal/15 text-signal" : "bg-panel2 text-muted"
                }`}
              >
                <p.icon size={24} />
              </div>
              <div>
                <div className="font-medium text-text text-sm">{t(p.id)}</div>
                <div className="text-xs text-muted mt-1">{t(descKeys[p.id])}</div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect("other")}
        className="text-sm text-signal hover:underline transition-colors"
      >
        {t("other")}
      </button>
    </div>
  );
}
