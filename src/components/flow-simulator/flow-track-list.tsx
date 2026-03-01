"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { formatTime, getWaveColors } from "@/components/ui/audio-player-shared";
import { cn } from "@/lib/cn";
import type { FlowTrack } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  tracks: FlowTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onTrackClick: (index: number) => void;
  hiddenCount: number;
};

/* ------------------------------------------------------------------ */
/*  Mini Waveform (canvas)                                             */
/* ------------------------------------------------------------------ */

function MiniWaveform({
  peaks,
  progress,
}: {
  peaks: number[][] | null;
  progress: number; // 0-1
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || peaks.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const colors = getWaveColors();
    const data = peaks[0]; // mono or first channel
    if (!data || data.length === 0) return;

    const barWidth = 2;
    const barGap = 1;
    const step = barWidth + barGap;
    const numBars = Math.floor(w / step);
    const samplesPerBar = Math.max(1, Math.floor(data.length / numBars));

    for (let i = 0; i < numBars; i++) {
      const sampleIdx = Math.floor(i * (data.length / numBars));
      let peak = 0;
      for (let j = 0; j < samplesPerBar && sampleIdx + j < data.length; j++) {
        peak = Math.max(peak, Math.abs(data[sampleIdx + j]));
      }

      const barHeight = Math.max(2, peak * h * 0.9);
      const x = i * step;
      const y = (h - barHeight) / 2;

      const ratio = i / numBars;
      ctx.fillStyle = ratio <= progress ? colors.progress : colors.wave;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [peaks, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="flex-1 h-6 min-w-[80px]"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowTrackList({
  tracks,
  currentTrackIndex,
  isPlaying,
  currentTime,
  onReorder,
  onTrackClick,
  hiddenCount,
}: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function handleDrop(fromIdx: number, toIdx: number) {
    if (fromIdx !== toIdx) {
      onReorder(fromIdx, toIdx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= tracks.length) return;
    onReorder(index, targetIdx);
  }

  return (
    <div className="space-y-1.5">
      {tracks.map((track, idx) => (
        <div
          key={track.id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverIdx(idx);
          }}
          onDrop={() => {
            if (dragIdx !== null) handleDrop(dragIdx, idx);
          }}
          onDragEnd={() => {
            setDragIdx(null);
            setDragOverIdx(null);
          }}
          onClick={() => onTrackClick(idx)}
          className={cn(
            "flex items-center gap-3 rounded-md border px-4 py-3 transition-all duration-150 cursor-pointer",
            "hover:border-border-strong",
            idx === currentTrackIndex && isPlaying
              ? "border-signal bg-signal-muted"
              : idx === currentTrackIndex
                ? "border-border-strong bg-panel"
                : "border-border bg-panel",
            dragIdx === idx && "opacity-40",
            dragOverIdx === idx && dragIdx !== idx && "border-signal border-dashed",
          )}
        >
          {/* Desktop: drag handle */}
          <GripVertical
            size={14}
            className="hidden md:block text-faint cursor-grab shrink-0 active:cursor-grabbing"
          />

          {/* Mobile: up/down arrows */}
          <div className="flex flex-col md:hidden shrink-0 -my-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMove(idx, -1);
              }}
              disabled={idx === 0}
              className={cn(
                "p-0.5 rounded transition-colors",
                idx === 0
                  ? "text-transparent"
                  : "text-faint hover:text-text active:text-text",
              )}
              title="Move up"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMove(idx, 1);
              }}
              disabled={idx === tracks.length - 1}
              className={cn(
                "p-0.5 rounded transition-colors",
                idx === tracks.length - 1
                  ? "text-transparent"
                  : "text-faint hover:text-text active:text-text",
              )}
              title="Move down"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Track number */}
          <span className="w-7 text-right text-sm font-medium text-faint shrink-0">
            {String(idx + 1).padStart(2, "0")}
          </span>

          {/* Track title */}
          <div className="min-w-0 w-40 shrink-0">
            <div className="text-sm font-semibold text-text truncate">
              {track.title}
            </div>
          </div>

          {/* Mini waveform */}
          <MiniWaveform
            peaks={track.waveformPeaks}
            progress={
              idx === currentTrackIndex
                ? track.durationSeconds > 0
                  ? currentTime / track.durationSeconds
                  : 0
                : 0
            }
          />

          {/* Duration */}
          <span className="text-xs text-muted tabular-nums shrink-0">
            {formatTime(track.durationSeconds)}
          </span>
        </div>
      ))}

      {/* Hidden tracks note */}
      {hiddenCount > 0 && (
        <p className="text-xs text-faint text-center py-2">
          {hiddenCount} track{hiddenCount !== 1 ? "s" : ""} without audio{" "}
          {hiddenCount !== 1 ? "are" : "is"} hidden
        </p>
      )}
    </div>
  );
}
