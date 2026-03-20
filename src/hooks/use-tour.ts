"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  TOUR_PHASES,
  TOTAL_TOUR_STEPS,
  type TourStep,
  type Phase,
  type Persona,
} from "@/lib/onboarding/tour-config";
import {
  readTourProgress,
  writeTourProgress,
  syncTourProgressToDB,
  finishTour,
  clearTourProgress,
  type TourProgress,
} from "@/lib/onboarding/tour-progress";

export type TourState = {
  isActive: boolean;
  currentPhase: Phase | null;
  currentStep: TourStep | null;
  phaseIndex: number;
  stepIndex: number;
  /** 1-based step number within current phase */
  stepNumber: number;
  totalStepsInPhase: number;
  /** 1-based overall step number across all phases */
  overallStepNumber: number;
  totalSteps: number;
  completedPhases: string[];
  isLastStep: boolean;
  isLastPhase: boolean;
  /** IDs stored during tour for cross-page nav */
  releaseId: string | null;
  trackId: string | null;
  /* Actions */
  advanceStep: () => void;
  skipTour: () => void;
  goToPhase: (phaseIndex: number) => void;
  setReleaseId: (id: string) => void;
  setTrackId: (id: string) => void;
};

export function useTour(persona: Persona | null): TourState {
  const router = useRouter();
  const pathname = usePathname();
  const initRef = useRef(false);

  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);

  // Persist helper
  const persist = useCallback(
    (updates: Partial<{
      active: boolean;
      pi: number;
      si: number;
      cp: string[];
      cs: string[];
      rid: string | null;
      tid: string | null;
    }>) => {
      const progress: TourProgress = {
        status: updates.active ?? isActive ? "active" : "completed",
        currentPhaseIndex: updates.pi ?? phaseIndex,
        currentStepIndex: updates.si ?? stepIndex,
        completedPhases: updates.cp ?? completedPhases,
        completedSteps: updates.cs ?? completedSteps,
        releaseId: updates.rid !== undefined ? (updates.rid ?? undefined) : (releaseId ?? undefined),
        trackId: updates.tid !== undefined ? (updates.tid ?? undefined) : (trackId ?? undefined),
      };
      writeTourProgress(progress);
      syncTourProgressToDB(progress);
    },
    [isActive, phaseIndex, stepIndex, completedPhases, completedSteps, releaseId, trackId],
  );

  // ── Helper: start a fresh tour ──
  const startFreshTour = useCallback(() => {
    setPhaseIndex(0);
    setStepIndex(0);
    setCompletedPhases([]);
    setCompletedSteps([]);
    setReleaseId(null);
    setTrackId(null);
    setIsActive(true);
    const progress: TourProgress = {
      status: "active",
      currentPhaseIndex: 0,
      currentStepIndex: 0,
      completedPhases: [],
      completedSteps: [],
    };
    writeTourProgress(progress);
    syncTourProgressToDB(progress);
  }, []);

  // ── Initialize from localStorage on first mount ──
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Check URL param
    const params = new URLSearchParams(window.location.search);
    const tourParam = params.has("tour");

    // Clean up URL param
    if (tourParam) {
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}`,
      );
    }

    // ?tour=true always starts fresh (even if previous tour was completed)
    if (tourParam) {
      clearTourProgress();
      startFreshTour();
      return;
    }

    // Otherwise try restoring an in-progress tour from localStorage
    const saved = readTourProgress();
    if (saved && saved.status === "active") {
      setPhaseIndex(saved.currentPhaseIndex);
      setStepIndex(saved.currentStepIndex);
      setCompletedPhases(saved.completedPhases);
      setCompletedSteps(saved.completedSteps);
      if (saved.releaseId) setReleaseId(saved.releaseId);
      if (saved.trackId) setTrackId(saved.trackId);
      setIsActive(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Watch for ?tour=true on subsequent navigations ──
  // (TourProvider stays mounted at Shell level, so we need to detect
  //  the param on client-side navigations after initial mount)
  useEffect(() => {
    if (!initRef.current) return; // wait for init first

    const params = new URLSearchParams(window.location.search);
    if (!params.has("tour")) return;

    // Strip the param from URL
    params.delete("tour");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );

    // Reset and start fresh
    clearTourProgress();
    startFreshTour();
  }, [pathname, startFreshTour]);

  // ── Advance step ──
  const advanceStep = useCallback(() => {
    const phase = TOUR_PHASES[phaseIndex];
    if (!phase) return;

    const currentStepId = phase.steps[stepIndex]?.id;
    const newCompleted = currentStepId
      ? [...completedSteps, currentStepId]
      : completedSteps;

    if (stepIndex < phase.steps.length - 1) {
      // Next step in same phase
      const nextSI = stepIndex + 1;
      setStepIndex(nextSI);
      setCompletedSteps(newCompleted);
      persist({ si: nextSI, cs: newCompleted });
    } else if (phaseIndex < TOUR_PHASES.length - 1) {
      // Move to next phase
      const newCompletedPhases = [...completedPhases, phase.id];
      const nextPI = phaseIndex + 1;
      setPhaseIndex(nextPI);
      setStepIndex(0);
      setCompletedPhases(newCompletedPhases);
      setCompletedSteps(newCompleted);
      persist({ pi: nextPI, si: 0, cp: newCompletedPhases, cs: newCompleted });

      // Navigate to next phase's route
      const nextPhase = TOUR_PHASES[nextPI];
      if (nextPhase?.getRoute) {
        const route = nextPhase.getRoute({ releaseId: releaseId ?? undefined, trackId: trackId ?? undefined });
        if (route && !pathname.startsWith(route.split("?")[0])) {
          router.push(route);
        }
      }
    } else {
      // Tour complete
      const newCompletedPhases = [...completedPhases, phase.id];
      setCompletedPhases(newCompletedPhases);
      setCompletedSteps(newCompleted);
      setIsActive(false);
      finishTour("completed");
    }
  }, [phaseIndex, stepIndex, completedPhases, completedSteps, releaseId, trackId, persist, pathname, router]);

  // ── Skip tour ──
  const skipTour = useCallback(() => {
    setIsActive(false);
    finishTour("skipped");
  }, []);

  // ── Go to a specific phase (clicked from checklist) ──
  const goToPhase = useCallback(
    (targetPhaseIndex: number) => {
      const targetPhase = TOUR_PHASES[targetPhaseIndex];
      if (!targetPhase) return;

      setPhaseIndex(targetPhaseIndex);
      setStepIndex(0);
      persist({ pi: targetPhaseIndex, si: 0 });

      // Navigate to the phase's route
      if (targetPhase.getRoute) {
        const route = targetPhase.getRoute({
          releaseId: releaseId ?? undefined,
          trackId: trackId ?? undefined,
        });
        if (route) {
          router.push(route);
        }
      }
    },
    [releaseId, trackId, persist, router],
  );

  // ── Set release/track IDs ──
  const handleSetReleaseId = useCallback(
    (id: string) => {
      setReleaseId(id);
      persist({ rid: id });
    },
    [persist],
  );

  const handleSetTrackId = useCallback(
    (id: string) => {
      setTrackId(id);
      persist({ tid: id });
    },
    [persist],
  );

  // ── Auto-advance on navigation (for "navigate" steps) ──
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (!isActive) return;
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    const phase = TOUR_PHASES[phaseIndex];
    const step = phase?.steps[stepIndex];
    if (!step || step.advanceOn !== "navigate") return;

    // Path changed and current step expects navigation → advance
    // Small delay so the new page renders its data-tour elements
    const timer = setTimeout(() => {
      advanceStep();
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, isActive, phaseIndex, stepIndex, advanceStep]);

  // ── Auto-advance on input/click ──
  useEffect(() => {
    if (!isActive) return;

    const phase = TOUR_PHASES[phaseIndex];
    const step = phase?.steps[stepIndex];
    if (!step) return;

    if (step.advanceOn === "input") {
      const threshold = step.advanceThreshold ?? 2;
      let debounce: ReturnType<typeof setTimeout>;

      const check = () => {
        const target = document.querySelector(step.targetSelector);
        if (!target) return;
        const input = target.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
        if (!input) return;
        if (input.value.length >= threshold) {
          debounce = setTimeout(() => advanceStep(), 600);
        }
      };

      // Poll for element then attach listener
      let retries = 0;
      let retryTimer: ReturnType<typeof setTimeout>;

      function attach() {
        const target = document.querySelector(step!.targetSelector);
        if (!target) {
          if (retries++ < 30) {
            retryTimer = setTimeout(attach, 100);
          }
          return;
        }
        const input = target.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
        if (!input) return;

        // If already filled (demo content), don't auto-advance immediately — let user see tooltip
        const handler = () => {
          clearTimeout(debounce);
          if (input.value.length >= threshold) {
            debounce = setTimeout(() => advanceStep(), 600);
          }
        };
        input.addEventListener("input", handler);

        // Store cleanup
        (window as unknown as Record<string, () => void>).__tourCleanup = () => {
          input.removeEventListener("input", handler);
          clearTimeout(debounce);
          clearTimeout(retryTimer);
        };
      }

      attach();
      return () => {
        const cleanup = (window as unknown as Record<string, () => void>).__tourCleanup;
        if (cleanup) cleanup();
        clearTimeout(retryTimer);
      };
    }

    if (step.advanceOn === "click") {
      let retries = 0;
      let retryTimer: ReturnType<typeof setTimeout>;

      function attach() {
        const target = document.querySelector(step!.targetSelector);
        if (!target) {
          if (retries++ < 30) {
            retryTimer = setTimeout(attach, 100);
          }
          return;
        }

        const handler = () => {
          setTimeout(() => advanceStep(), 300);
        };
        target.addEventListener("click", handler, { once: true });

        (window as unknown as Record<string, () => void>).__tourCleanup = () => {
          target.removeEventListener("click", handler);
          clearTimeout(retryTimer);
        };
      }

      attach();
      return () => {
        const cleanup = (window as unknown as Record<string, () => void>).__tourCleanup;
        if (cleanup) cleanup();
        clearTimeout(retryTimer);
      };
    }
  }, [isActive, phaseIndex, stepIndex, advanceStep]);

  // ── Detect releaseId / trackId from URL for cross-page nav ──
  useEffect(() => {
    if (!isActive) return;
    const releaseMatch = pathname.match(/\/app\/releases\/([a-f0-9-]+)/);
    if (releaseMatch && releaseMatch[1] !== releaseId) {
      handleSetReleaseId(releaseMatch[1]);
    }
    const trackMatch = pathname.match(/\/tracks\/([a-f0-9-]+)/);
    if (trackMatch && trackMatch[1] !== trackId) {
      handleSetTrackId(trackMatch[1]);
    }
  }, [pathname, isActive, releaseId, trackId, handleSetReleaseId, handleSetTrackId]);

  // ── Derived values ──
  const currentPhase = TOUR_PHASES[phaseIndex] ?? null;
  const currentStep = currentPhase?.steps[stepIndex] ?? null;

  let overallStepNumber = 1;
  for (let i = 0; i < phaseIndex; i++) {
    overallStepNumber += TOUR_PHASES[i].steps.length;
  }
  overallStepNumber += stepIndex;

  return {
    isActive,
    currentPhase,
    currentStep,
    phaseIndex,
    stepIndex,
    stepNumber: stepIndex + 1,
    totalStepsInPhase: currentPhase?.steps.length ?? 0,
    overallStepNumber,
    totalSteps: TOTAL_TOUR_STEPS,
    completedPhases,
    isLastStep:
      phaseIndex === TOUR_PHASES.length - 1 &&
      stepIndex === (TOUR_PHASES[TOUR_PHASES.length - 1]?.steps.length ?? 1) - 1,
    isLastPhase: phaseIndex === TOUR_PHASES.length - 1,
    releaseId,
    trackId,
    advanceStep,
    skipTour,
    goToPhase,
    setReleaseId: handleSetReleaseId,
    setTrackId: handleSetTrackId,
  };
}
