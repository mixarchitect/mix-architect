"use client";

import { useRef, useEffect, useCallback } from "react";
import type { FlowTrack, FlowMode } from "./use-flow-audio";
import { computeOffsets, computeCondensedLayout } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  tracks: FlowTrack[];
  mode: FlowMode;
  transitionWindow: number;
  globalTime: number;
  currentTrackIndex: number;
  isPlaying: boolean;
  totalDuration: number;
  onSeek: (globalTime: number) => void;
};

/* ------------------------------------------------------------------ */
/*  Track segment colors (alternating for distinction)                  */
/* ------------------------------------------------------------------ */

const SEGMENT_COLORS_LIGHT = [
  "rgba(20, 20, 20, 0.06)",
  "rgba(20, 20, 20, 0.12)",
];

const SEGMENT_COLORS_DARK = [
  "rgba(232, 232, 232, 0.06)",
  "rgba(232, 232, 232, 0.12)",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowTimeline({
  tracks,
  mode,
  transitionWindow,
  globalTime,
  currentTrackIndex,
  isPlaying,
  totalDuration,
  onSeek,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Read CSS custom properties for theming */
  const getColors = useCallback(() => {
    const s = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const signalMuted = s.getPropertyValue("--signal-muted").trim() || "rgba(13, 148, 136, 0.15)";
    const signal = s.getPropertyValue("--signal").trim() || "#0D9488";
    const text = s.getPropertyValue("--text").trim() || "#141414";
    const faint = s.getPropertyValue("--faint").trim() || "rgba(20, 20, 20, 0.38)";
    const segmentColors = isDark ? SEGMENT_COLORS_DARK : SEGMENT_COLORS_LIGHT;

    return { signalMuted, signal, text, faint, segmentColors };
  }, []);

  /** Draw the timeline */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || tracks.length === 0 || totalDuration === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
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

    const colors = getColors();

    if (mode === "full") {
      // Full mode: one block per track
      const offsets = computeOffsets(tracks);
      for (let i = 0; i < tracks.length; i++) {
        const startX = (offsets[i] / totalDuration) * w;
        const segWidth = i < tracks.length - 1
          ? ((offsets[i + 1] - offsets[i]) / totalDuration) * w
          : w - startX;

        ctx.fillStyle = i === currentTrackIndex
          ? colors.signalMuted
          : colors.segmentColors[i % 2];
        ctx.fillRect(startX, 0, segWidth, h);

        if (i > 0) {
          ctx.fillStyle = colors.faint;
          ctx.fillRect(startX, 0, 1, h);
        }

        if (segWidth > 60) {
          ctx.fillStyle = colors.text;
          ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.globalAlpha = 0.5;
          const label = tracks[i].title.length > segWidth / 7
            ? tracks[i].title.slice(0, Math.floor(segWidth / 7)) + "…"
            : tracks[i].title;
          ctx.fillText(label, startX + 8, h / 2 + 4);
          ctx.globalAlpha = 1;
        }
      }
    } else {
      // Condensed mode: one block per segment (head/tail/full)
      const { segments, offsets } = computeCondensedLayout(tracks, transitionWindow);
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const startX = (offsets[i] / totalDuration) * w;
        const segWidth = i < segments.length - 1
          ? ((offsets[i + 1] - offsets[i]) / totalDuration) * w
          : w - startX;

        ctx.fillStyle = seg.trackIndex === currentTrackIndex
          ? colors.signalMuted
          : colors.segmentColors[seg.trackIndex % 2];
        ctx.fillRect(startX, 0, segWidth, h);

        if (i > 0) {
          ctx.fillStyle = colors.faint;
          ctx.fillRect(startX, 0, 1, h);
        }

        // Label: track title + (start)/(end) suffix
        if (segWidth > 50) {
          ctx.fillStyle = colors.text;
          ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.globalAlpha = 0.5;
          const suffix = seg.part === "head" ? " (start)" : seg.part === "tail" ? " (end)" : "";
          const fullLabel = tracks[seg.trackIndex].title + suffix;
          const maxChars = Math.floor(segWidth / 7);
          const label = fullLabel.length > maxChars
            ? fullLabel.slice(0, maxChars) + "…"
            : fullLabel;
          ctx.fillText(label, startX + 6, h / 2 + 4);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw playback cursor
    const cursorX = (globalTime / totalDuration) * w;
    ctx.fillStyle = colors.signal;
    ctx.fillRect(cursorX - 1, 0, 2, h);

    // Cursor knob
    ctx.beginPath();
    ctx.arc(cursorX, h / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.signal;
    ctx.fill();
  }, [tracks, mode, transitionWindow, globalTime, currentTrackIndex, totalDuration, getColors]);

  // Draw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Redraw on resize
  useEffect(() => {
    const observer = new ResizeObserver(() => draw());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  /** Handle click to seek */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || totalDuration === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const seekTime = ratio * totalDuration;
      onSeek(Math.max(0, Math.min(seekTime, totalDuration)));
    },
    [totalDuration, onSeek],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-10 rounded-md overflow-hidden cursor-pointer border border-border"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleClick}
      />
    </div>
  );
}
