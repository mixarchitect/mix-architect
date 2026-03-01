"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/audio-context";
import { useToast } from "@/components/ui/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import {
  useFlowAudio,
  computeTotalDuration,
  computeCondensedLayout,
  type FlowTrack,
  type FlowMode,
} from "./use-flow-audio";
import { FlowTimeline } from "./flow-timeline";
import { FlowTransport } from "./flow-transport";
import { FlowTrackList } from "./flow-track-list";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Props = {
  tracks: FlowTrack[];
  hiddenCount: number;
  releaseId: string;
  releaseTitle?: string;
  onClose: () => void;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FlowSimulator({ tracks: initialTracks, hiddenCount, releaseId, onClose }: Props) {
  const router = useRouter();
  const sharedAudio = useAudio();
  const { toast } = useToast();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // ── Track ordering state ──────────────────────────────────────────
  const [orderedTracks, setOrderedTracks] = useState<FlowTrack[]>(initialTracks);
  const [originalOrder] = useState<FlowTrack[]>(initialTracks);
  const [undoStack, setUndoStack] = useState<FlowTrack[][]>([]);

  // ── Mode state ────────────────────────────────────────────────────
  const [mode, setMode] = useState<FlowMode>("condensed");
  const [transitionWindow, setTransitionWindow] = useState(15);

  // ── Apply order state ─────────────────────────────────────────────
  const [confirmApply, setConfirmApply] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // ── Audio engine ──────────────────────────────────────────────────
  const audio = useFlowAudio(orderedTracks, mode, transitionWindow);

  // ── Computed values ───────────────────────────────────────────────
  const totalDuration =
    mode === "full"
      ? computeTotalDuration(orderedTracks)
      : computeCondensedLayout(orderedTracks, transitionWindow).total;

  const isDirty = useMemo(() => {
    if (orderedTracks.length !== originalOrder.length) return true;
    return orderedTracks.some((t, i) => t.id !== originalOrder[i].id);
  }, [orderedTracks, originalOrder]);

  // ── Stop shared audio on mount ────────────────────────────────────
  useEffect(() => {
    sharedAudio.stop();
  }, [sharedAudio]);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when focus is on an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          audio.togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          audio.skipNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          audio.skipPrev();
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
        case "z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audio]);

  // ── Reorder handler ───────────────────────────────────────────────
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setUndoStack((prev) => [...prev, orderedTracks]);
      setOrderedTracks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [orderedTracks],
  );

  // ── Undo handler ─────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setOrderedTracks(last);
      return prev.slice(0, -1);
    });
  }, []);

  // ── Apply order handler ───────────────────────────────────────────
  const handleApplyOrder = useCallback(async () => {
    setIsApplying(true);
    try {
      const results = await Promise.all(
        orderedTracks.map((t, i) =>
          supabase.from("tracks").update({ track_number: i + 1 }).eq("id", t.id),
        ),
      );
      if (results.some((r) => r.error)) throw new Error("Reorder failed");
      toast("Track order applied to release", { variant: "success" });
      // Close first, then defer refresh to the next tick so React
      // finishes unmounting FlowSimulator and mounting the release
      // page children before the server re-render fires.
      onClose();
      setTimeout(() => router.refresh(), 0);
    } catch {
      toast("Failed to update track order", { variant: "error" });
    } finally {
      setIsApplying(false);
      setConfirmApply(false);
    }
  }, [orderedTracks, supabase, toast, router, onClose]);

  // ── Close handler (with dirty check) ──────────────────────────────
  const handleClose = useCallback(() => {
    audio.stop();
    onClose();
  }, [audio, onClose]);

  // ── Mode change handler ───────────────────────────────────────────
  const handleModeChange = useCallback(
    (newMode: FlowMode) => {
      const wasPlaying = audio.isPlaying;
      audio.stop();
      setMode(newMode);
      // Optionally restart playback in new mode
      if (wasPlaying) {
        // Small delay to let state settle
        setTimeout(() => audio.play(0), 50);
      }
    },
    [audio],
  );

  // ── Track click handler ───────────────────────────────────────────
  const handleTrackClick = useCallback(
    (index: number) => {
      audio.play(index);
    },
    [audio],
  );

  // ── Waveform seek handler ───────────────────────────────────────
  const handleSeekTrack = useCallback(
    (trackIndex: number, localTime: number) => {
      audio.seekToTrackLocal(trackIndex, localTime);
    },
    [audio],
  );

  // ── Return to start handler ────────────────────────────────────
  const handleReturnToStart = useCallback(() => {
    audio.seekToGlobal(0);
  }, [audio]);

  return (
    <div className="space-y-3">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text">Flow Simulator</h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded text-faint hover:text-text transition-colors"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Audition your track order. Drag to reorder, then apply changes to your release.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && undoStack.length > 0 && (
            <Button
              variant="ghost"
              className="h-9 text-xs"
              onClick={handleUndo}
            >
              Undo
            </Button>
          )}

          {/* Apply Order */}
          <div className="relative">
            {confirmApply ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Apply this order?</span>
                <Button
                  variant="primary"
                  className="h-9 text-xs"
                  onClick={handleApplyOrder}
                  disabled={isApplying}
                >
                  {isApplying ? "Applying…" : "Confirm"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 text-xs"
                  onClick={() => setConfirmApply(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="h-9 text-xs"
                onClick={() => setConfirmApply(true)}
                disabled={!isDirty}
              >
                Apply This Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div className="pt-2 pb-1">
        <FlowTimeline
          tracks={orderedTracks}
          mode={mode}
          transitionWindow={transitionWindow}
          globalTime={audio.globalTime}
          currentTrackIndex={audio.currentTrackIndex}
          isPlaying={audio.isPlaying}
          totalDuration={totalDuration}
          onSeek={audio.seekToGlobal}
        />
      </div>

      {/* ── Transport ───────────────────────────────────────────── */}
      <div className="border-b border-border">
        <FlowTransport
          isPlaying={audio.isPlaying}
          loopMode={audio.loopMode}
          currentTrackTitle={orderedTracks[audio.currentTrackIndex]?.title ?? ""}
          currentTime={audio.globalTime}
          totalDuration={totalDuration}
          mode={mode}
          transitionWindow={transitionWindow}
          canSkipPrev={audio.currentTrackIndex > 0}
          canSkipNext={audio.currentTrackIndex < orderedTracks.length - 1}
          onTogglePlayPause={audio.togglePlayPause}
          onSkipPrev={audio.skipPrev}
          onSkipNext={audio.skipNext}
          onReturnToStart={handleReturnToStart}
          onCycleLoopMode={audio.cycleLoopMode}
          onModeChange={handleModeChange}
          onTransitionWindowChange={setTransitionWindow}
        />
      </div>

      {/* ── Mode explainer ──────────────────────────────────────── */}
      {mode === "condensed" && (
        <p className="text-[11px] text-faint">
          Playing the first and last {transitionWindow}s of each track to preview transitions.
        </p>
      )}

      {/* ── Audio error ──────────────────────────────────────────── */}
      {audio.error && (
        <div className="text-xs text-signal bg-signal-muted rounded-md px-3 py-2">
          {audio.error}
        </div>
      )}

      {/* ── Track List ──────────────────────────────────────────── */}
      <div className="py-2">
        <FlowTrackList
          tracks={orderedTracks}
          currentTrackIndex={audio.currentTrackIndex}
          isPlaying={audio.isPlaying}
          currentTime={audio.currentTime}
          onReorder={handleReorder}
          onTrackClick={handleTrackClick}
          onSeekTrack={handleSeekTrack}
          hiddenCount={hiddenCount}
        />
      </div>

      {/* ── Keyboard hints ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-[10px] text-faint pt-2 border-t border-border">
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">Space</kbd> Play/Pause</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">←</kbd><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px] ml-0.5">→</kbd> Skip</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">⌘Z</kbd> Undo</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">Esc</kbd> Close</span>
      </div>
    </div>
  );
}
