"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { TOUR_PHASES } from "@/lib/onboarding/tour-config";
import type { Position, AdvanceOn } from "@/lib/onboarding/tour-config";

type Props = {
  targetSelector: string;
  title: string;
  description: string;
  position: Position;
  advanceOn: AdvanceOn;
  phaseLabel: string;
  stepNumber: number;
  totalStepsInPhase: number;
  phaseIndex: number;
  completedPhases: string[];
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
};

export function TourTooltip({
  targetSelector,
  title,
  description,
  position,
  advanceOn,
  phaseLabel,
  stepNumber,
  totalStepsInPhase,
  phaseIndex,
  completedPhases,
  isLast,
  onNext,
  onSkip,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    const target = document.querySelector(targetSelector);
    const tooltip = tooltipRef.current;

    // For tour-complete step, center in viewport
    if (!target || targetSelector.includes("tour-complete")) {
      if (tooltip) {
        const tw = tooltip.getBoundingClientRect().width;
        const th = tooltip.getBoundingClientRect().height;
        setCoords({
          top: window.innerHeight / 2 - th / 2,
          left: window.innerWidth / 2 - tw / 2,
        });
        setOpacity(1);
      }
      return;
    }

    if (!tooltip) return;

    const rect = target.getBoundingClientRect();
    const tw = tooltip.getBoundingClientRect().width;
    const th = tooltip.getBoundingClientRect().height;
    const gap = 16;

    let top = 0;
    let left = 0;

    // On mobile, always position below
    const isMobile = window.innerWidth < 768;
    const pos = isMobile ? "bottom" : position;

    switch (pos) {
      case "top":
        top = rect.top - th - gap;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + gap;
        break;
    }

    // Keep within viewport
    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

    setCoords({ top, left });
    setOpacity(1);
  }, [targetSelector, position]);

  // Position on mount + track
  useEffect(() => {
    setOpacity(0);

    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout>;

    function tryPosition() {
      const target = document.querySelector(targetSelector);
      if (target || targetSelector.includes("tour-complete")) {
        updatePosition();
      } else if (retries < 40) {
        retries++;
        retryTimer = setTimeout(tryPosition, 100);
      }
    }

    // Small initial delay for DOM & spotlight to settle
    const initTimer = setTimeout(tryPosition, 150);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(retryTimer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetSelector, updatePosition]);

  const nextLabel =
    isLast ? "Finish" : advanceOn === "input" ? "or Next" : "Next";

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-label="Tour step"
      className="fixed z-[9999] w-80 rounded-xl border border-signal/30 shadow-xl"
      style={{
        top: coords.top,
        left: coords.left,
        opacity,
        background: "var(--panel)",
        pointerEvents: "auto",
        transition: "opacity 200ms ease-out, top 200ms ease-out, left 200ms ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-signal">
          {phaseLabel}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-muted hover:text-text transition-colors -mr-1"
          aria-label="Close tour"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-[11px] text-faint">
          Step {stepNumber} of {totalStepsInPhase}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            {nextLabel}
          </button>
        </div>
      </div>

      {/* Phase dots */}
      <div className="flex items-center justify-center gap-1.5 py-2">
        {TOUR_PHASES.map((p, i) => (
          <div
            key={p.id}
            className="rounded-full transition-all duration-200"
            style={{
              width: i === phaseIndex ? 16 : 6,
              height: 6,
              background:
                i === phaseIndex
                  ? "var(--signal)"
                  : completedPhases.includes(p.id)
                    ? "var(--signal)"
                    : "var(--border)",
              opacity: i === phaseIndex ? 1 : completedPhases.includes(p.id) ? 0.5 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
