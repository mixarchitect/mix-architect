"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { TOUR_PHASES } from "@/lib/onboarding/tour-config";

type Props = {
  phaseIndex: number;
  completedPhases: string[];
  overallStep: number;
  totalSteps: number;
  onGoToPhase: (phaseIndex: number) => void;
  onDismiss: () => void;
};

export function TourChecklist({
  phaseIndex,
  completedPhases,
  overallStep,
  totalSteps,
  onGoToPhase,
  onDismiss,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Deduplicate and cap to prevent "5/4" style bugs
  const uniqueCompleted = [...new Set(completedPhases)];
  const totalPhases = TOUR_PHASES.length;
  const completedCount = Math.min(uniqueCompleted.length, totalPhases);

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
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="none"
                stroke="var(--border)"
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="2"
                strokeDasharray={`${(completedCount / totalPhases) * 44} 44`}
                strokeLinecap="round"
                transform="rotate(-90 9 9)"
                style={{ transition: "stroke-dasharray 300ms ease-out" }}
              />
            </svg>
            <span>
              Tour {completedCount}/{totalPhases}
            </span>
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
            aria-label="End tour"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Expanded card */}
      {expanded && (
        <div
          className="w-64 rounded-xl border shadow-xl overflow-hidden"
          style={{
            background: "var(--panel)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold text-text">Guided Tour</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onDismiss}
                className="text-muted hover:text-text transition-colors p-0.5"
                aria-label="End tour"
                title="End tour"
              >
                <X size={14} />
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-muted hover:text-text transition-colors p-0.5"
                aria-label="Collapse"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="py-2">
            {TOUR_PHASES.map((phase, i) => {
              const isCompleted = uniqueCompleted.includes(phase.id);
              const isCurrent = i === phaseIndex;
              const isClickable = i !== phaseIndex;

              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      onGoToPhase(i);
                      setExpanded(false);
                    }
                  }}
                  disabled={!isClickable}
                  className={`flex items-center gap-3 px-4 py-2 w-full text-left transition-colors ${
                    isClickable
                      ? "hover:bg-panel2 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{
                      background: isCompleted
                        ? "var(--signal)"
                        : isCurrent
                          ? "var(--signal)"
                          : "var(--panel2)",
                      color: isCompleted || isCurrent ? "var(--signal-on)" : "var(--text-muted)",
                      opacity: isCompleted ? 0.7 : 1,
                    }}
                  >
                    {isCompleted ? (
                      <Check size={12} />
                    ) : isCurrent ? (
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
                        color: isCurrent ? "var(--text)" : isCompleted ? "var(--text-muted)" : "var(--text-muted)",
                      }}
                    >
                      {phase.label}
                    </div>
                    <div className="text-[10px] text-faint truncate">
                      {phase.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2.5 border-t text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[10px] text-faint">
              Step {overallStep} of {totalSteps} overall
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
