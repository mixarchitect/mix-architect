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

  // Refs for audio element (only using element A for playback now — no crossfade)
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

  const stopRAFLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  /* ---- Play a condensed segment ---- */
  const playSegment = useCallback(
    (segIdx: number) => {
      const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
      const seg = segments[segIdx];
      if (!seg) return;

      segmentIndexRef.current = segIdx;
      const track = tracksRef.current[seg.trackIndex];
      if (!track) return;
      const active = getActive();

      setError(null);

      // Check if same track audio is already loaded (e.g., head → tail of same track)
      const currentSrc = active.src || "";
      const targetFile = track.audioUrl.split("/").pop() || "";
      const isSameTrack = currentSrc.includes(targetFile) && targetFile.length > 0;

      if (isSameTrack) {
        active.currentTime = seg.startTime;
        active.play();
        setState((prev) => ({
          ...prev,
          currentTrackIndex: seg.trackIndex,
          currentTime: seg.startTime,
        }));
      } else {
        active.src = track.audioUrl;
        active.load();
        const handleCanPlay = () => {
          active.currentTime = seg.startTime;
          active.play();
          active.removeEventListener("canplay", handleCanPlay);
        };
        active.addEventListener("canplay", handleCanPlay);
        setState((prev) => ({
          ...prev,
          currentTrackIndex: seg.trackIndex,
          currentTime: seg.startTime,
        }));
      }
    },
    [getActive],
  );

  /* ---- Advance to next track (Full mode) ---- */
  const advanceToNextFull = useCallback(() => {
    const s = stateRef.current;
    const nextIdx = s.currentTrackIndex + 1;
    if (nextIdx >= tracksRef.current.length) {
      setState((prev) => ({ ...prev, isPlaying: false }));
      stopRAFLoop();
      return;
    }

    const active = getActive();
    const nextTrack = tracksRef.current[nextIdx];

    setState((prev) => ({ ...prev, currentTrackIndex: nextIdx, currentTime: 0 }));

    active.src = nextTrack.audioUrl;
    active.load();
    const handleCanPlay = () => {
      active.play();
      active.removeEventListener("canplay", handleCanPlay);
    };
    active.addEventListener("canplay", handleCanPlay);
  }, [getActive, stopRAFLoop]);

  /* ---- Advance to next segment (Condensed mode) ---- */
  const advanceToNextSegment = useCallback(() => {
    const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
    const nextSegIdx = segmentIndexRef.current + 1;
    if (nextSegIdx >= segments.length) {
      // End of all segments
      const active = getActive();
      active.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
      stopRAFLoop();
      return;
    }
    playSegment(nextSegIdx);
  }, [getActive, stopRAFLoop, playSegment]);

  /* ---- RAF update loop ---- */
  const startRAFLoop = useCallback(() => {
    const tick = () => {
      const active = getActive();
      if (!active) return;

      const s = stateRef.current;
      const localTime = active.currentTime;
      const globalTime = computeGlobalTime(s.currentTrackIndex, localTime);

      setState((prev) => ({
        ...prev,
        currentTime: localTime,
        globalTime,
      }));

      // In condensed mode, check if current segment has ended
      if (modeRef.current === "condensed") {
        const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
        const seg = segments[segmentIndexRef.current];
        if (seg && localTime >= seg.startTime + seg.duration - 0.05) {
          advanceToNextSegment();
          return; // Don't schedule another frame; advanceToNextSegment handles it
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [getActive, computeGlobalTime, advanceToNextSegment]);

  /* ---- Handle track ended (Full mode auto-advance) ---- */
  useEffect(() => {
    const a = elementA.current;
    if (!a) return;

    const handleEnded = () => {
      if (modeRef.current === "full") {
        advanceToNextFull();
      }
      // In condensed mode, the RAF loop and timeupdate handle segment transitions
    };

    a.addEventListener("ended", handleEnded);
    return () => a.removeEventListener("ended", handleEnded);
  }, [advanceToNextFull]);

  /* ---- Condensed mode: segment boundary check via timeupdate (fallback) ---- */
  useEffect(() => {
    const a = elementA.current;
    if (!a) return;

    const checkSegmentEnd = () => {
      if (modeRef.current !== "condensed") return;
      const segments = buildCondensedSegments(tracksRef.current, transitionWindowRef.current);
      const seg = segments[segmentIndexRef.current];
      if (!seg) return;

      if (a.currentTime >= seg.startTime + seg.duration) {
        advanceToNextSegment();
      }
    };

    a.addEventListener("timeupdate", checkSegmentEnd);
    return () => a.removeEventListener("timeupdate", checkSegmentEnd);
  }, [advanceToNextSegment]);

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
        active.play();
        setState((prev) => ({ ...prev, isPlaying: true }));
        startRAFLoop();
        return;
      }

      // Load new track
      active.src = track.audioUrl;
      active.load();
      const handleCanPlay = () => {
        active.play();
        active.removeEventListener("canplay", handleCanPlay);
      };
      active.addEventListener("canplay", handleCanPlay);

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTrackIndex: idx,
        currentTime: 0,
      }));
      startRAFLoop();
    },
    [getActive, playSegment, startRAFLoop],
  );

  const pause = useCallback(() => {
    const active = getActive();
    active.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
    stopRAFLoop();
  }, [getActive, stopRAFLoop]);

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

      const active = getActive();
      const track = tracksRef.current[result.trackIndex];
      if (!track) return;

      const wasPlaying = stateRef.current.isPlaying;

      // Update segment index for condensed mode
      if (modeRef.current === "condensed") {
        segmentIndexRef.current = result.segmentIndex;
      }

      const seekPos = result.localTime;
      const currentSrc = active.src || "";
      const targetFile = track.audioUrl.split("/").pop() || "";
      const isSameTrack = currentSrc.includes(targetFile) && targetFile.length > 0;

      if (isSameTrack) {
        active.currentTime = seekPos;
        if (wasPlaying) active.play();
      } else {
        active.src = track.audioUrl;
        active.load();
        const handleCanPlay = () => {
          active.currentTime = seekPos;
          if (wasPlaying) active.play();
          active.removeEventListener("canplay", handleCanPlay);
        };
        active.addEventListener("canplay", handleCanPlay);
      }

      setState((prev) => ({
        ...prev,
        currentTrackIndex: result.trackIndex,
        currentTime: seekPos,
        globalTime,
      }));
    },
    [getActive],
  );

  /** Seek to a specific local time within a specific track */
  const seekToTrackLocal = useCallback(
    (trackIndex: number, localTime: number) => {
      const track = tracksRef.current[trackIndex];
      if (!track) return;

      const active = getActive();
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

      const currentSrc = active.src || "";
      const targetFile = track.audioUrl.split("/").pop() || "";
      const isSameTrack = currentSrc.includes(targetFile) && targetFile.length > 0;

      if (isSameTrack) {
        active.currentTime = localTime;
        if (wasPlaying) active.play();
      } else {
        active.src = track.audioUrl;
        active.load();
        const handleCanPlay = () => {
          active.currentTime = localTime;
          if (wasPlaying) active.play();
          active.removeEventListener("canplay", handleCanPlay);
        };
        active.addEventListener("canplay", handleCanPlay);
      }

      const globalTime = computeGlobalTime(trackIndex, localTime);
      setState((prev) => ({
        ...prev,
        currentTrackIndex: trackIndex,
        currentTime: localTime,
        globalTime,
      }));

      if (wasPlaying) startRAFLoop();
    },
    [getActive, computeGlobalTime, startRAFLoop],
  );

  /** Stop all playback and reset */
  const stop = useCallback(() => {
    const a = elementA.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    segmentIndexRef.current = 0;
    stopRAFLoop();
    setState(INITIAL_STATE);
  }, [stopRAFLoop]);

  const clearError = useCallback(() => setError(null), []);

  return {
    ...state,
    error,
    clearError,
    play,
    pause,
    togglePlayPause,
    skipNext,
    skipPrev,
    seekToGlobal,
    seekToTrackLocal,
    stop,
  };
}
