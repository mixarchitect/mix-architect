"use client";

import { createContext, useContext } from "react";
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
                title={tour.activeStep.title}
                description={tour.activeStep.description}
                position={tour.activeStep.position}
                topicLabel={tour.activeTopic?.label ?? ""}
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
            topics={tour.allTopics}
            seenTopics={tour.seenTopics}
            activeTopicId={tour.activeTopic?.id ?? null}
            onGoToTopic={tour.goToTopic}
            onDismiss={tour.dismissTour}
          />
        </>
      )}
    </TourContext.Provider>
  );
}
