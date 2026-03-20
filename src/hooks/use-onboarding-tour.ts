"use client";

import { useState, useCallback, useEffect } from "react";
import { getTourSteps, type TourStep } from "@/lib/onboarding/tour-steps";

type Persona = "artist" | "engineer" | "both" | "other";

export function useOnboardingTour(persona: Persona | null) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Only activate if the tour query param is present
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("tour")) return;

    // Default to "engineer" (all steps) if persona hasn't been set yet
    const tourSteps = getTourSteps(persona ?? "engineer");
    setSteps(tourSteps);
    setIsActive(true);
    setCurrentIndex(0);
  }, [persona]);

  const next = useCallback(() => {
    if (currentIndex >= steps.length - 1) {
      setIsActive(false);
      // Clean up URL param
      const url = new URL(window.location.href);
      url.searchParams.delete("tour");
      window.history.replaceState({}, "", url.toString());
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, steps.length]);

  const skip = useCallback(() => {
    setIsActive(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    window.history.replaceState({}, "", url.toString());
  }, []);

  return {
    currentStep: steps[currentIndex] ?? null,
    isActive,
    next,
    skip,
    stepNumber: currentIndex + 1,
    totalSteps: steps.length,
    isLast: currentIndex >= steps.length - 1,
  };
}
