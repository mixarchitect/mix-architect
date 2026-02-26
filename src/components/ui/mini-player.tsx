"use client";

import Link from "next/link";
import { Play, Pause, X } from "lucide-react";
import { useAudio } from "@/lib/audio-context";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const {
    activeVersion,
    trackMeta,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    stop,
  } = useAudio();

  // Hide when nothing is loaded
  if (!activeVersion || !trackMeta) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trackUrl = `/app/releases/${trackMeta.releaseId}/tracks/${trackMeta.trackId}`;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-16 z-40 bg-panel border-t border-border shadow-lg">
      {/* Thin progress bar at top edge */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-signal transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2">
        {/* Cover art + track info — clickable, navigates to track */}
        <Link
          href={trackUrl}
          className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
        >
          {trackMeta.coverArtUrl ? (
            <img
              src={trackMeta.coverArtUrl}
              alt=""
              className="w-10 h-10 rounded-md object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-panel2 flex items-center justify-center text-lg text-faint shrink-0">
              ♪
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text truncate">
              {trackMeta.trackTitle}
            </div>
            <div className="text-xs text-muted truncate">
              {trackMeta.releaseTitle} &middot; v{activeVersion.version_number}
            </div>
          </div>
        </Link>

        {/* Time display */}
        <span className="font-mono text-xs text-muted hidden sm:block whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          className="w-9 h-9 rounded-full bg-signal text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          {isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>

        {/* Stop / Close */}
        <button
          onClick={stop}
          className="p-2 text-muted hover:text-text transition-colors shrink-0"
          title="Stop playback"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
