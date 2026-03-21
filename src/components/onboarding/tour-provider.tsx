"use client";

import { createContext, useContext } from "react";
import { useTranslations } from "next-intl";
import { useTour, type TourState } from "@/hooks/use-tour";
import { TourSpotlight } from "./tour-spotlight";
import { TourTooltip } from "./tour-tooltip";
import { TourChecklist } from "./tour-checklist";

const TourContext = createContext<TourState | null>(null);

export function useTourContext(): TourState | null {
  return useContext(TourContext);
}

type Props = {
  persona: string | null;
  displayName: string | null;
  children: React.ReactNode;
};

export function TourProvider({ children }: Props) {
  const tour = useTour();
  const t = useTranslations("tour");

  // Translate topic/step strings using tour namespace, falling back to config defaults
  const tTopicLabel = (id: string, fallback: string) => {
    try { return t(`topicLabel.${id}`); } catch { return fallback; }
  };
  const tTopicDesc = (id: string, fallback: string) => {
    try { return t(`topicDesc.${id}`); } catch { return fallback; }
  };
  const tStepTitle = (id: string, fallback: string) => {
    try { return t(`stepTitle.${id}`); } catch { return fallback; }
  };
  const tStepDesc = (id: string, fallback: string) => {
    try { return t(`stepDesc.${id}`); } catch { return fallback; }
  };

  // Build translated topics for the checklist
  const translatedTopics = tour.allTopics.map((topic) => ({
    ...topic,
    label: tTopicLabel(topic.id, topic.label),
    description: tTopicDesc(topic.id, topic.description),
  }));

  return (
    <TourContext.Provider value={tour}>
      {children}

      {tour.isActive && (
        <>
          {/* Spotlight + tooltip only when there's an active step on this page */}
          {tour.activeStep && (
            <>
              <TourSpotlight
                targetSelector={tour.activeStep.targetSelector}
                padding={tour.activeStep.highlightPadding ?? 8}
              />
              <TourTooltip
                targetSelector={tour.activeStep.targetSelector}
                title={tStepTitle(tour.activeStep.id, tour.activeStep.title)}
                description={tStepDesc(tour.activeStep.id, tour.activeStep.description)}
                position={tour.activeStep.position}
                topicLabel={tour.activeTopic ? tTopicLabel(tour.activeTopic.id, tour.activeTopic.label) : ""}
                stepNumber={tour.stepIndex + 1}
                totalStepsInTopic={tour.totalStepsInTopic}
                isLastStep={tour.stepIndex === tour.totalStepsInTopic - 1}
                onNext={tour.nextStep}
                onSkip={tour.dismissTour}
              />
            </>
          )}

          {/* Checklist pill — always visible while tour is active */}
          <TourChecklist
            topics={translatedTopics}
            seenTopics={tour.seenTopics}
            activeTopicId={tour.activeTopic?.id ?? null}
            hint={tour.hint}
            onGoToTopic={tour.goToTopic}
            onDismiss={tour.dismissTour}
            onClearHint={tour.clearHint}
          />
        </>
      )}
    </TourContext.Provider>
  );
}
