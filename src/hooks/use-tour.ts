"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  TOUR_TOPICS,
  TOTAL_TOUR_STEPS,
  type TourTopic,
  type TourStep,
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
  /** The topic currently being shown (if any matches this page & unseen) */
  activeTopic: TourTopic | null;
  /** Current step within the active topic */
  activeStep: TourStep | null;
  /** 0-based index of step within the active topic */
  stepIndex: number;
  /** Total steps in the active topic */
  totalStepsInTopic: number;
  /** Which topic IDs have been fully seen */
  seenTopics: string[];
  /** All topic definitions */
  allTopics: TourTopic[];
  /** Total steps across all topics */
  totalSteps: number;
  /** IDs for cross-page navigation */
  releaseId: string | null;
  trackId: string | null;
  /* Actions */
  nextStep: () => void;
  dismissTour: () => void;
  goToTopic: (topicId: string) => void;
};

export function useTour(): TourState {
  const pathname = usePathname();
  const initRef = useRef(false);

  const [isActive, setIsActive] = useState(false);
  const [seenTopics, setSeenTopics] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  // Track which topic is currently being shown (by ID)
  const [showingTopicId, setShowingTopicId] = useState<string | null>(null);

  /* ── persist helper ── */
  const persist = useCallback((seen: string[], rid?: string | null, tid?: string | null) => {
    const progress: TourProgress = {
      status: "active",
      seenTopics: seen,
      releaseId: rid ?? releaseId ?? undefined,
      trackId: tid ?? trackId ?? undefined,
    };
    writeTourProgress(progress);
    syncTourProgressToDB(progress);
  }, [releaseId, trackId]);

  /* ── Initialize ── */
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
      setSeenTopics([]);
      setStepIndex(0);
      setShowingTopicId(null);
      setIsActive(true);
      const progress: TourProgress = { status: "active", seenTopics: [] };
      writeTourProgress(progress);
      syncTourProgressToDB(progress);
      return;
    }

    const saved = readTourProgress();
    if (saved && saved.status === "active") {
      setSeenTopics(saved.seenTopics ?? []);
      if (saved.releaseId) setReleaseId(saved.releaseId);
      if (saved.trackId) setTrackId(saved.trackId);
      setIsActive(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Watch for ?tour=true on subsequent navigations ── */
  useEffect(() => {
    if (!initRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("tour")) return;
    params.delete("tour");
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    clearTourProgress();
    setSeenTopics([]);
    setStepIndex(0);
    setShowingTopicId(null);
    setIsActive(true);
    const progress: TourProgress = { status: "active", seenTopics: [] };
    writeTourProgress(progress);
    syncTourProgressToDB(progress);
  }, [pathname]);

  /* ── Extract IDs from URL ── */
  useEffect(() => {
    if (!isActive) return;
    const releaseMatch = pathname.match(/\/app\/releases\/([a-f0-9-]{36})/);
    if (releaseMatch && releaseMatch[1] !== releaseId) {
      setReleaseId(releaseMatch[1]);
      persist(seenTopics, releaseMatch[1], trackId);
    }
    const trackMatch = pathname.match(/\/tracks\/([a-f0-9-]{36})/);
    if (trackMatch && trackMatch[1] !== trackId) {
      setTrackId(trackMatch[1]);
      persist(seenTopics, releaseId, trackMatch[1]);
    }
  }, [pathname, isActive, releaseId, trackId, seenTopics, persist]);

  /* ── Determine which topic matches this page (first unseen one) ── */
  useEffect(() => {
    if (!isActive) return;

    const matchingUnseen = TOUR_TOPICS.find(
      (t) => t.matchPage(pathname) && !seenTopics.includes(t.id),
    );

    if (matchingUnseen) {
      // Only reset step if it's a different topic
      if (showingTopicId !== matchingUnseen.id) {
        setShowingTopicId(matchingUnseen.id);
        setStepIndex(0);
      }
    } else {
      // No matching unseen topic on this page — hide tooltips
      setShowingTopicId(null);
      setStepIndex(0);
    }
  }, [pathname, isActive, seenTopics, showingTopicId]);

  /* ── Derived ── */
  const activeTopic = showingTopicId
    ? TOUR_TOPICS.find((t) => t.id === showingTopicId) ?? null
    : null;
  const activeStep = activeTopic?.steps[stepIndex] ?? null;

  /* ── Next step / complete topic ── */
  const nextStep = useCallback(() => {
    if (!activeTopic) return;

    if (stepIndex < activeTopic.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Topic complete — mark as seen
      const newSeen = [...new Set([...seenTopics, activeTopic.id])];
      setSeenTopics(newSeen);
      setShowingTopicId(null);
      setStepIndex(0);
      persist(newSeen);

      // Check if ALL topics are now seen
      if (newSeen.length >= TOUR_TOPICS.length) {
        // Don't end yet — show completion on next render via activeTopic check
        setIsActive(false);
        finishTour("completed", newSeen);
      }
    }
  }, [activeTopic, stepIndex, seenTopics, persist]);

  /* ── Dismiss tour permanently ── */
  const dismissTour = useCallback(() => {
    setIsActive(false);
    setShowingTopicId(null);
    finishTour("skipped", seenTopics);
  }, [seenTopics]);

  /* ── Go to a specific topic (from checklist click) ── */
  const goToTopic = useCallback(
    (topicId: string) => {
      const topic = TOUR_TOPICS.find((t) => t.id === topicId);
      if (!topic) return;

      // If already seen, un-mark it so the tooltips show again
      const newSeen = seenTopics.filter((id) => id !== topicId);
      setSeenTopics(newSeen);
      setShowingTopicId(null);
      setStepIndex(0);
      persist(newSeen);

      const route = topic.getRoute({
        releaseId: releaseId ?? undefined,
        trackId: trackId ?? undefined,
      });

      if (route) {
        // Hard navigation to guarantee page change + fresh render
        window.location.href = route;
      }
    },
    [seenTopics, releaseId, trackId, persist],
  );

  return {
    isActive,
    activeTopic,
    activeStep,
    stepIndex,
    totalStepsInTopic: activeTopic?.steps.length ?? 0,
    seenTopics,
    allTopics: TOUR_TOPICS,
    totalSteps: TOTAL_TOUR_STEPS,
    releaseId,
    trackId,
    nextStep,
    dismissTour,
    goToTopic,
  };
}
