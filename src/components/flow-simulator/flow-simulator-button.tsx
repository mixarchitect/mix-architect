"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowSimulator } from "./flow-simulator";
import type { FlowTrack } from "./use-flow-audio";

type Props = {
  tracks: FlowTrack[];
  hiddenCount: number;
  releaseId: string;
  releaseTitle: string;
};

export function FlowSimulatorButton({ tracks, hiddenCount, releaseId, releaseTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Need at least 2 tracks with audio to use the simulator
  if (tracks.length < 2) return null;

  return (
    <>
      <Button
        variant="secondary"
        className="h-9 text-xs"
        onClick={() => setIsOpen(true)}
        title="Audition track flow and order"
      >
        <Shuffle size={14} />
        Flow
      </Button>

      {isOpen && (
        <FlowSimulator
          tracks={tracks}
          hiddenCount={hiddenCount}
          releaseId={releaseId}
          releaseTitle={releaseTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
