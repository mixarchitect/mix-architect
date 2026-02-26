"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { AudioVersionData } from "@/components/ui/audio-player";

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
  /** Load an audio version into the shared element */
  loadVersion: (
    version: AudioVersionData,
    meta: AudioTrackMeta,
    opts?: { seekTime?: number; autoPlay?: boolean },
  ) => void;
  /** Play/pause toggle */
  togglePlayPause: () => void;
  /** Seek to a specific second */
  seekTo: (time: number) => void;
  /** Stop playback and clear state (hides mini player) */
  stop: () => void;
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
    audioRef.current = new Audio();
  }

  const [activeVersion, setActiveVersion] = useState<AudioVersionData | null>(null);
  const [trackMeta, setTrackMeta] = useState<AudioTrackMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Keep a ref to activeVersion for use in callbacks without stale closures
  const activeVersionRef = useRef(activeVersion);
  activeVersionRef.current = activeVersion;

  /* ---- Native audio element event listeners ---- */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
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
    };
  }, []);

  /* ---- Actions ---- */

  const loadVersion = useCallback(
    (
      version: AudioVersionData,
      meta: AudioTrackMeta,
      opts?: { seekTime?: number; autoPlay?: boolean },
    ) => {
      const el = audioRef.current;
      if (!el) return;

      // If same version is already loaded, just update meta (preserves position)
      if (activeVersionRef.current?.id === version.id) {
        setTrackMeta(meta);
        return;
      }

      const { seekTime, autoPlay } = opts ?? {};

      // Attach listener BEFORE setting src to avoid race condition
      if (seekTime != null || autoPlay) {
        const onCanPlay = () => {
          el.removeEventListener("canplay", onCanPlay);
          if (seekTime != null && seekTime > 0 && seekTime <= el.duration) {
            el.currentTime = seekTime;
          }
          if (autoPlay) el.play();
        };
        el.addEventListener("canplay", onCanPlay);
      }

      el.src = version.audio_url;
      el.load();
      setActiveVersion(version);
      setTrackMeta(meta);
      setCurrentTime(seekTime ?? 0);
      setDuration(version.duration_seconds ?? 0);
    },
    [],
  );

  const togglePlayPause = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    if (el.paused) {
      el.play();
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

  // SSR guard — render nothing useful on server
  if (!audioRef.current) {
    return <>{children}</>;
  }

  return (
    <AudioContext.Provider
      value={{
        audioElement: audioRef.current,
        activeVersion,
        trackMeta,
        isPlaying,
        currentTime,
        duration,
        loadVersion,
        togglePlayPause,
        seekTo,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
