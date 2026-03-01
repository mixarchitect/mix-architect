"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { useAudio } from "@/lib/audio-context";
import { useToast } from "@/components/ui/toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { cn } from "@/lib/cn";
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
  const [mode, setMode] = useState<FlowMode>("full");
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
      router.refresh();
      onClose();
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <IconButton onClick={handleClose} title="Close">
            <X size={16} />
          </IconButton>
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">
            Flow Simulator
          </h2>
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
      <div className="px-6 pt-4 pb-2">
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
      <div className="px-6 border-b border-border">
        <FlowTransport
          isPlaying={audio.isPlaying}
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
          onModeChange={handleModeChange}
          onTransitionWindowChange={setTransitionWindow}
        />
      </div>

      {/* ── Track List ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
        <FlowTrackList
          tracks={orderedTracks}
          currentTrackIndex={audio.currentTrackIndex}
          isPlaying={audio.isPlaying}
          onReorder={handleReorder}
          onTrackClick={handleTrackClick}
          hiddenCount={hiddenCount}
        />
      </div>

      {/* ── Keyboard hints ──────────────────────────────────────── */}
      <div className="px-6 py-2 border-t border-border flex items-center gap-4 text-[10px] text-faint">
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">Space</kbd> Play/Pause</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">←</kbd><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px] ml-0.5">→</kbd> Skip</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">⌘Z</kbd> Undo</span>
        <span><kbd className="px-1 py-0.5 rounded border border-border bg-panel text-[10px]">Esc</kbd> Close</span>
      </div>
    </div>
  );
}
