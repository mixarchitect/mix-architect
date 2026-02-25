"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GripVertical } from "lucide-react";
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const sorted = [...localTracks].sort((a, b) => a.track_number - b.track_number);

  async function handleDrop(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    const prevTracks = [...localTracks];
    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Reassign track_number sequentially (1-based)
    const updated = reordered.map((t, i) => ({ ...t, track_number: i + 1 }));
    setLocalTracks(updated);
    setDragIdx(null);
    setDragOverIdx(null);

    try {
      const results = await Promise.all(
        updated.map((t) =>
          supabase.from("tracks").update({ track_number: t.track_number }).eq("id", t.id),
        ),
      );
      if (results.some((r) => r.error)) throw new Error("Reorder failed");
    } catch {
      setLocalTracks(prevTracks);
    }
  }

  return (
    <div className="space-y-2">
      {sorted.map((t, idx) => (
        <div
          key={t.id}
          draggable={canReorder}
          onDragStart={canReorder ? () => setDragIdx(idx) : undefined}
          onDragOver={canReorder ? (e) => { e.preventDefault(); setDragOverIdx(idx); } : undefined}
          onDrop={canReorder ? () => { if (dragIdx !== null) handleDrop(dragIdx, idx); } : undefined}
          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
          className={cn(
            "flex items-center gap-2 rounded-md border bg-panel px-5 py-4 transition-all duration-150",
            "border-border hover:border-border-strong hover:shadow-sm",
            dragIdx === idx && "opacity-40",
            dragOverIdx === idx && dragIdx !== idx && "border-signal border-dashed",
          )}
        >
          {canReorder && (
            <GripVertical
              size={14}
              className="text-faint cursor-grab shrink-0 active:cursor-grabbing"
            />
          )}
          <Link
            href={`/app/releases/${releaseId}/tracks/${t.id}`}
            className="group flex-1 flex items-center gap-4 min-w-0"
            draggable={false}
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
