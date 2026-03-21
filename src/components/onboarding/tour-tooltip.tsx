"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Position } from "@/lib/onboarding/tour-config";

type Props = {
  targetSelector: string;
  title: string;
  description: string;
  position: Position;
  topicLabel: string;
  stepNumber: number;
  totalStepsInTopic: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
};

export function TourTooltip({
  targetSelector,
  title,
  description,
  position,
  topicLabel,
  stepNumber,
  totalStepsInTopic,
  isLastStep,
  onNext,
  onSkip,
}: Props) {
  const t = useTranslations("tour");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    const target = document.querySelector(targetSelector);
    const tooltip = tooltipRef.current;
    if (!target || !tooltip) {
      setOpacity(0);
      return;
    }

    const rect = target.getBoundingClientRect();
    const tw = tooltip.getBoundingClientRect().width;
    const th = tooltip.getBoundingClientRect().height;
    const gap = 16;

    let top = 0;
    let left = 0;

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

    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

    setCoords({ top, left });
    setOpacity(1);
  }, [targetSelector, position]);

  useEffect(() => {
    setOpacity(0);

    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout>;

    function tryPosition() {
      const target = document.querySelector(targetSelector);
      if (target) {
        updatePosition();
      } else if (retries < 20) {
        retries++;
        retryTimer = setTimeout(tryPosition, 150);
      }
    }

    const initTimer = setTimeout(tryPosition, 150);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    // Hide if target disappears (e.g. tab switch)
    const visCheck = setInterval(() => {
      const target = document.querySelector(targetSelector);
      if (!target) setOpacity(0);
      else updatePosition();
    }, 500);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(retryTimer);
      clearInterval(visCheck);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetSelector, updatePosition]);

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
          {topicLabel}
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-muted hover:text-text transition-colors -mr-1"
          aria-label={t("closeTour")}
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
          {t("completedCount", { seen: stepNumber, total: totalStepsInTopic })}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            {t("skipTour")}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            {isLastStep ? t("done") : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
