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

/* ── dedupe helper ── */
function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}

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

  // Guard against advanceStep being called twice for the same step
  const advancingRef = useRef(false);

  // Keep IDs in refs so advanceStep always has current values
  const releaseIdRef = useRef(releaseId);
  const trackIdRef = useRef(trackId);
  useEffect(() => { releaseIdRef.current = releaseId; }, [releaseId]);
  useEffect(() => { trackIdRef.current = trackId; }, [trackId]);

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
    advancingRef.current = false;
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

    const params = new URLSearchParams(window.location.search);
    const tourParam = params.has("tour");

    if (tourParam) {
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }

    if (tourParam) {
      clearTourProgress();
      startFreshTour();
      return;
    }

    const saved = readTourProgress();
    if (saved && saved.status === "active") {
      setPhaseIndex(saved.currentPhaseIndex);
      setStepIndex(saved.currentStepIndex);
      setCompletedPhases(unique(saved.completedPhases));
      setCompletedSteps(unique(saved.completedSteps));
      if (saved.releaseId) setReleaseId(saved.releaseId);
      if (saved.trackId) setTrackId(saved.trackId);
      setIsActive(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Watch for ?tour=true on subsequent navigations ──
  useEffect(() => {
    if (!initRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("tour")) return;

    params.delete("tour");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);

    clearTourProgress();
    startFreshTour();
  }, [pathname, startFreshTour]);

  // ── Advance step (with double-call guard) ──
  const advanceStep = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    // Release guard after React processes the state batch
    setTimeout(() => { advancingRef.current = false; }, 100);

    const phase = TOUR_PHASES[phaseIndex];
    if (!phase) return;

    const currentStepId = phase.steps[stepIndex]?.id;
    const newCompleted = currentStepId
      ? unique([...completedSteps, currentStepId])
      : completedSteps;

    if (stepIndex < phase.steps.length - 1) {
      // Next step in same phase
      const nextSI = stepIndex + 1;
      setStepIndex(nextSI);
      setCompletedSteps(newCompleted);
      persist({ si: nextSI, cs: newCompleted });
    } else if (phaseIndex < TOUR_PHASES.length - 1) {
      // Move to next phase
      const newCompletedPhases = unique([...completedPhases, phase.id]);
      const nextPI = phaseIndex + 1;
      setPhaseIndex(nextPI);
      setStepIndex(0);
      setCompletedPhases(newCompletedPhases);
      setCompletedSteps(newCompleted);
      persist({ pi: nextPI, si: 0, cp: newCompletedPhases, cs: newCompleted });

      // Navigate to next phase's route — use refs for current IDs
      const nextPhase = TOUR_PHASES[nextPI];
      if (nextPhase?.getRoute) {
        const currentPath = window.location.pathname;
        const route = nextPhase.getRoute({
          releaseId: releaseIdRef.current ?? undefined,
          trackId: trackIdRef.current ?? undefined,
        });
        if (route && !currentPath.startsWith(route.split("?")[0])) {
          router.push(route);
        }
      }
    } else {
      // Tour complete
      const newCompletedPhases = unique([...completedPhases, phase.id]);
      setCompletedPhases(newCompletedPhases);
      setCompletedSteps(newCompleted);
      setIsActive(false);
      finishTour("completed");
    }
  }, [phaseIndex, stepIndex, completedPhases, completedSteps, persist, router]);

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

      if (targetPhase.getRoute) {
        const route = targetPhase.getRoute({
          releaseId: releaseIdRef.current ?? undefined,
          trackId: trackIdRef.current ?? undefined,
        });
        if (route) {
          router.push(route);
        }
      }
    },
    [persist, router],
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

    // Extract IDs from the new pathname before advancing
    const releaseMatch = pathname.match(/\/app\/releases\/([a-f0-9-]+)/);
    const trackMatch = pathname.match(/\/tracks\/([a-f0-9-]+)/);
    if (releaseMatch) releaseIdRef.current = releaseMatch[1];
    if (trackMatch) trackIdRef.current = trackMatch[1];
    if (releaseMatch && releaseMatch[1] !== releaseId) {
      setReleaseId(releaseMatch[1]);
    }
    if (trackMatch && trackMatch[1] !== trackId) {
      setTrackId(trackMatch[1]);
    }

    const timer = setTimeout(() => {
      advanceStep();
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname, isActive, phaseIndex, stepIndex, advanceStep, releaseId, trackId]);

  // ── Auto-advance on input/click ──
  useEffect(() => {
    if (!isActive) return;

    const phase = TOUR_PHASES[phaseIndex];
    const step = phase?.steps[stepIndex];
    if (!step) return;

    if (step.advanceOn === "input") {
      const threshold = step.advanceThreshold ?? 2;
      let debounce: ReturnType<typeof setTimeout>;
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

        const handler = () => {
          clearTimeout(debounce);
          if (input.value.length >= threshold) {
            debounce = setTimeout(() => advanceStep(), 600);
          }
        };
        input.addEventListener("input", handler);

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
