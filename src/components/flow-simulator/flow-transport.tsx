"use client";

import { SkipBack, SkipForward } from "lucide-react";
import { FilledPlay, FilledPause } from "@/components/ui/filled-icon";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatTime } from "@/components/ui/audio-player-shared";
import { cn } from "@/lib/cn";
import type { FlowMode } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  isPlaying: boolean;
  currentTrackTitle: string;
  currentTime: number;
  totalDuration: number;
  mode: FlowMode;
  transitionWindow: number;
  canSkipPrev: boolean;
  canSkipNext: boolean;
  onTogglePlayPause: () => void;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onModeChange: (mode: FlowMode) => void;
  onTransitionWindowChange: (seconds: number) => void;
};

/* ------------------------------------------------------------------ */
/*  Transition Window Slider                                           */
/* ------------------------------------------------------------------ */

const TRANSITION_STEPS = [5, 10, 15, 20, 30];

function TransitionSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted whitespace-nowrap">Transition</span>
      <input
        type="range"
        min={5}
        max={30}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 h-1 accent-signal cursor-pointer"
      />
      <span className="text-xs text-text font-medium w-6 text-right">{value}s</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowTransport({
  isPlaying,
  currentTrackTitle,
  currentTime,
  totalDuration,
  mode,
  transitionWindow,
  canSkipPrev,
  canSkipNext,
  onTogglePlayPause,
  onSkipPrev,
  onSkipNext,
  onModeChange,
  onTransitionWindowChange,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      {/* Left: Transport controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSkipPrev}
          disabled={!canSkipPrev}
          className={cn(
            "p-2 rounded-md transition-colors",
            canSkipPrev
              ? "text-muted hover:text-text"
              : "text-faint cursor-not-allowed",
          )}
          title="Previous track"
        >
          <SkipBack size={16} />
        </button>

        <button
          type="button"
          onClick={onTogglePlayPause}
          className="w-10 h-10 rounded-full bg-signal text-signal-on flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FilledPause size={16} /> : <FilledPlay size={16} />}
        </button>

        <button
          type="button"
          onClick={onSkipNext}
          disabled={!canSkipNext}
          className={cn(
            "p-2 rounded-md transition-colors",
            canSkipNext
              ? "text-muted hover:text-text"
              : "text-faint cursor-not-allowed",
          )}
          title="Next track"
        >
          <SkipForward size={16} />
        </button>

        {/* Time display */}
        <div className="text-xs text-muted tabular-nums ml-1">
          <span className="text-text font-medium">{formatTime(currentTime)}</span>
          {" / "}
          {formatTime(totalDuration)}
        </div>

        {/* Currently playing track name */}
        {currentTrackTitle && (
          <span className="text-xs text-muted truncate max-w-48 hidden sm:inline">
            — {currentTrackTitle}
          </span>
        )}
      </div>

      {/* Right: Mode toggle + transition slider */}
      <div className="flex items-center gap-4">
        {mode === "condensed" && (
          <TransitionSlider
            value={transitionWindow}
            onChange={onTransitionWindowChange}
          />
        )}
        <SegmentedControl
          options={[
            { value: "full", label: "Full" },
            { value: "condensed", label: "Condensed" },
          ]}
          value={mode}
          onChange={(v) => onModeChange(v as FlowMode)}
        />
      </div>
    </div>
  );
}
