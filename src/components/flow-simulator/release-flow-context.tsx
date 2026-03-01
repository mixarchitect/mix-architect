"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { FlowSimulator } from "./flow-simulator";
import type { FlowTrack } from "./use-flow-audio";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type FlowContextType = {
  isFlowOpen: boolean;
  openFlow: () => void;
  closeFlow: () => void;
};

const FlowContext = createContext<FlowContextType>({
  isFlowOpen: false,
  openFlow: () => {},
  closeFlow: () => {},
});

export function useFlowOpen() {
  return useContext(FlowContext);
}

/* ------------------------------------------------------------------ */
/*  Provider — wraps the entire release page                           */
/* ------------------------------------------------------------------ */

export function FlowProvider({ children }: { children: ReactNode }) {
  const [isFlowOpen, setIsFlowOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.hash === "#flow";
  });

  // Sync URL hash when state changes
  useEffect(() => {
    if (isFlowOpen) {
      window.history.replaceState(null, "", "#flow");
    } else {
      // Remove hash without scroll jump
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [isFlowOpen]);

  // Listen for browser back/forward (hash change)
  useEffect(() => {
    const handler = () => {
      setIsFlowOpen(window.location.hash === "#flow");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const openFlow = useCallback(() => setIsFlowOpen(true), []);
  const closeFlow = useCallback(() => setIsFlowOpen(false), []);

  return (
    <FlowContext.Provider value={{ isFlowOpen, openFlow, closeFlow }}>
      {children}
    </FlowContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Content switcher — conditionally renders FlowSimulator or children */
/* ------------------------------------------------------------------ */

type ContentProps = {
  flowTracks: FlowTrack[];
  flowHiddenCount: number;
  releaseId: string;
  releaseTitle: string;
  children: ReactNode;
};

/**
 * Fetch the latest tracks + audio versions from Supabase so the Flow
 * Simulator always reflects the current track order (even after
 * drag-and-drop reorder on the release page).
 */
async function fetchFreshTracks(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  releaseId: string,
): Promise<{ tracks: FlowTrack[]; hiddenCount: number }> {
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, title, track_number")
    .eq("release_id", releaseId)
    .order("track_number");

  if (!tracks || tracks.length === 0) return { tracks: [], hiddenCount: 0 };

  const trackIds = tracks.map((t: { id: string }) => t.id);
  const { data: audioVersions } = await supabase
    .from("track_audio_versions")
    .select("id, track_id, version_number, audio_url, duration_seconds, waveform_peaks")
    .in("track_id", trackIds)
    .order("version_number", { ascending: false });

  if (!audioVersions) return { tracks: [], hiddenCount: tracks.length };

  // Pick the highest version_number per track_id
  const latestByTrack = new Map<string, (typeof audioVersions)[0]>();
  for (const av of audioVersions) {
    if (!latestByTrack.has(av.track_id)) {
      latestByTrack.set(av.track_id, av);
    }
  }

  const freshTracks: FlowTrack[] = [];
  let hiddenCount = 0;
  for (const t of tracks) {
    const av = latestByTrack.get(t.id);
    if (av && av.audio_url && av.duration_seconds) {
      freshTracks.push({
        id: t.id,
        title: t.title,
        durationSeconds: Number(av.duration_seconds),
        audioUrl: av.audio_url,
        waveformPeaks: av.waveform_peaks as number[][] | null,
        versionId: av.id,
      });
    } else {
      hiddenCount++;
    }
  }

  return { tracks: freshTracks, hiddenCount };
}

export function ReleaseFlowContent({
  flowTracks: serverFlowTracks,
  flowHiddenCount: serverHiddenCount,
  releaseId,
  releaseTitle,
  children,
}: ContentProps) {
  const { isFlowOpen, closeFlow } = useFlowOpen();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Live track data — starts null, fetched fresh each time the flow opens.
  const [liveTracks, setLiveTracks] = useState<FlowTrack[] | null>(null);
  const [liveHiddenCount, setLiveHiddenCount] = useState(serverHiddenCount);

  // Fetch fresh track data every time the flow opens so it reflects
  // any drag-and-drop reordering done on the release page.
  useEffect(() => {
    if (!isFlowOpen) {
      // Reset so next open fetches fresh data
      setLiveTracks(null);
      return;
    }

    let cancelled = false;
    fetchFreshTracks(supabase, releaseId).then(({ tracks, hiddenCount }) => {
      if (cancelled) return;
      setLiveTracks(tracks);
      setLiveHiddenCount(hiddenCount);
    });

    return () => {
      cancelled = true;
    };
  }, [isFlowOpen, supabase, releaseId]);

  // Full page reload to pick up the new track order from the server.
  // router.refresh() doesn't reliably bust the RSC cache, so we navigate
  // to the same URL (minus the #flow hash) which guarantees fresh data.
  const handleOrderApplied = useCallback(() => {
    window.location.href =
      window.location.pathname + window.location.search;
  }, []);

  if (isFlowOpen) {
    // Show nothing (or a brief flash) while fetching fresh tracks.
    // The fetch is fast (two small queries) so this is near-instant.
    if (!liveTracks) {
      return null;
    }

    return (
      <FlowSimulator
        tracks={liveTracks}
        hiddenCount={liveHiddenCount}
        releaseId={releaseId}
        releaseTitle={releaseTitle}
        onClose={closeFlow}
        onOrderApplied={handleOrderApplied}
      />
    );
  }

  return <>{children}</>;
}
