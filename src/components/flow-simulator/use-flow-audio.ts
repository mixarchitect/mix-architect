"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type FlowTrack = {
  id: string;
  title: string;
  durationSeconds: number;
  audioUrl: string;
  waveformPeaks: number[][] | null;
  versionId: string;
};

export type FlowMode = "full" | "condensed";

export type LoopMode = "off" | "one" | "all";

export type CondensedSegment = {
  trackIndex: number;
  part: "head" | "tail" | "full";
  /** Position to seek to in the audio file */
  startTime: number;
  /** How long this segment plays */
  duration: number;
};

type PlaybackState = {
  isPlaying: boolean;
  currentTrackIndex: number;
  /** Current time within the active track (audio element currentTime) */
  currentTime: number;
  /** Cumulative time across all tracks/segments (for timeline cursor) */
  globalTime: number;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Compute cumulative start offsets for full-mode timeline */
export function computeOffsets(tracks: FlowTrack[]): number[] {
  const offsets: number[] = [];
  let acc = 0;
  for (const t of tracks) {
    offsets.push(acc);
    acc += t.durationSeconds;
  }
  return offsets;
}

/** Compute total duration for full mode */
export function computeTotalDuration(tracks: FlowTrack[]): number {
  return tracks.reduce((sum, t) => sum + t.durationSeconds, 0);
}

/** Build the flat list of segments for condensed mode */
export function buildCondensedSegments(
  tracks: FlowTrack[],
  tw: number,
): CondensedSegment[] {
  const segments: CondensedSegment[] = [];
  for (let i = 0; i < tracks.length; i++) {
    const dur = tracks[i].durationSeconds;
    if (dur <= tw * 2) {
      // Track shorter than head+tail — play in full
      segments.push({ trackIndex: i, part: "full", startTime: 0, duration: dur });
    } else {
      // Head: first tw seconds
      segments.push({ trackIndex: i, part: "head", startTime: 0, duration: tw });
      // Tail: last tw seconds
      segments.push({ trackIndex: i, part: "tail", startTime: dur - tw, duration: tw });
    }
  }
  return segments;
}

/** Compute condensed-mode segment offsets and total duration */
export function computeCondensedLayout(
  tracks: FlowTrack[],
  transitionWindow: number,
) {
  const segments = buildCondensedSegments(tracks, transitionWindow);
  const offsets: number[] = [];
  let acc = 0;
  for (const seg of segments) {
    offsets.push(acc);
    acc += seg.duration;
  }
  return { segments, offsets, total: acc };
}

/** Given a globalTime, find which track/segment and local offset */
export function globalTimeToTrack(
  globalTime: number,
  tracks: FlowTrack[],
  mode: FlowMode,
  transitionWindow: number,
): { trackIndex: number; localTime: number; segmentIndex: number } {
  if (tracks.length === 0) return { trackIndex: 0, localTime: 0, segmentIndex: 0 };

  if (mode === "full") {
    const offsets = computeOffsets(tracks);
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (globalTime >= offsets[i]) {
        return { trackIndex: i, localTime: globalTime - offsets[i], segmentIndex: i };
      }
    }
    return { trackIndex: 0, localTime: 0, segmentIndex: 0 };
  }

  // Condensed: map through segments
  const { segments, offsets } = computeCondensedLayout(tracks, transitionWindow);
  for (let i = segments.length - 1; i >= 0; i--) {
    if (globalTime >= offsets[i]) {
      const seg = segments[i];
      const elapsed = globalTime - offsets[i];
      return {
        trackIndex: seg.trackIndex,
        localTime: seg.startTime + elapsed,
        segmentIndex: i,
      };
    }
  }
  return { trackIndex: 0, localTime: 0, segmentIndex: 0 };
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_STATE: PlaybackState = {
  isPlaying: false,
  currentTrackIndex: 0,
  currentTime: 0,
  globalTime: 0,
};

export function useFlowAudio(
  tracks: FlowTrack[],
  mode: FlowMode,
  transitionWindow: number,
) {
  const [state, setState] = useState<PlaybackState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [loopMode, setLoopMode] = useState<LoopMode>("off");
  const loopModeRef = useRef(loopMode);
  loopModeRef.current = loopMode;

  // Refs for audio element (single element — no crossfade)
  const elementA = useRef<HTMLAudioElement | null>(null);

  // State refs for use in callbacks
  const tracksRef = useRef(tracks);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const transitionWindowRef = useRef(transitionWindow);
  transitionWindowRef.current = transitionWindow;
  const stateRef = useRef(state);
  stateRef.current = state;

  // RAF loop ref
  const rafRef = useRef<number>(0);
  // Current condensed segment index
  const segmentIndexRef = useRef(0);
  // Track the currently loaded audio URL to avoid fragile URL comparison
  const loadedUrlRef = useRef<string>("");
  // Guard: true while a segment advance is in progress (prevents double-advance)
  const isAdvancingRef = useRef(false);

  // When tracks array changes (reorder), remap currentTrackIndex by ID
  useEffect(() => {
    const prevTracks = tracksRef.current;
    tracksRef.current = tracks;

    if (prevTracks !== tracks && stateRef.current.isPlaying) {
      const currentId = prevTracks[stateRef.current.currentTrackIndex]?.id;
      if (currentId) {
        const newIdx = tracks.findIndex((t) => t.id === currentId);
        if (newIdx !== -1 && newIdx !== stateRef.current.currentTrackIndex) {
          setState((prev) => ({ ...prev, currentTrackIndex: newIdx }));
        }
      }
    }
  }, [tracks]);

  /* ---- Initialize audio element ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const a = new Audio();
    a.crossOrigin = "anonymous";
    a.preload = "auto";
    elementA.current = a;

    const handleError = () =>
      setError("Playback failed. The audio file may be unavailable.");
    a.addEventListener("error", handleError);

    return () => {
      a.removeEventListener("error", handleError);
      a.pause();
      a.removeAttribute("src");
      a.load();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ---- Helpers ---- */

  const getActive = useCallback(() => elementA.current!, []);

  /** Compute global time from current segment/track + localTime */
  const computeGlobalTime = useCallback(
    (trackIdx: number, localTime: number): number => {
      const t = tracksRef.current;
      if (modeRef.current === "full") {
        const offsets = computeOffsets(t);
        return (offsets[trackIdx] ?? 0) + localTime;
      }
      // Condensed: use segment offset
      const { segments, offsets } = computeCondensedLayout(t, transitionWindowRef.current);
      const segIdx = segmentIndexRef.current;
      const seg = segments[segIdx];
      if (!seg) return 0;
      const elapsed = localTime - seg.startTime;
      return (offsets[segIdx] ?? 0) + Math.max(0, elapsed);
    },
    [],
  );

  /** Load a track into the audio element and seek to a position, then optionally play */
  const loadAndSeek = useCallback(
    (
      audioUrl: string,
      seekTo: number,
      shouldPlay: boolean,
    ) => {
      const active = getActive();
      const isSame = loadedUrlRef.current === audioUrl;

      if (isSame) {
        // Same file — just seek
        active.currentTime = seekTo;
        if (shouldPlay) active.play().catch(() => {});
      } else {
        // Different file — load first, then seek in canplay
        loadedUrlRef.current = audioUrl;
        const handleCanPlay = () => {
          active.removeEventListener("canplay", handleCanPlay);
          active.currentTime = seekTo;
          if (shouldPlay) active.play().catch(() => {});
        };
        // Add listener BEFORE setting src to avoid missing a synchronous canplay
        active.addEventListener("canplay", handleCanPlay);
        active.src = audioUrl;
        active.load();
      }
    },
    [getActive],
  );

  /* ---- Play a condensed segment ---- */
  const playSegment = useCallback(
    (segIdx: number) => {
      const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
      const seg = segments[segIdx];
      if (!seg) return;

      segmentIndexRef.current = segIdx;
      const track = tracksRef.current[seg.trackIndex];
      if (!track) return;

      setError(null);
      loadAndSeek(track.audioUrl, seg.startTime, true);

      setState((prev) => ({
        ...prev,
        currentTrackIndex: seg.trackIndex,
        currentTime: seg.startTime,
      }));
    },
    [loadAndSeek],
  );

  /* ---- Advance to next track (Full mode) ---- */
  const advanceToNextFull = useCallback(() => {
    const s = stateRef.current;
    const lm = loopModeRef.current;

    // Loop One: repeat the current track
    if (lm === "one") {
      const currentTrack = tracksRef.current[s.currentTrackIndex];
      if (currentTrack) {
        loadAndSeek(currentTrack.audioUrl, 0, true);
        setState((prev) => ({ ...prev, currentTime: 0 }));
      }
      return;
    }

    const nextIdx = s.currentTrackIndex + 1;
    if (nextIdx >= tracksRef.current.length) {
      if (lm === "all") {
        // Loop All: restart from track 0
        const firstTrack = tracksRef.current[0];
        if (firstTrack) {
          setState({ isPlaying: true, currentTrackIndex: 0, currentTime: 0, globalTime: 0 });
          loadAndSeek(firstTrack.audioUrl, 0, true);
        }
      } else {
        // Off: reset to start and stop
        cancelAnimationFrame(rafRef.current);
        setState({ isPlaying: false, currentTrackIndex: 0, currentTime: 0, globalTime: 0 });
        segmentIndexRef.current = 0;
      }
      return;
    }

    const nextTrack = tracksRef.current[nextIdx];
    setState((prev) => ({ ...prev, currentTrackIndex: nextIdx, currentTime: 0 }));
    loadAndSeek(nextTrack.audioUrl, 0, true);
  }, [loadAndSeek]);

  /* ---- RAF update loop ---- */
  const startRAFLoop = useCallback(() => {
    const tick = () => {
      const active = getActive();
      if (!active) return;

      const localTime = active.currentTime;
      const s = stateRef.current;
      const globalTime = computeGlobalTime(s.currentTrackIndex, localTime);

      setState((prev) => ({
        ...prev,
        currentTime: localTime,
        globalTime,
      }));

      // In condensed mode, check if current segment has ended
      if (modeRef.current === "condensed" && !isAdvancingRef.current) {
        const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
        const segIdx = segmentIndexRef.current;
        const seg = segments[segIdx];

        if (seg && localTime >= seg.startTime + seg.duration - 0.05) {
          isAdvancingRef.current = true;
          const lm = loopModeRef.current;
          const nextSegIdx = segIdx + 1;
          const nextSeg = segments[nextSegIdx];

          // Check if the next segment belongs to a different track (or doesn't exist)
          const isLastSegForTrack = !nextSeg || nextSeg.trackIndex !== seg.trackIndex;

          // Loop One: when last segment for this track ends, restart from first segment of same track
          if (lm === "one" && isLastSegForTrack) {
            const currentTrackIdx = seg.trackIndex;
            const firstSegForTrack = segments.findIndex((s) => s.trackIndex === currentTrackIdx);
            if (firstSegForTrack >= 0) {
              playSegment(firstSegForTrack);
              const { offsets } = computeCondensedLayout(tracksRef.current, transitionWindowRef.current);
              setState((prev) => ({ ...prev, isPlaying: true, globalTime: offsets[firstSegForTrack] ?? 0 }));
            }
            isAdvancingRef.current = false;
          } else if (nextSegIdx >= segments.length) {
            // Last segment overall ended
            if (lm === "all") {
              // Loop All: restart from first segment
              playSegment(0);
              setState((prev) => ({ ...prev, isPlaying: true, globalTime: 0 }));
            } else {
              // Off: reset to start and stop
              active.pause();
              setState({ isPlaying: false, currentTrackIndex: 0, currentTime: 0, globalTime: 0 });
              segmentIndexRef.current = 0;
            }
            isAdvancingRef.current = false;
            if (lm !== "all") return; // Don't schedule next frame when not looping
          } else {
            // Advance to next segment
            playSegment(nextSegIdx);
            isAdvancingRef.current = false;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [getActive, computeGlobalTime, playSegment]);

  /* ---- Handle track ended (Full mode auto-advance) ---- */
  useEffect(() => {
    const a = elementA.current;
    if (!a) return;

    const handleEnded = () => {
      if (modeRef.current === "full") {
        advanceToNextFull();
      }
      // In condensed mode, the RAF loop handles segment transitions
    };

    a.addEventListener("ended", handleEnded);
    return () => a.removeEventListener("ended", handleEnded);
  }, [advanceToNextFull]);

  /* ---- Public actions ---- */

  const play = useCallback(
    (trackIndex?: number) => {
      const idx = trackIndex ?? stateRef.current.currentTrackIndex;
      const track = tracksRef.current[idx];
      if (!track) return;

      setError(null);
      const active = getActive();

      if (modeRef.current === "condensed") {
        // Find the first segment for this track
        const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
        const segIdx = segments.findIndex((s) => s.trackIndex === idx);
        if (segIdx >= 0) {
          playSegment(segIdx);
          setState((prev) => ({ ...prev, isPlaying: true }));
          startRAFLoop();
          return;
        }
      }

      // Full mode (or condensed fallback)
      // If resuming same track
      if (idx === stateRef.current.currentTrackIndex && active.src && !active.ended) {
        active.play().catch(() => {});
        setState((prev) => ({ ...prev, isPlaying: true }));
        startRAFLoop();
        return;
      }

      // Load new track
      loadAndSeek(track.audioUrl, 0, true);

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTrackIndex: idx,
        currentTime: 0,
      }));
      startRAFLoop();
    },
    [getActive, playSegment, startRAFLoop, loadAndSeek],
  );

  const pause = useCallback(() => {
    const active = getActive();
    active.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
    cancelAnimationFrame(rafRef.current);
  }, [getActive]);

  const togglePlayPause = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  const skipNext = useCallback(() => {
    const nextIdx = stateRef.current.currentTrackIndex + 1;
    if (nextIdx >= tracksRef.current.length) return;

    const active = getActive();
    active.pause();

    setState((prev) => ({
      ...prev,
      currentTrackIndex: nextIdx,
      currentTime: 0,
    }));

    if (stateRef.current.isPlaying) {
      play(nextIdx);
    }
  }, [getActive, play]);

  const skipPrev = useCallback(() => {
    const prevIdx = Math.max(0, stateRef.current.currentTrackIndex - 1);

    const active = getActive();
    active.pause();

    setState((prev) => ({
      ...prev,
      currentTrackIndex: prevIdx,
      currentTime: 0,
    }));

    if (stateRef.current.isPlaying) {
      play(prevIdx);
    }
  }, [getActive, play]);

  const seekToGlobal = useCallback(
    (globalTime: number) => {
      const result = globalTimeToTrack(
        globalTime,
        tracksRef.current,
        modeRef.current,
        transitionWindowRef.current,
      );

      const track = tracksRef.current[result.trackIndex];
      if (!track) return;

      const wasPlaying = stateRef.current.isPlaying;

      // Update segment index for condensed mode
      if (modeRef.current === "condensed") {
        segmentIndexRef.current = result.segmentIndex;
      }

      loadAndSeek(track.audioUrl, result.localTime, wasPlaying);

      setState((prev) => ({
        ...prev,
        currentTrackIndex: result.trackIndex,
        currentTime: result.localTime,
        globalTime,
      }));
    },
    [loadAndSeek],
  );

  /** Seek to a specific local time within a specific track */
  const seekToTrackLocal = useCallback(
    (trackIndex: number, localTime: number) => {
      const track = tracksRef.current[trackIndex];
      if (!track) return;

      const wasPlaying = stateRef.current.isPlaying;

      // For condensed mode, find the matching segment
      if (modeRef.current === "condensed") {
        const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
        const matchIdx = segments.findIndex(
          (s) =>
            s.trackIndex === trackIndex &&
            localTime >= s.startTime &&
            localTime < s.startTime + s.duration,
        );
        if (matchIdx >= 0) {
          segmentIndexRef.current = matchIdx;
        } else {
          // Outside any segment — find closest segment for this track
          const firstSeg = segments.findIndex((s) => s.trackIndex === trackIndex);
          if (firstSeg >= 0) segmentIndexRef.current = firstSeg;
        }
      }

      loadAndSeek(track.audioUrl, localTime, wasPlaying);

      const globalTime = computeGlobalTime(trackIndex, localTime);
      setState((prev) => ({
        ...prev,
        currentTrackIndex: trackIndex,
        currentTime: localTime,
        globalTime,
      }));

      if (wasPlaying) startRAFLoop();
    },
    [loadAndSeek, computeGlobalTime, startRAFLoop],
  );

  /** Stop all playback and reset */
  const stop = useCallback(() => {
    const a = elementA.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    loadedUrlRef.current = "";
    segmentIndexRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    setState(INITIAL_STATE);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const cycleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === "off") return "one";
      if (prev === "one") return "all";
      return "off";
    });
  }, []);

  return {
    ...state,
    error,
    loopMode,
    clearError,
    play,
    pause,
    togglePlayPause,
    skipNext,
    skipPrev,
    seekToGlobal,
    seekToTrackLocal,
    stop,
    cycleLoopMode,
  };
}
