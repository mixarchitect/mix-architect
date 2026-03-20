"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

type Position = "top" | "bottom" | "left" | "right";

type Props = {
  targetSelector: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  position: Position;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
};

export function OnboardingTooltip({
  targetSelector,
  title,
  description,
  step,
  totalSteps,
  position,
  onNext,
  onSkip,
  isLast,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    opacity: 0,
    position: "fixed",
  });

  const updatePosition = useCallback(() => {
    const target = document.querySelector(targetSelector);
    if (!target || !tooltipRef.current) return;

    const rect = target.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 12;

    let top = 0;
    let left = 0;

    // On mobile, always position below
    const isMobile = window.innerWidth < 768;
    const pos = isMobile ? "bottom" : position;

    switch (pos) {
      case "top":
        top = rect.top - tooltip.height - gap;
        left = rect.left + rect.width / 2 - tooltip.width / 2;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltip.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.left - tooltip.width - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.right + gap;
        break;
    }

    // Keep within viewport
    left = Math.max(12, Math.min(left, window.innerWidth - tooltip.width - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - tooltip.height - 12));

    setStyle({
      position: "fixed",
      top,
      left,
      opacity: 1,
      zIndex: 9999,
      transition: "opacity 200ms, top 200ms, left 200ms",
    });

    // Scroll target into view
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [targetSelector, position]);

  useEffect(() => {
    // Retry until the target element exists in the DOM (form may load async)
    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout>;

    function tryPosition() {
      const target = document.querySelector(targetSelector);
      if (target) {
        updatePosition();
      } else if (retries < 30) {
        retries++;
        retryTimer = setTimeout(tryPosition, 100);
      }
    }

    const timer = setTimeout(tryPosition, 50);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition, targetSelector]);

  return (
    <>
      {/* Subtle backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={onSkip}
        aria-hidden="true"
      />

      <div
        ref={tooltipRef}
        role="tooltip"
        className="w-72 rounded-lg border border-signal/30 shadow-lg p-4"
        style={{ ...style, background: "var(--panel)" }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <button
            type="button"
            onClick={onSkip}
            className="text-muted hover:text-text transition-colors shrink-0 -mt-0.5"
            aria-label="Close tour"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-muted mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-faint">
            {step} of {totalSteps}
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
              className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
              style={{ background: "var(--signal)", color: "var(--signal-on)" }}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
