"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTour, type TourState } from "@/hooks/use-tour";
import { TourSpotlight } from "./tour-spotlight";
import { TourTooltip } from "./tour-tooltip";
import { TourChecklist } from "./tour-checklist";
import type { Persona } from "@/lib/onboarding/tour-config";

const TourContext = createContext<TourState | null>(null);

export function useTourContext(): TourState | null {
  return useContext(TourContext);
}

type Props = {
  persona: string | null;
  displayName: string | null;
  children: React.ReactNode;
};

export function TourProvider({ persona, displayName, children }: Props) {
  const tour = useTour((persona as Persona) ?? null);
  const pathname = usePathname();

  const value = useMemo(() => tour, [tour]);

  const isComplete = tour.currentStep?.id === "tour-complete";

  // Only show spotlight/tooltip when the current page matches
  // the step's expected page pattern (if one is set)
  const step = tour.currentStep;
  const stepPagePattern = step?.pagePattern;
  const isOnCorrectPage = (() => {
    if (!stepPagePattern) return true;
    const basePath = stepPagePattern.split("?")[0];
    // Exact match mode (for dashboard "/app")
    if (step?.pagePatternExact) {
      if (pathname !== basePath) return false;
    } else {
      // Prefix match
      if (!pathname.includes(basePath)) return false;
    }
    // Check exclusions (e.g. /settings, /tracks/)
    if (step?.pagePatternExclude?.length) {
      if (step.pagePatternExclude.some((ex) => pathname.includes(ex))) return false;
    }
    return true;
  })();

  return (
    <TourContext.Provider value={value}>
      {children}

      {/* ── Tour overlay (rendered at Shell level, persists across pages) ── */}
      {tour.isActive && tour.currentStep && (
        <>
          {/* SVG spotlight with cutout — pointer-events: none so page stays interactive */}
          {!isComplete && isOnCorrectPage && (
            <TourSpotlight
              targetSelector={tour.currentStep.targetSelector}
              padding={tour.currentStep.highlightPadding ?? 8}
              optional={isComplete}
            />
          )}

          {/* Tooltip with phase progress — only on correct page */}
          {isOnCorrectPage && (
            <TourTooltip
              targetSelector={tour.currentStep.targetSelector}
              title={tour.currentStep.title}
              description={tour.currentStep.description}
              position={tour.currentStep.position}
              advanceOn={tour.currentStep.advanceOn}
              phaseLabel={tour.currentPhase?.label ?? ""}
              stepNumber={tour.stepNumber}
              totalStepsInPhase={tour.totalStepsInPhase}
              phaseIndex={tour.phaseIndex}
              completedPhases={tour.completedPhases}
              isLast={tour.isLastStep}
              onNext={tour.advanceStep}
              onSkip={tour.skipTour}
            />
          )}

          {/* Floating checklist pill — always visible while tour is active */}
          <TourChecklist
            phaseIndex={tour.phaseIndex}
            completedPhases={tour.completedPhases}
            overallStep={tour.overallStepNumber}
            totalSteps={tour.totalSteps}
            onGoToPhase={tour.goToPhase}
            onDismiss={tour.skipTour}
          />

          {/* Invisible anchor for tour-complete step */}
          {isComplete && (
            <div
              data-tour-complete
              className="fixed top-1/2 left-1/2 w-0 h-0"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </TourContext.Provider>
  );
}
