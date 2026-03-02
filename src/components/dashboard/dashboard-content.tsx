"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import type { DashboardRelease } from "@/types/release";
import { ViewToggle } from "./view-toggle";
import { TimelineView } from "./timeline-view";
import { SortSelect } from "@/components/ui/sort-select";

/* ------------------------------------------------------------------ */
/*  localStorage key for persisted view preference                     */
/* ------------------------------------------------------------------ */

const LS_KEY = "mixarchitect:dashboard-view";

type DashboardView = "grid" | "timeline";

function readPersistedView(): DashboardView | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LS_KEY);
  if (v === "grid" || v === "timeline") return v;
  return null;
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
  // Determine default view: timeline if 4+ releases, else grid
  const defaultView: DashboardView = releases.length >= 4 ? "timeline" : "grid";

  const [view, setView] = useState<DashboardView>(defaultView);

  // On mount, check localStorage for persisted preference
  useEffect(() => {
    const persisted = readPersistedView();
    if (persisted) setView(persisted);
  }, []);

  const handleViewChange = useCallback((v: DashboardView) => {
    setView(v);
    localStorage.setItem(LS_KEY, v);
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
