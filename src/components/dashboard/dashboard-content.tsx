"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import type { DashboardRelease } from "@/types/release";
import { ViewToggle } from "./view-toggle";
import { TimelineView } from "./timeline-view";
import { SortSelect } from "@/components/ui/sort-select";
import { useToast } from "@/components/ui/toast";
import { getCountdown } from "@/lib/timeline-utils";

/* ------------------------------------------------------------------ */
/*  localStorage keys                                                  */
/* ------------------------------------------------------------------ */

const LS_VIEW_KEY = "mixarchitect:dashboard-view";
const LS_CELEBRATED_KEY = "mixarchitect:celebrated-releases";

type DashboardView = "grid" | "timeline";

function readPersistedView(): DashboardView | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LS_VIEW_KEY);
  if (v === "grid" || v === "timeline") return v;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Celebration toast logic                                            */
/* ------------------------------------------------------------------ */

/** Track which releases we've already celebrated so we only toast once per day. */
function getCelebratedToday(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_CELEBRATED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date: string; ids: string[] };
    const todayStr = new Date().toISOString().slice(0, 10);
    if (parsed.date !== todayStr) return new Set(); // stale — new day
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function markCelebrated(ids: string[]) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const existing = getCelebratedToday();
  for (const id of ids) existing.add(id);
  localStorage.setItem(
    LS_CELEBRATED_KEY,
    JSON.stringify({ date: todayStr, ids: Array.from(existing) }),
  );
}

/* ------------------------------------------------------------------ */
/*  DashboardContent                                                   */
/* ------------------------------------------------------------------ */

interface DashboardContentProps {
  /** Releases in DashboardRelease shape (owned, after filtering) */
  releases: DashboardRelease[];
  /** The existing grid JSX (cards) rendered by the server component */
  gridContent: React.ReactNode;
}

/**
 * Client wrapper that adds the Grid / Timeline view toggle to the
 * existing Dashboard. The grid content is passed in as `gridContent`
 * (server-rendered); the timeline is rendered client-side.
 */
export function DashboardContent({
  releases,
  gridContent,
}: DashboardContentProps) {
  // Always default to grid; timeline is opt-in via toggle or localStorage
  const [view, setView] = useState<DashboardView>("grid");
  const { toast } = useToast();

  // On mount, check localStorage for persisted preference
  useEffect(() => {
    const persisted = readPersistedView();
    if (persisted) setView(persisted);
  }, []);

  // 🎉 Release day celebration toast
  useEffect(() => {
    const celebrated = getCelebratedToday();
    const newCelebrations: string[] = [];

    for (const r of releases) {
      if (!r.target_date || celebrated.has(r.id)) continue;
      const cd = getCountdown(r.target_date);
      if (cd.isToday) {
        newCelebrations.push(r.id);
      }
    }

    if (newCelebrations.length === 0) return;

    // Find the release titles for the toast message
    const celebratingReleases = releases.filter((r) =>
      newCelebrations.includes(r.id),
    );

    // Slight delay so the page renders first
    const timer = setTimeout(() => {
      if (celebratingReleases.length === 1) {
        const r = celebratingReleases[0];
        toast(`🎉 It's release day for "${r.title}"! Congratulations!`, {
          variant: "success",
          duration: 8000,
        });
      } else {
        const titles = celebratingReleases.map((r) => r.title).join(", ");
        toast(`🎉 Release day! ${titles} — Congratulations!`, {
          variant: "success",
          duration: 8000,
        });
      }
      markCelebrated(newCelebrations);
    }, 1500);

    return () => clearTimeout(timer);
  }, [releases, toast]);

  const handleViewChange = useCallback((v: DashboardView) => {
    setView(v);
    localStorage.setItem(LS_VIEW_KEY, v);
  }, []);

  return (
    <div>
      {/* Toggle bar + sort (only shown in grid mode) */}
      <div className="flex items-center justify-between mb-3">
        <ViewToggle view={view} onViewChange={handleViewChange} />
        {view === "grid" && (
          <Suspense>
            <SortSelect />
          </Suspense>
        )}
      </div>

      {/* View content */}
      {view === "grid" ? (
        gridContent
      ) : (
        <TimelineView releases={releases} />
      )}
    </div>
  );
}
