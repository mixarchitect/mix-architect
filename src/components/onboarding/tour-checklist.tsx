"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TourTopic } from "@/lib/onboarding/tour-config";

type Props = {
  topics: TourTopic[];
  seenTopics: string[];
  activeTopicId: string | null;
  hint: string | null;
  onGoToTopic: (topicId: string) => void;
  onDismiss: () => void;
  onClearHint: () => void;
};

export function TourChecklist({
  topics,
  seenTopics,
  activeTopicId,
  hint,
  onGoToTopic,
  onDismiss,
  onClearHint,
}: Props) {
  const t = useTranslations("tour");
  const [expanded, setExpanded] = useState(false);

  const seenCount = seenTopics.length;
  const totalTopics = topics.length;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-20 md:right-24 z-[10000]" style={{ pointerEvents: "auto" }}>
      {/* Collapsed pill */}
      {!expanded && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg text-xs font-medium transition-colors hover:border-signal/50"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
              <circle cx="9" cy="9" r="7" fill="none" stroke="var(--border)" strokeWidth="2" />
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="2"
                strokeDasharray={`${(seenCount / totalTopics) * 44} 44`}
                strokeLinecap="round"
                transform="rotate(-90 9 9)"
                style={{ transition: "stroke-dasharray 300ms ease-out" }}
              />
            </svg>
            <span>{t("tourCount", { seen: seenCount, total: totalTopics })}</span>
            <ChevronUp size={12} className="text-muted" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center justify-center w-7 h-7 rounded-full border shadow-lg text-muted hover:text-text transition-colors"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
            }}
            aria-label={t("endTour")}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Expanded card */}
      {expanded && (
        <div
          className="w-64 rounded-xl border shadow-xl overflow-hidden"
          style={{ background: "var(--panel)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold text-text">{t("guidedTour")}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onDismiss}
                className="text-muted hover:text-text transition-colors p-0.5"
                aria-label={t("endTour")}
                title={t("endTour")}
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-muted hover:text-text transition-colors p-0.5"
                aria-label={t("collapse")}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="py-2">
            {topics.map((topic, i) => {
              const isSeen = seenTopics.includes(topic.id);
              const isActive = topic.id === activeTopicId;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    onGoToTopic(topic.id);
                  }}
                  className="flex items-center gap-3 px-4 py-2 w-full text-left transition-colors hover:bg-panel2 cursor-pointer"
                >
                  {/* Status icon */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{
                      background: isSeen
                        ? "var(--signal)"
                        : isActive
                          ? "var(--signal)"
                          : "var(--panel2)",
                      color: isSeen || isActive ? "var(--signal-on)" : "var(--text-muted)",
                      opacity: isSeen ? 0.7 : 1,
                    }}
                  >
                    {isSeen ? (
                      <Check size={12} />
                    ) : isActive ? (
                      <span className="block w-2 h-2 rounded-full bg-current animate-pulse" />
                    ) : (
                      i + 1
                    )}
                  </div>

                  {/* Label */}
                  <div className="min-w-0">
                    <div
                      className="text-xs font-medium truncate"
                      style={{
                        color: isActive ? "var(--text)" : "var(--text-muted)",
                      }}
                    >
                      {topic.label}
                    </div>
                    <div className="text-[10px] text-faint truncate">
                      {topic.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint banner */}
          {hint && (
            <div
              className="mx-3 mb-2 px-3 py-2 rounded-lg text-[11px] leading-snug flex items-start gap-2"
              style={{ background: "var(--signal)", color: "var(--signal-on)" }}
            >
              <span className="shrink-0 mt-px">💡</span>
              <span className="flex-1">{hint}</span>
              <button
                type="button"
                onClick={onClearHint}
                className="shrink-0 mt-px opacity-70 hover:opacity-100"
                aria-label="Dismiss hint"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <span className="text-[10px] text-faint">
              {t("completedCount", { seen: seenCount, total: totalTopics })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
