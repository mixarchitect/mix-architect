"use client";

import { SkipBack, SkipForward, RotateCcw, Repeat } from "lucide-react";
import { FilledPlay, FilledPause } from "@/components/ui/filled-icon";
import { formatTime } from "@/components/ui/audio-player-shared";
import { cn } from "@/lib/cn";
import type { FlowMode } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  isPlaying: boolean;
  isLooping: boolean;
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
  onReturnToStart: () => void;
  onToggleLoop: () => void;
  onModeChange: (mode: FlowMode) => void;
  onTransitionWindowChange: (seconds: number) => void;
};

/* ------------------------------------------------------------------ */
/*  Transition Window Slider                                           */
/* ------------------------------------------------------------------ */

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
/*  Mode Toggle                                                        */
/* ------------------------------------------------------------------ */

function ModeToggle({
  mode,
  onChange,
}: {
  mode: FlowMode;
  onChange: (mode: FlowMode) => void;
}) {
  const isCondensed = mode === "condensed";
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "text-xs font-medium transition-colors cursor-pointer select-none",
          !isCondensed ? "text-text" : "text-muted",
        )}
        onClick={() => onChange("full")}
      >
        Full
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isCondensed}
        onClick={() => onChange(isCondensed ? "full" : "condensed")}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          isCondensed ? "bg-signal" : "bg-black/20 dark:bg-white/20",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            isCondensed ? "translate-x-[18px]" : "translate-x-[3px]",
          )}
        />
      </button>
      <span
        className={cn(
          "text-xs font-medium transition-colors cursor-pointer select-none",
          isCondensed ? "text-text" : "text-muted",
        )}
        onClick={() => onChange("condensed")}
      >
        Condensed
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowTransport({
  isPlaying,
  isLooping,
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
  onReturnToStart,
  onToggleLoop,
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

        {/* Return to start */}
        <button
          type="button"
          onClick={onReturnToStart}
          className="p-1.5 rounded-md text-muted hover:text-text transition-colors"
          title="Return to start"
        >
          <RotateCcw size={14} />
        </button>

        {/* Loop toggle */}
        <button
          type="button"
          onClick={onToggleLoop}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isLooping ? "text-signal" : "text-muted hover:text-text",
          )}
          title={isLooping ? "Loop (on)" : "Loop"}
        >
          <Repeat size={14} />
        </button>

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
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
