"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
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
  currentTime: number;
  duration: number;
  /** Whether playback loops back to the start on track end */
  isLooping: boolean;
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
};

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AudioContext = createContext<AudioContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AudioProvider({ children }: { children: ReactNode }) {
  // Persistent audio element — created once, never destroyed
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof window !== "undefined") {
    const el = new Audio();
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    audioRef.current = el;
  }

  const [activeVersion, setActiveVersion] = useState<AudioVersionData | null>(null);
  const [trackMeta, setTrackMeta] = useState<AudioTrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
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
    const onPause = () => {
      setIsPlaying(false);
      // Stop FPS monitoring and record snapshot
      if (fpsMonitorRef.current) {
        const report = fpsMonitorRef.current.stop();
        perf.addFpsSnapshot("playback", report);
        fpsMonitorRef.current = null;
      }
    };
    const onEnded = () => {
      if (isLoopingRef.current) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        setIsPlaying(false);
        // Stop FPS monitoring on track end
        if (fpsMonitorRef.current) {
          const report = fpsMonitorRef.current.stop();
          perf.addFpsSnapshot("playback", report);
          fpsMonitorRef.current = null;
        }
      }
    };
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => setDuration(el.duration);
    const onDurationChange = () => {
      if (el.duration && isFinite(el.duration)) setDuration(el.duration);
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("durationchange", onDurationChange);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("durationchange", onDurationChange);
      // Cleanup FPS monitor on unmount
      if (fpsMonitorRef.current) {
        fpsMonitorRef.current.stop();
        fpsMonitorRef.current = null;
      }
    };
  }, []);

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
        setDuration(version.duration_seconds ?? el.duration ?? 0);
        return;
      }

      // New audio — set src and load
      el.src = version.audio_url;
      el.load();
      setActiveVersion(version);
      setCurrentTime(0);
      setDuration(version.duration_seconds ?? 0);
    },
    [],
  );

  const togglePlayPause = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    if (el.paused) {
      perf.start("playback:start");
      const onPlay = () => {
        perf.end("playback:start");
        el.removeEventListener("playing", onPlay);
      };
      el.addEventListener("playing", onPlay);
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = time;
    setCurrentTime(time);
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("src");
    el.load();
    setActiveVersion(null);
    setTrackMeta(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  // Memoize the context value to prevent unnecessary consumer re-renders.
  // Split into two values: stable (rarely changes) and volatile (currentTime).
  // This prevents the entire consumer tree from re-rendering on every timeupdate.
  const contextValue = useMemo(
    () => ({
      audioElement: audioRef.current!,
      activeVersion,
      trackMeta,
      isPlaying,
      currentTime,
      duration,
      isLooping,
      loadVersion,
      togglePlayPause,
      seekTo,
      stop,
      toggleLoop,
    }),
    [activeVersion, trackMeta, isPlaying, currentTime, duration, isLooping, loadVersion, togglePlayPause, seekTo, stop, toggleLoop],
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
  currentTime: 0,
  duration: 0,
  isLooping: false,
  loadVersion: () => {},
  togglePlayPause: () => {},
  seekTo: () => {},
  stop: () => {},
  toggleLoop: () => {},
};

export function useAudio() {
  const ctx = useContext(AudioContext);
  // During SSR the provider hasn't mounted yet — return a safe no-op fallback.
  if (!ctx) return SSR_FALLBACK;
  return ctx;
}
