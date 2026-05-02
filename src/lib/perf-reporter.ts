"use client";

/**
 * Batches perf metrics from the PerfProfiler and sends them
 * to /api/perf/ingest. Always-on in production — collects real
 * user audio performance data for the admin dashboard.
 */

import { perf, type PerfMark, type FPSSnapshot } from "@/lib/perf";

interface QueuedMetric {
  sessionId: string;
  metric: string;
  durationMs: number;
  trackId?: string;
  versionId?: string;
  fileFormat?: string;
  fileSizeMb?: number;
  durationSec?: number;
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  avgFps?: number;
  minFps?: number;
  p5Fps?: number;
  droppedFrames?: number;
  jankFrames?: number;
  deviceType?: string;
}

/** Metrics we care about collecting in production. */
const COLLECTED_METRICS = new Set([
  "wavesurfer:init",
  "waveform:render",
  "waveform:seek",
  "waveform:resize",
  "playback:start:warm",
  "playback:start:cold",
]);

const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const MAX_QUEUE = 50;

class PerfReporter {
  private queue: QueuedMetric[] = [];
  private sessionId: string;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private _started = false;

  // Current audio context — set by the audio player
  private _trackId: string | null = null;
  private _versionId: string | null = null;
  private _fileFormat: string | null = null;
  private _fileSizeMb: number | null = null;
  private _durationSec: number | null = null;
  private _sampleRate: number | null = null;
  private _bitDepth: number | null = null;
  private _channels: number | null = null;

  constructor() {
    this.sessionId = typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }

  /** Call once from a client component to start listening. */
  start(): void {
    if (this._started || typeof window === "undefined") return;
    this._started = true;

    // Subscribe to timing marks
    perf.onMark((mark: PerfMark) => {
      if (!mark.duration || !COLLECTED_METRICS.has(mark.name)) return;
      this.enqueue(this.markToMetric(mark));
    });

    // Subscribe to FPS snapshots
    perf.onFps((snap: FPSSnapshot) => {
      this.enqueue(this.fpsToMetric(snap));
    });

    // Periodic flush
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    // Flush on page unload
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flush();
    });
  }

  /** Set the current audio file context — called when a track loads. */
  setAudioContext(ctx: {
    trackId: string;
    versionId: string;
    fileFormat?: string | null;
    fileSizeMb?: number | null;
    durationSec?: number | null;
    sampleRate?: number | null;
    bitDepth?: number | null;
    channels?: number | null;
  }): void {
    this._trackId = ctx.trackId;
    this._versionId = ctx.versionId;
    this._fileFormat = ctx.fileFormat ?? null;
    this._fileSizeMb = ctx.fileSizeMb ?? null;
    this._durationSec = ctx.durationSec ?? null;
    this._sampleRate = ctx.sampleRate ?? null;
    this._bitDepth = ctx.bitDepth ?? null;
    this._channels = ctx.channels ?? null;
  }

  private getDeviceType(): string {
    if (typeof window === "undefined") return "unknown";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }

  private markToMetric(mark: PerfMark): QueuedMetric {
    const trackId = (mark.metadata?.trackId as string) ?? this._trackId ?? undefined;
    return {
      sessionId: this.sessionId,
      metric: mark.name,
      durationMs: Math.round(mark.duration! * 100) / 100,
      trackId,
      versionId: this._versionId ?? undefined,
      fileFormat: this._fileFormat ?? undefined,
      fileSizeMb: this._fileSizeMb ?? undefined,
      durationSec: this._durationSec ?? undefined,
      sampleRate: this._sampleRate ?? undefined,
      bitDepth: this._bitDepth ?? undefined,
      channels: this._channels ?? undefined,
      deviceType: this.getDeviceType(),
    };
  }

  private fpsToMetric(snap: FPSSnapshot): QueuedMetric {
    return {
      sessionId: this.sessionId,
      metric: `fps:${snap.label}`,
      durationMs: snap.durationSec * 1000,
      trackId: this._trackId ?? undefined,
      versionId: this._versionId ?? undefined,
      fileFormat: this._fileFormat ?? undefined,
      fileSizeMb: this._fileSizeMb ?? undefined,
      durationSec: this._durationSec ?? undefined,
      sampleRate: this._sampleRate ?? undefined,
      bitDepth: this._bitDepth ?? undefined,
      channels: this._channels ?? undefined,
      avgFps: snap.avgFps,
      minFps: snap.minFps,
      p5Fps: snap.p5Fps,
      droppedFrames: snap.droppedFrames,
      jankFrames: snap.jankFrames,
      deviceType: this.getDeviceType(),
    };
  }

  private enqueue(metric: QueuedMetric): void {
    this.queue.push(metric);
    if (this.queue.length >= MAX_QUEUE) this.flush();
  }

  /** Send queued metrics to the server. */
  flush(): void {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, MAX_QUEUE);

    // Use sendBeacon for reliability on page unload, fetch otherwise
    const payload = JSON.stringify({ metrics: batch });

    if (document.visibilityState === "hidden" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/perf/ingest", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/perf/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => {
        // Silently drop — perf data is best-effort
      });
    }
  }
}

export const perfReporter = new PerfReporter();
