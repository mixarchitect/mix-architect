"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { StatusDot } from "@/components/ui/status-dot";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { cn } from "@/lib/cn";

type TrackItem = {
  id: string;
  track_number: number;
  title: string;
  status: string;
  intentPreview?: string | null;
};

type Props = {
  releaseId: string;
  tracks: TrackItem[];
  canReorder: boolean;
};

function statusColor(s: string): "green" | "orange" | "blue" {
  if (s === "complete") return "green";
  if (s === "in_progress") return "orange";
  return "blue";
}

export function TrackList({ releaseId, tracks: initialTracks, canReorder }: Props) {
  const [localTracks, setLocalTracks] = useState(initialTracks);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const sorted = [...localTracks].sort((a, b) => a.track_number - b.track_number);

  async function handleMove(trackId: string, direction: -1 | 1) {
    const idx = sorted.findIndex((t) => t.id === trackId);
    const neighborIdx = idx + direction;
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return;

    const current = sorted[idx];
    const neighbor = sorted[neighborIdx];
    const prevTracks = [...localTracks];

    // Optimistic swap of track_number values
    setLocalTracks((prev) =>
      prev.map((t) => {
        if (t.id === current.id) return { ...t, track_number: neighbor.track_number };
        if (t.id === neighbor.id) return { ...t, track_number: current.track_number };
        return t;
      }),
    );

    try {
      const [r1, r2] = await Promise.all([
        supabase.from("tracks").update({ track_number: neighbor.track_number }).eq("id", current.id),
        supabase.from("tracks").update({ track_number: current.track_number }).eq("id", neighbor.id),
      ]);
      if (r1.error || r2.error) throw new Error("Reorder failed");
    } catch {
      setLocalTracks(prevTracks);
    }
  }

  return (
    <div className="space-y-2">
      {sorted.map((t, idx) => (
        <div key={t.id} className="flex items-center gap-1">
          {canReorder && (
            <div className="flex flex-col shrink-0">
              <button
                type="button"
                onClick={() => handleMove(t.id, -1)}
                disabled={idx === 0}
                className={cn(
                  "p-0.5 rounded transition-colors",
                  idx === 0 ? "text-transparent cursor-default" : "text-faint hover:text-text",
                )}
                title="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(t.id, 1)}
                disabled={idx === sorted.length - 1}
                className={cn(
                  "p-0.5 rounded transition-colors",
                  idx === sorted.length - 1 ? "text-transparent cursor-default" : "text-faint hover:text-text",
                )}
                title="Move down"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}
          <Link
            href={`/app/releases/${releaseId}/tracks/${t.id}`}
            className="group flex-1 flex items-center gap-4 px-5 py-4 rounded-md border border-border bg-panel hover:border-border-strong hover:shadow-sm transition-all duration-150"
          >
            <span className="w-8 text-right font-mono text-sm font-medium text-faint shrink-0">
              {String(t.track_number).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text text-sm group-hover:text-signal transition-colors truncate">
                {t.title}
              </div>
              <div className="mt-0.5 text-xs text-muted truncate">
                {t.intentPreview
                  ? t.intentPreview.length > 60
                    ? t.intentPreview.slice(0, 60) + "\u2026"
                    : t.intentPreview
                  : "No intent defined"}
              </div>
            </div>
            <StatusDot color={statusColor(t.status)} />
          </Link>
        </div>
      ))}
    </div>
  );
}
