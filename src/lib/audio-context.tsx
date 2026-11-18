"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AudioVersionData } from "@/components/ui/audio-player";
import { perf } from "@/lib/perf";
import { FPSMonitor } from "@/lib/fps-monitor";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AudioTrackMeta = {
  trackId: string;
  releaseId: string;
  trackTitle: string;
  releaseTitle: string;
  coverArtUrl: string | null;
};

type AudioContextValue = {
  /** The persistent HTMLAudioElement — lives for the entire session */
  audioElement: HTMLAudioElement;
  /** Currently loaded version, or null if nothing is playing */
  activeVersion: AudioVersionData | null;
  /** Metadata about the track (for mini player display + navigation) */
  trackMeta: AudioTrackMeta | null;
  /** Playback state */
  isPlaying: boolean;
  /** Whether playback loops back to the start on track end */
  isLooping: boolean;
  /** True when the user has requested playback but the element is
   *  still buffering enough lossless audio to start. Drives the
   *  "Streaming lossless" indicator on the player. */
  isBuffering: boolean;
  /** Load an audio version into the shared element */
  loadVersion: (version: AudioVersionData, meta: AudioTrackMeta) => void;
  /** Play/pause toggle */
  togglePlayPause: () => void;
  /** Seek to a specific second */
  seekTo: (time: number) => void;
  /** Stop playback and clear state (hides mini player) */
  stop: () => void;
  /** Toggle loop on/off */
  toggleLoop: () => void;
  /** Event-driven playhead/duration snapshots; read via the hooks below */
  timeStore: MediaTimeStore;
};

/* ------------------------------------------------------------------ */
/*  Media time store                                                   */
/* ------------------------------------------------------------------ */

// useSyncExternalStore requires getSnapshot to return the same value until
// the store notifies. `el.currentTime` does not satisfy that on WebKit
// (Safari, and every browser on iOS): during playback it is extrapolated
// from the wall clock, so two reads in the same task differ. Reading it
// directly as the snapshot sends React into an endless re-render that ends
// in "Maximum update depth exceeded" the moment playback starts. The store
// below caches the values and only refreshes them from media events.
type MediaTimeStore = {
  getTime: () => number;
  getDuration: () => number;
  subscribe: (listener: () => void) => () => void;
  sync: (el: HTMLAudioElement) => void;
};

function createMediaTimeStore(): MediaTimeStore {
  let time = 0;
  let duration = 0;
  const listeners = new Set<() => void>();
  return {
    getTime: () => time,
    getDuration: () => duration,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    sync(el) {
      const nextTime = el.currentTime;
      const nextDuration = Number.isFinite(el.duration) ? el.duration : 0;
      if (nextTime === time && nextDuration === duration) return;
      time = nextTime;
      duration = nextDuration;
      listeners.forEach((listener) => listener());
    },
  };
}

const TIME_SYNC_EVENTS = [
  "timeupdate",
  "seeking",
  "seeked",
  "pause",
  "ended",
  "durationchange",
  "loadedmetadata",
  "emptied",
] as const;

/* ------------------------------------------------------------------ */
/*  Note: currentTime and duration are NOT in the context value above. */
/*                                                                     */
/*  The previous design fed `currentTime` from the audio element's    */
/*  `timeupdate` event (~4×/sec) into React state in the context. That */
/*  forced every `useAudio()` consumer to re-render that often — six   */
/*  components in production: audio-player, portal-audio-player,       */
/*  mini-player, portal-mini-player, flow-simulator, shell. None of    */
/*  them except the four players actually need the time, but they all  */
/*  paid the cost.                                                     */
/*                                                                     */
/*  The four players read time via the dedicated hooks below, which    */
/*  use `useSyncExternalStore` to subscribe directly to the audio      */
/*  element. Subscribers get notified on `timeupdate`/`durationchange` */
/*  but other consumers don't re-render at all on those events.        */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AudioContext = createContext<AudioContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AudioProvider({ children }: { children: ReactNode }) {
  // Persistent audio element — created once, never destroyed.
  // crossOrigin is intentionally NOT set: it would force a CORS preflight
  // (OPTIONS) on every signed Supabase URL change, costing ~50–100ms on
  // cold loads. Audio elements can stream cross-origin without CORS;
  // only Web Audio analysis (e.g. MediaElementAudioSourceNode) would
  // require it, and we render waveforms from server-computed peaks.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof window !== "undefined") {
    const el = new Audio();
    el.preload = "auto";
    audioRef.current = el;
  }
  const [timeStore] = useState(createMediaTimeStore);

  const [activeVersion, setActiveVersion] = useState<AudioVersionData | null>(null);
  const [trackMeta, setTrackMeta] = useState<AudioTrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  // True from the moment the user clicks play until audio is actually
  // audible, OR when playback stalls mid-track waiting on more data.
  // Only set after a play intent so we don't flash the indicator
  // during preload that hasn't been requested.
  const [isBuffering, setIsBuffering] = useState(false);
  const playbackIntendedRef = useRef(false);
  // Keep a ref to activeVersion for use in callbacks without stale closures
  const activeVersionRef = useRef(activeVersion);
  activeVersionRef.current = activeVersion;
  // Ref for isLooping to avoid stale closures in event listeners
  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  /* ---- Native audio element event listeners ---- */
  const fpsMonitorRef = useRef<FPSMonitor | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => {
      setIsPlaying(true);
      // Start FPS monitoring during playback (dev only)
      if (perf.enabled && !fpsMonitorRef.current) {
        const monitor = new FPSMonitor();
        fpsMonitorRef.current = monitor;
        monitor.start();
      }
    };
    const onPlaying = () => {
      // Audio is actually playing — buffering is done.
      setIsBuffering(false);
    };
    const onPause = () => {
      setIsPlaying(false);
      // A user pause clears the play intent and any buffering UI.
      playbackIntendedRef.current = false;
      setIsBuffering(false);
      // Stop FPS monitoring and record snapshot
      if (fpsMonitorRef.current) {
        const report = fpsMonitorRef.current.stop();
        perf.addFpsSnapshot("playback", report);
        fpsMonitorRef.current = null;
      }
    };
    const onWaiting = () => {
      // Element is stalled waiting on more data. Only show the
      // buffering indicator if the user actually wanted playback.
      if (playbackIntendedRef.current) setIsBuffering(true);
    };
    const onCanPlay = () => {
      // Enough data is available to start. If the user already
      // wanted playback and the element isn't playing yet, kick it
      // off — this matters for the cold-start path where play() was
      // called before the buffer was ready.
      setIsBuffering(false);
    };
    const onEnded = () => {
      if (isLoopingRef.current) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        setIsPlaying(false);
        playbackIntendedRef.current = false;
        // Stop FPS monitoring on track end
        if (fpsMonitorRef.current) {
          const report = fpsMonitorRef.current.stop();
          perf.addFpsSnapshot("playback", report);
          fpsMonitorRef.current = null;
        }
      }
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("ended", onEnded);
    const syncTime = () => timeStore.sync(el);
    TIME_SYNC_EVENTS.forEach((evt) => el.addEventListener(evt, syncTime));

    return () => {
      TIME_SYNC_EVENTS.forEach((evt) => el.removeEventListener(evt, syncTime));
      el.removeEventListener("play", onPlay);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("ended", onEnded);
      // Cleanup FPS monitor on unmount
      if (fpsMonitorRef.current) {
        fpsMonitorRef.current.stop();
        fpsMonitorRef.current = null;
      }
      // A detached Audio element keeps playing for as long as it has a
      // source. If this provider unmounts (an error boundary above the
      // shell, sign-out), silence it so it can't play on with no controls
      // while a remount creates a second element next to it.
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [timeStore]);

  /* ---- Actions ---- */

  const loadVersion = useCallback(
    (version: AudioVersionData, meta: AudioTrackMeta) => {
      const el = audioRef.current;
      if (!el) return;

      // Always update metadata
      setTrackMeta(meta);

      // If same version is already loaded, nothing else to do
      if (activeVersionRef.current?.id === version.id) {
        return;
      }

      // If the audio element already has this URL loaded (e.g. WaveSurfer set it),
      // just update state without restarting the load
      const currentUrl = el.currentSrc || el.src || "";
      if (currentUrl && currentUrl === version.audio_url) {
        setActiveVersion(version);
        return;
      }

      // New audio — set src and load
      el.src = version.audio_url;
      el.load();
      setActiveVersion(version);
    },
    [],
  );

  const togglePlayPause = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    if (el.paused) {
      // Split warm vs cold so the 100ms playback-start budget only
      // applies when audio is already buffered. A "cold" start is a
      // network-bound wait for lossless WAV bytes — measuring it
      // against the same threshold confused the dashboard with
      // false-alarm violations.
      // readyState >= HAVE_FUTURE_DATA (3) means the element can play
      // without immediately stalling.
      const warm = el.readyState >= 3;
      const metric = warm ? "playback:start:warm" : "playback:start:cold";
      perf.start(metric);
      const onPlaying = () => {
        perf.end(metric);
        el.removeEventListener("playing", onPlaying);
      };
      el.addEventListener("playing", onPlaying);
      playbackIntendedRef.current = true;
      // If we know we're cold, light the buffering indicator now —
      // the `waiting` event may not fire if the element transitions
      // straight from stopped to playing without an intermediate stall.
      if (!warm) setIsBuffering(true);
      el.play().catch(() => {
        // play() rejected (e.g. autoplay policy). Clear intent so the
        // indicator doesn't get stuck on.
        playbackIntendedRef.current = false;
        setIsBuffering(false);
        el.removeEventListener("playing", onPlaying);
      });
    } else {
      el.pause();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const el = audioRef.current;
    if (!el) return;
    // Setting currentTime triggers `seeking`/`seeked` on the element,
    // which refresh the time store the hooks below read from.
    el.currentTime = time;
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("src");
    el.load();
    playbackIntendedRef.current = false;
    setActiveVersion(null);
    setTrackMeta(null);
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  // Memoize the context value to prevent unnecessary consumer re-renders.
  // currentTime/duration are deliberately NOT here — they're read via
  // useAudioCurrentTime / useAudioDuration so only consumers that
  // actually need the time pay the re-render cost on `timeupdate`.
  const contextValue = useMemo(
    () => ({
      audioElement: audioRef.current!,
      activeVersion,
      trackMeta,
      isPlaying,
      isLooping,
      isBuffering,
      loadVersion,
      togglePlayPause,
      seekTo,
      stop,
      toggleLoop,
      timeStore,
    }),
    [activeVersion, trackMeta, isPlaying, isLooping, isBuffering, loadVersion, togglePlayPause, seekTo, stop, toggleLoop, timeStore],
  );

  // SSR guard — render nothing useful on server
  if (!audioRef.current) {
    return <>{children}</>;
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const SSR_FALLBACK: AudioContextValue = {
  audioElement: null as unknown as HTMLAudioElement,
  activeVersion: null,
  trackMeta: null,
  isPlaying: false,
  isLooping: false,
  isBuffering: false,
  loadVersion: () => {},
  togglePlayPause: () => {},
  seekTo: () => {},
  stop: () => {},
  toggleLoop: () => {},
  timeStore: {
    getTime: () => 0,
    getDuration: () => 0,
    subscribe: () => () => {},
    sync: () => {},
  },
};

export function useAudio() {
  const ctx = useContext(AudioContext);
  // During SSR the provider hasn't mounted yet — return a safe no-op fallback.
  if (!ctx) return SSR_FALLBACK;
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Time subscription hooks                                            */
/* ------------------------------------------------------------------ */

/**
 * Resume playback on an element whose source was just swapped.
 *
 * play() is issued immediately because iOS ignores `preload` and only starts
 * fetching once playback is requested, so waiting for `canplay` first can
 * wait forever there. The one-shot `canplay` retry stays for engines that
 * drop a play() issued before the new source has data.
 */
export function playWhenReady(
  el: HTMLAudioElement,
  isCancelled: () => boolean = () => false,
) {
  const attempt = () => {
    if (isCancelled() || !el.paused) return;
    el.play().catch(() => {});
  };
  attempt();
  if (el.readyState >= 3 /* HAVE_FUTURE_DATA */) return;
  const onCanPlay = () => {
    el.removeEventListener("canplay", onCanPlay);
    attempt();
  };
  el.addEventListener("canplay", onCanPlay);
}

const getZero = () => 0;
const subscribeNoop = () => () => {};

/**
 * Playhead position in seconds. Re-renders the calling component on
 * `timeupdate` (~4x/sec during playback) and on seeks. Only components
 * that actually need the playhead should call this.
 */
export function useAudioCurrentTime(): number {
  const store = useContext(AudioContext)?.timeStore;
  return useSyncExternalStore(
    store?.subscribe ?? subscribeNoop,
    store?.getTime ?? getZero,
    getZero,
  );
}

/**
 * Duration of the loaded audio in seconds (0 until metadata arrives).
 * Stable during playback, so components that only need duration don't
 * re-render on `timeupdate`.
 */
export function useAudioDuration(): number {
  const store = useContext(AudioContext)?.timeStore;
  return useSyncExternalStore(
    store?.subscribe ?? subscribeNoop,
    store?.getDuration ?? getZero,
    getZero,
  );
}
