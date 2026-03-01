"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { FlowSimulator } from "./flow-simulator";
import type { FlowTrack } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type FlowContextType = {
  isFlowOpen: boolean;
  openFlow: () => void;
  closeFlow: () => void;
};

const FlowContext = createContext<FlowContextType>({
  isFlowOpen: false,
  openFlow: () => {},
  closeFlow: () => {},
});

export function useFlowOpen() {
  return useContext(FlowContext);
}

/* ------------------------------------------------------------------ */
/*  Provider — wraps the entire release page                           */
/* ------------------------------------------------------------------ */

export function FlowProvider({ children }: { children: ReactNode }) {
  const [isFlowOpen, setIsFlowOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash === "#flow";
  });

  // Sync URL hash when state changes
  useEffect(() => {
    if (isFlowOpen) {
      window.history.replaceState(null, "", "#flow");
    } else {
      // Remove hash without scroll jump
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [isFlowOpen]);

  // Listen for browser back/forward (hash change)
  useEffect(() => {
    const handler = () => {
      setIsFlowOpen(window.location.hash === "#flow");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const openFlow = useCallback(() => setIsFlowOpen(true), []);
  const closeFlow = useCallback(() => setIsFlowOpen(false), []);

  return (
    <FlowContext.Provider value={{ isFlowOpen, openFlow, closeFlow }}>
      {children}
    </FlowContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Content switcher — conditionally renders FlowSimulator or children */
/* ------------------------------------------------------------------ */

type ContentProps = {
  flowTracks: FlowTrack[];
  flowHiddenCount: number;
  releaseId: string;
  releaseTitle: string;
  children: ReactNode;
};

export function ReleaseFlowContent({
  flowTracks,
  flowHiddenCount,
  releaseId,
  releaseTitle,
  children,
}: ContentProps) {
  const { isFlowOpen, closeFlow } = useFlowOpen();

  if (isFlowOpen) {
    return (
      <FlowSimulator
        tracks={flowTracks}
        hiddenCount={flowHiddenCount}
        releaseId={releaseId}
        releaseTitle={releaseTitle}
        onClose={closeFlow}
      />
    );
  }

  return <>{children}</>;
}
