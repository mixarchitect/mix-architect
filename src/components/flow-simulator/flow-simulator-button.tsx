"use client";

import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowOpen } from "./release-flow-context";
import type { FlowTrack } from "./use-flow-audio";

type Props = {
  tracks: FlowTrack[];
};

export function FlowSimulatorButton({ tracks }: Props) {
  const { openFlow } = useFlowOpen();

  // Need at least 2 tracks with audio to use the simulator
  if (tracks.length < 2) return null;

  return (
    <Button
      variant="secondary"
      className="h-9 text-xs"
      onClick={openFlow}
      title="Audition track flow and order"
    >
      <Shuffle size={14} />
      Flow
    </Button>
  );
}
