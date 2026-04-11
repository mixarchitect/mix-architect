"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

interface FeaturedAudioPlayerProps {
  audioUrl: string;
  title: string;
  artist: string;
  duration?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FeaturedAudioPlayer({
  audioUrl,
  title,
  artist,
  duration: initialDuration,
}: FeaturedAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<InstanceType<typeof import("wavesurfer.js").default> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration ?? 0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize WaveSurfer when in view
  useEffect(() => {
    if (!inView || !containerRef.current) return;

    let ws: InstanceType<typeof import("wavesurfer.js").default> | null = null;

    async function init() {
      try {
        const WaveSurfer = (await import("wavesurfer.js")).default;
        const container = containerRef.current;
        if (!container) return;

        // Find or create the waveform container
        let waveEl = container.querySelector<HTMLDivElement>("[data-waveform]");
        if (!waveEl) return;

        ws = WaveSurfer.create({
          container: waveEl,
          url: audioUrl,
          barWidth: 3,
          barGap: 1,
          barRadius: 1,
          height: 64,
          waveColor: "#3f3f46", // zinc-700
          progressColor: "#0d9488", // teal-500
          cursorColor: "#0d9488",
          cursorWidth: 2,
          normalize: true,
        });

        ws.on("ready", () => {
          setLoaded(true);
          setDuration(ws!.getDuration());
        });

        ws.on("timeupdate", (t: number) => setCurrentTime(t));
        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("finish", () => setIsPlaying(false));
        ws.on("error", () => setError(true));

        wavesurferRef.current = ws;
      } catch {
        setError(true);
      }
    }

    init();

    return () => {
      ws?.destroy();
      wavesurferRef.current = null;
    };
  }, [inView, audioUrl]);

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  if (error) {
    return (
      <div
        ref={containerRef}
        className="rounded-lg border border-border bg-panel p-4 text-center"
      >
        <p className="text-xs text-zinc-500">Audio unavailable</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-border bg-panel p-4 space-y-3"
    >
      {/* Header: play button + track info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!loaded}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
            loaded
              ? "bg-teal-500 hover:bg-teal-400 text-white"
              : "bg-zinc-800 text-zinc-600",
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5v11l9.5-5.5z" />
            </svg>
          )}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text truncate">{title}</p>
          <p className="text-xs text-muted truncate">{artist}</p>
        </div>
      </div>

      {/* Waveform */}
      <div data-waveform className="w-full min-h-[64px]">
        {!loaded && !error && (
          <div className="flex items-center justify-center h-[64px]">
            {inView ? (
              <div className="flex gap-0.5 items-end h-8">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-sm bg-zinc-800 animate-pulse"
                    style={{
                      height: `${12 + Math.sin(i * 0.5) * 10 + Math.random() * 8}px`,
                      animationDelay: `${i * 30}ms`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[64px] bg-zinc-900 rounded w-full" />
            )}
          </div>
        )}
      </div>

      {/* Time display */}
      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
      </div>
    </div>
  );
}
