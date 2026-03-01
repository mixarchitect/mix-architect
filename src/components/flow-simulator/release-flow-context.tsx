"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FlowSimulator } from "./flow-simulator";
import type { FlowTrack } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type FlowContextType = {
  openFlow: () => void;
};

const FlowContext = createContext<FlowContextType>({ openFlow: () => {} });

export function useFlowOpen() {
  return useContext(FlowContext);
}

/* ------------------------------------------------------------------ */
/*  Wrapper Component                                                  */
/* ------------------------------------------------------------------ */

type Props = {
  flowTracks: FlowTrack[];
  flowHiddenCount: number;
  releaseId: string;
  releaseTitle: string;
  children: ReactNode;
};

/**
 * Wraps the release page grid content. When the Flow Simulator is open,
 * replaces the grid with the simulator — keeping the release toolbar
 * and sidebar nav visible above/beside it.
 */
export function ReleaseFlowWrapper({
  flowTracks,
  flowHiddenCount,
  releaseId,
  releaseTitle,
  children,
}: Props) {
  const [isFlowOpen, setIsFlowOpen] = useState(false);

  return (
    <FlowContext.Provider value={{ openFlow: () => setIsFlowOpen(true) }}>
      {isFlowOpen ? (
        <FlowSimulator
          tracks={flowTracks}
          hiddenCount={flowHiddenCount}
          releaseId={releaseId}
          releaseTitle={releaseTitle}
          onClose={() => setIsFlowOpen(false)}
        />
      ) : (
        children
      )}
    </FlowContext.Provider>
  );
}
