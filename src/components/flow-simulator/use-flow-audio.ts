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

type PlaybackState = {
  isPlaying: boolean;
  currentTrackIndex: number;
  /** Current time within the active track (seconds) */
  currentTime: number;
  /** Cumulative time across all tracks (for timeline cursor) */
  globalTime: number;
  /** Whether a crossfade is in progress */
  crossfading: boolean;
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

/** Compute condensed-mode offsets and total duration */
export function computeCondensedLayout(
  tracks: FlowTrack[],
  transitionWindow: number,
) {
  if (tracks.length === 0) return { offsets: [], total: 0 };

  const crossfadeDuration = Math.min(3, transitionWindow * 0.2);
  const offsets: number[] = [];
  let acc = 0;

  for (let i = 0; i < tracks.length; i++) {
    offsets.push(acc);
    const dur = tracks[i].durationSeconds;
    if (i === 0) {
      // First track: play the last transitionWindow seconds
      acc += Math.min(dur, transitionWindow);
    } else if (i === tracks.length - 1) {
      // Last track: play the first transitionWindow seconds
      acc += Math.min(dur, transitionWindow);
    } else {
      // Middle tracks: tail (transitionWindow) + head (transitionWindow) - crossfade overlap
      const playable = Math.min(dur, transitionWindow * 2);
      acc += playable - crossfadeDuration;
    }
  }

  // Subtract crossfade overlaps between tracks (N-1 transitions)
  // Actually the overlap is already accounted in the middle tracks formula
  // For first→second and secondToLast→last, subtract crossfade
  if (tracks.length >= 2) {
    acc -= crossfadeDuration * (tracks.length > 2 ? 0 : 0);
    // Simpler: each transition overlaps by crossfadeDuration
    // There are (N-1) transitions total
    // But we've only subtracted for middle tracks. First and last tracks don't subtract.
    // So subtract for first→second and lastMinus1→last transitions
    // Actually let me simplify:
  }

  return { offsets, total: acc };
}

/** Given a globalTime, find which track index and local offset */
export function globalTimeToTrack(
  globalTime: number,
  tracks: FlowTrack[],
  mode: FlowMode,
  transitionWindow: number,
): { trackIndex: number; localTime: number } {
  if (tracks.length === 0) return { trackIndex: 0, localTime: 0 };

  if (mode === "full") {
    const offsets = computeOffsets(tracks);
    for (let i = tracks.length - 1; i >= 0; i--) {
      if (globalTime >= offsets[i]) {
        return { trackIndex: i, localTime: globalTime - offsets[i] };
      }
    }
    return { trackIndex: 0, localTime: 0 };
  }

  // Condensed: each track plays at most transitionWindow from tail + transitionWindow from head
  // For simplicity in Phase 2, we map linearly through condensed offsets
  const { offsets } = computeCondensedLayout(tracks, transitionWindow);
  for (let i = tracks.length - 1; i >= 0; i--) {
    if (globalTime >= offsets[i]) {
      return { trackIndex: i, localTime: globalTime - offsets[i] };
    }
  }
  return { trackIndex: 0, localTime: 0 };
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_STATE: PlaybackState = {
  isPlaying: false,
  currentTrackIndex: 0,
  currentTime: 0,
  globalTime: 0,
  crossfading: false,
};

export function useFlowAudio(
  tracks: FlowTrack[],
  mode: FlowMode,
  transitionWindow: number,
) {
  const [state, setState] = useState<PlaybackState>(INITIAL_STATE);

  // Refs for audio elements
  const elementA = useRef<HTMLAudioElement | null>(null);
  const elementB = useRef<HTMLAudioElement | null>(null);

  // Web Audio API refs (for crossfade)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceARef = useRef<MediaElementAudioSourceNode | null>(null);
  const sourceBRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);

  // Track which element is "primary" (A or B toggle)
  const primaryRef = useRef<"A" | "B">("A");

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
  // Whether crossfade has been initiated for current track
  const crossfadeInitiatedRef = useRef(false);

  // When tracks array changes (reorder), remap currentTrackIndex to follow the same track by ID
  useEffect(() => {
    const prevTracks = tracksRef.current;
    tracksRef.current = tracks;

    // If the tracks array identity changed and we have a current track, remap
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

  /* ---- Initialize audio elements ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const a = new Audio();
    a.crossOrigin = "anonymous";
    a.preload = "auto";
    elementA.current = a;

    const b = new Audio();
    b.crossOrigin = "anonymous";
    b.preload = "auto";
    elementB.current = b;

    return () => {
      a.pause();
      a.removeAttribute("src");
      a.load();
      b.pause();
      b.removeAttribute("src");
      b.load();

      if (audioCtxRef.current?.state !== "closed") {
        audioCtxRef.current?.close();
      }
      audioCtxRef.current = null;
      sourceARef.current = null;
      sourceBRef.current = null;
      gainARef.current = null;
      gainBRef.current = null;

      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /** Initialize Web Audio graph (lazy, on first crossfade need) */
  const initWebAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const a = elementA.current;
    const b = elementB.current;
    if (!a || !b) return;

    const ctx = new window.AudioContext();
    audioCtxRef.current = ctx;

    const srcA = ctx.createMediaElementSource(a);
    const srcB = ctx.createMediaElementSource(b);
    const gA = ctx.createGain();
    const gB = ctx.createGain();

    srcA.connect(gA).connect(ctx.destination);
    srcB.connect(gB).connect(ctx.destination);

    sourceARef.current = srcA;
    sourceBRef.current = srcB;
    gainARef.current = gA;
    gainBRef.current = gB;
  }, []);

  /** Get the currently active and idle audio elements */
  const getElements = useCallback(() => {
    const isPrimA = primaryRef.current === "A";
    return {
      active: isPrimA ? elementA.current! : elementB.current!,
      idle: isPrimA ? elementB.current! : elementA.current!,
      activeGain: isPrimA ? gainARef.current : gainBRef.current,
      idleGain: isPrimA ? gainBRef.current : gainARef.current,
    };
  }, []);

  /* ---- Compute global time from track index + local time ---- */
  const computeGlobalTime = useCallback(
    (trackIdx: number, localTime: number): number => {
      const t = tracksRef.current;
      if (modeRef.current === "full") {
        const offsets = computeOffsets(t);
        return (offsets[trackIdx] ?? 0) + localTime;
      }
      const { offsets } = computeCondensedLayout(t, transitionWindowRef.current);
      return (offsets[trackIdx] ?? 0) + localTime;
    },
    [],
  );

  /* ---- RAF update loop ---- */
  const startRAFLoop = useCallback(() => {
    const tick = () => {
      const { active } = getElements();
      if (!active) return;

      const s = stateRef.current;
      const localTime = active.currentTime;
      const globalTime = computeGlobalTime(s.currentTrackIndex, localTime);

      setState((prev) => ({
        ...prev,
        currentTime: localTime,
        globalTime,
      }));

      // In condensed mode, check if we need to start crossfade
      if (modeRef.current === "condensed" && !crossfadeInitiatedRef.current) {
        const currentTrack = tracksRef.current[s.currentTrackIndex];
        if (currentTrack) {
          const tw = transitionWindowRef.current;
          const crossfadeDuration = Math.min(3, tw * 0.2);
          const remaining = currentTrack.durationSeconds - localTime;

          // Start crossfade when we're crossfadeDuration away from the end of this track's play region
          if (remaining <= crossfadeDuration && s.currentTrackIndex < tracksRef.current.length - 1) {
            crossfadeInitiatedRef.current = true;
            startCrossfade(s.currentTrackIndex);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [getElements, computeGlobalTime]);

  const stopRAFLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  /* ---- Load a track into an element ---- */
  const loadTrack = useCallback(
    (element: HTMLAudioElement, trackIndex: number, startTime?: number) => {
      const track = tracksRef.current[trackIndex];
      if (!track) return;

      element.src = track.audioUrl;
      element.load();

      if (startTime !== undefined) {
        const handleCanPlay = () => {
          element.currentTime = startTime;
          element.removeEventListener("canplay", handleCanPlay);
        };
        element.addEventListener("canplay", handleCanPlay);
      }
    },
    [],
  );

  /* ---- Advance to next track (Full mode) ---- */
  const advanceToNext = useCallback(() => {
    const s = stateRef.current;
    const nextIdx = s.currentTrackIndex + 1;
    if (nextIdx >= tracksRef.current.length) {
      // End of playlist
      setState((prev) => ({ ...prev, isPlaying: false, crossfading: false }));
      stopRAFLoop();
      return;
    }

    const { active } = getElements();
    const nextTrack = tracksRef.current[nextIdx];

    setState((prev) => ({
      ...prev,
      currentTrackIndex: nextIdx,
      currentTime: 0,
    }));

    active.src = nextTrack.audioUrl;
    active.load();

    const handleCanPlay = () => {
      if (modeRef.current === "condensed") {
        const tw = transitionWindowRef.current;
        const startAt = Math.max(0, nextTrack.durationSeconds - tw);
        active.currentTime = startAt;
      }
      active.play();
      active.removeEventListener("canplay", handleCanPlay);
    };
    active.addEventListener("canplay", handleCanPlay);
    crossfadeInitiatedRef.current = false;
  }, [getElements, stopRAFLoop]);

  /* ---- Start crossfade (Condensed mode) ---- */
  const startCrossfade = useCallback(
    (fromTrackIndex: number) => {
      const nextIdx = fromTrackIndex + 1;
      if (nextIdx >= tracksRef.current.length) return;

      initWebAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const { active, idle, activeGain, idleGain } = getElements();
      if (!activeGain || !idleGain) return;

      const nextTrack = tracksRef.current[nextIdx];
      const tw = transitionWindowRef.current;
      const crossfadeDuration = Math.min(3, tw * 0.2);

      // Load next track into idle element
      idle.src = nextTrack.audioUrl;
      idle.load();

      setState((prev) => ({ ...prev, crossfading: true }));

      const handleIdleCanPlay = () => {
        idle.removeEventListener("canplay", handleIdleCanPlay);

        const now = ctx.currentTime;

        // Fade out active
        activeGain.gain.cancelScheduledValues(now);
        activeGain.gain.setValueAtTime(1, now);
        activeGain.gain.linearRampToValueAtTime(0, now + crossfadeDuration);

        // Fade in idle
        idleGain.gain.cancelScheduledValues(now);
        idleGain.gain.setValueAtTime(0, now);
        idleGain.gain.linearRampToValueAtTime(1, now + crossfadeDuration);

        idle.play();

        // After crossfade completes, swap roles
        setTimeout(() => {
          active.pause();
          activeGain.gain.cancelScheduledValues(0);
          activeGain.gain.setValueAtTime(0, ctx.currentTime);

          // Swap primary
          primaryRef.current = primaryRef.current === "A" ? "B" : "A";
          crossfadeInitiatedRef.current = false;

          setState((prev) => ({
            ...prev,
            currentTrackIndex: nextIdx,
            currentTime: idle.currentTime,
            crossfading: false,
          }));
        }, crossfadeDuration * 1000);
      };

      idle.addEventListener("canplay", handleIdleCanPlay);
    },
    [getElements, initWebAudio],
  );

  /* ---- Handle track ended (Full mode auto-advance) ---- */
  useEffect(() => {
    const a = elementA.current;
    const b = elementB.current;
    if (!a || !b) return;

    const handleEndedA = () => {
      if (primaryRef.current === "A" && modeRef.current === "full") {
        advanceToNext();
      }
    };
    const handleEndedB = () => {
      if (primaryRef.current === "B" && modeRef.current === "full") {
        advanceToNext();
      }
    };

    a.addEventListener("ended", handleEndedA);
    b.addEventListener("ended", handleEndedB);
    return () => {
      a.removeEventListener("ended", handleEndedA);
      b.removeEventListener("ended", handleEndedB);
    };
  }, [advanceToNext]);

  /* ---- Condensed mode: stop playback at transitionWindow mark ---- */
  useEffect(() => {
    const a = elementA.current;
    const b = elementB.current;
    if (!a || !b) return;

    const checkCondensedEnd = (el: HTMLAudioElement) => {
      if (modeRef.current !== "condensed") return;
      const s = stateRef.current;
      const track = tracksRef.current[s.currentTrackIndex];
      if (!track) return;

      const tw = transitionWindowRef.current;
      const isFirstTrack = s.currentTrackIndex === 0;
      const isLastTrack = s.currentTrackIndex === tracksRef.current.length - 1;

      // For non-first tracks, stop after transitionWindow from start
      if (!isFirstTrack && el.currentTime >= tw) {
        if (isLastTrack) {
          // Last track: just stop
          el.pause();
          setState((prev) => ({ ...prev, isPlaying: false }));
          stopRAFLoop();
        } else if (!crossfadeInitiatedRef.current) {
          // Middle track: advance without crossfade (crossfade handles itself)
          advanceToNext();
        }
      }
    };

    const onTimeA = () => {
      if (primaryRef.current === "A") checkCondensedEnd(a);
    };
    const onTimeB = () => {
      if (primaryRef.current === "B") checkCondensedEnd(b);
    };

    a.addEventListener("timeupdate", onTimeA);
    b.addEventListener("timeupdate", onTimeB);
    return () => {
      a.removeEventListener("timeupdate", onTimeA);
      b.removeEventListener("timeupdate", onTimeB);
    };
  }, [advanceToNext, stopRAFLoop]);

  /* ---- Public actions ---- */

  const play = useCallback(
    (trackIndex?: number) => {
      const idx = trackIndex ?? stateRef.current.currentTrackIndex;
      const track = tracksRef.current[idx];
      if (!track) return;

      // If condensed mode, initialize Web Audio
      if (modeRef.current === "condensed") {
        initWebAudio();
        const ctx = audioCtxRef.current;
        if (ctx?.state === "suspended") ctx.resume();
        // Reset gains
        if (gainARef.current) {
          gainARef.current.gain.cancelScheduledValues(0);
          gainARef.current.gain.setValueAtTime(primaryRef.current === "A" ? 1 : 0, ctx!.currentTime);
        }
        if (gainBRef.current) {
          gainBRef.current.gain.cancelScheduledValues(0);
          gainBRef.current.gain.setValueAtTime(primaryRef.current === "B" ? 1 : 0, ctx!.currentTime);
        }
      }

      const { active } = getElements();

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
        if (modeRef.current === "condensed" && idx === 0) {
          // First track in condensed: start from tail
          const tw = transitionWindowRef.current;
          const startAt = Math.max(0, track.durationSeconds - tw);
          active.currentTime = startAt;
        }
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
      crossfadeInitiatedRef.current = false;
      startRAFLoop();
    },
    [getElements, initWebAudio, startRAFLoop],
  );

  const pause = useCallback(() => {
    const { active } = getElements();
    active.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
    stopRAFLoop();
  }, [getElements, stopRAFLoop]);

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

    const { active, idle } = getElements();
    active.pause();
    idle.pause();
    primaryRef.current = "A";
    crossfadeInitiatedRef.current = false;

    // Reset gains
    if (gainARef.current && audioCtxRef.current) {
      gainARef.current.gain.cancelScheduledValues(0);
      gainARef.current.gain.setValueAtTime(1, audioCtxRef.current.currentTime);
    }
    if (gainBRef.current && audioCtxRef.current) {
      gainBRef.current.gain.cancelScheduledValues(0);
      gainBRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }

    setState((prev) => ({
      ...prev,
      currentTrackIndex: nextIdx,
      currentTime: 0,
      crossfading: false,
    }));

    if (stateRef.current.isPlaying) {
      play(nextIdx);
    }
  }, [getElements, play]);

  const skipPrev = useCallback(() => {
    const prevIdx = Math.max(0, stateRef.current.currentTrackIndex - 1);

    const { active, idle } = getElements();
    active.pause();
    idle.pause();
    primaryRef.current = "A";
    crossfadeInitiatedRef.current = false;

    // Reset gains
    if (gainARef.current && audioCtxRef.current) {
      gainARef.current.gain.cancelScheduledValues(0);
      gainARef.current.gain.setValueAtTime(1, audioCtxRef.current.currentTime);
    }
    if (gainBRef.current && audioCtxRef.current) {
      gainBRef.current.gain.cancelScheduledValues(0);
      gainBRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }

    setState((prev) => ({
      ...prev,
      currentTrackIndex: prevIdx,
      currentTime: 0,
      crossfading: false,
    }));

    if (stateRef.current.isPlaying) {
      play(prevIdx);
    }
  }, [getElements, play]);

  const seekToGlobal = useCallback(
    (globalTime: number) => {
      const { trackIndex, localTime } = globalTimeToTrack(
        globalTime,
        tracksRef.current,
        modeRef.current,
        transitionWindowRef.current,
      );

      const { active, idle } = getElements();
      idle.pause();
      primaryRef.current = "A";
      crossfadeInitiatedRef.current = false;

      const track = tracksRef.current[trackIndex];
      if (!track) return;

      const wasPlaying = stateRef.current.isPlaying;

      // Determine actual seek position in the audio file
      let seekPos = localTime;
      if (modeRef.current === "condensed" && trackIndex === 0) {
        const tw = transitionWindowRef.current;
        seekPos = Math.max(0, track.durationSeconds - tw) + localTime;
      }

      if (active.src && active.src.includes(track.audioUrl.split("/").pop()!)) {
        // Same track, just seek
        active.currentTime = seekPos;
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
        currentTrackIndex: trackIndex,
        currentTime: seekPos,
        globalTime,
        crossfading: false,
      }));
    },
    [getElements],
  );

  /** Stop all playback and reset */
  const stop = useCallback(() => {
    const a = elementA.current;
    const b = elementB.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    if (b) {
      b.pause();
      b.removeAttribute("src");
      b.load();
    }
    primaryRef.current = "A";
    crossfadeInitiatedRef.current = false;
    stopRAFLoop();
    setState(INITIAL_STATE);
  }, [stopRAFLoop]);

  return {
    ...state,
    play,
    pause,
    togglePlayPause,
    skipNext,
    skipPrev,
    seekToGlobal,
    stop,
  };
}
