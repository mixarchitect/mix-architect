/* ------------------------------------------------------------------ */
/*  Tour progress — localStorage (fast) + DB sync (durable)            */
/* ------------------------------------------------------------------ */

import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

const LS_KEY = "ma-tour";

export type TourProgress = {
  status: "active" | "completed" | "skipped";
  currentPhaseIndex: number;
  currentStepIndex: number;
  completedPhases: string[];
  completedSteps: string[];
  releaseId?: string;
  trackId?: string;
};

/* ── localStorage helpers ────────────────────────────────────────── */

export function readTourProgress(): TourProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TourProgress;
  } catch {
    return null;
  }
}

export function writeTourProgress(progress: TourProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked — non-critical
  }
}

export function clearTourProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

/* ── DB sync (fire-and-forget) ───────────────────────────────────── */

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function syncTourProgressToDB(progress: TourProgress): void {
  // Debounce — only sync 500ms after the last call
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .getUser()
      .then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
        if (!user) return;
        supabase
          .from("user_defaults")
          .update({ tour_progress: progress })
          .eq("user_id", user.id)
          .then(() => {});
      });
  }, 500);
}

/** Mark tour as completed/skipped in both localStorage and DB */
export function finishTour(status: "completed" | "skipped"): void {
  const current = readTourProgress();
  const final: TourProgress = {
    ...(current ?? {
      currentPhaseIndex: 0,
      currentStepIndex: 0,
      completedPhases: [],
      completedSteps: [],
    }),
    status,
  };
  writeTourProgress(final);
  // Sync immediately (no debounce)
  if (syncTimer) clearTimeout(syncTimer);
  const supabase = createSupabaseBrowserClient();
  supabase.auth
    .getUser()
    .then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (!user) return;
      supabase
        .from("user_defaults")
        .update({ tour_progress: final })
        .eq("user_id", user.id)
        .then(() => {});
    });
}
