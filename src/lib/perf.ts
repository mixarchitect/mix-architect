"use client";

/* ------------------------------------------------------------------ */
/*  Lightweight performance profiler — zero overhead in production     */
/* ------------------------------------------------------------------ */

export interface PerfMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerfBudget {
  metric: string;
  budget: number; // milliseconds
  severity: "warn" | "error";
}

interface MemorySnapshot {
  usedJSHeapMB: number;
  totalJSHeapMB: number;
  limitMB: number;
}

export interface BudgetViolation {
  metric: string;
  actual: number;
  budget: number;
  severity: "warn" | "error";
}

export interface AudioFileInfo {
  sampleRate: number | null;
  bitDepth: number | null;
  channels: number | null;
  format: string | null;
  fileName: string | null;
}

export interface FPSSnapshot {
  label: string;
  timestamp: number;
  avgFps: number;
  minFps: number;
  p5Fps: number;
  droppedFrames: number;
  jankFrames: number;
  totalFrames: number;
  durationSec: number;
}

class PerfProfiler {
  private marks = new Map<string, PerfMark>();
  private completed: PerfMark[] = [];
  private budgets: PerfBudget[] = [];
  private _enabled: boolean;
  private listeners: Array<(mark: PerfMark) => void> = [];
  private fpsSnapshots: FPSSnapshot[] = [];
  private fpsListeners: Array<(snap: FPSSnapshot) => void> = [];
  private _audioFileInfo: AudioFileInfo | null = null;
  private audioInfoListeners: Array<(info: AudioFileInfo | null) => void> = [];

  constructor() {
    // Always enabled on the client — metrics are collected in production
    // for the admin performance dashboard. The dev overlay additionally
    // requires ?perf in the URL.
    this._enabled = typeof window !== "undefined";

    // Expose report helpers on window for external access (smoke tests, devtools)
    if (this._enabled && typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__PERF_REPORT__ = () =>
        this.getReport();
      (window as unknown as Record<string, unknown>).__PERF_BUDGETS__ = () =>
        this.checkBudgets();
    }
  }

  get enabled() {
    return this._enabled;
  }

  /** Subscribe to completed marks (used by PerfOverlay). */
  onMark(fn: (mark: PerfMark) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  start(name: string, metadata?: Record<string, unknown>): void {
    if (!this._enabled) return;
    this.marks.set(name, { name, startTime: performance.now(), metadata });
  }

  end(name: string): PerfMark | null {
    if (!this._enabled) return null;
    const mark = this.marks.get(name);
    if (!mark) return null;
    mark.endTime = performance.now();
    mark.duration = mark.endTime - mark.startTime;
    this.marks.delete(name);
    this.completed.push(mark);
    for (const fn of this.listeners) fn(mark);
    return mark;
  }

  /** Wrap a sync or async function with start/end timing. */
  measure<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>,
  ): T {
    if (!this._enabled) return fn();
    this.start(name, metadata);
    try {
      const result = fn();
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((v) => {
            this.end(name);
            return v;
          })
          .catch((err) => {
            this.end(name);
            throw err;
          }) as T;
      }
      this.end(name);
      return result;
    } catch (err) {
      this.end(name);
      throw err;
    }
  }

  setBudgets(budgets: PerfBudget[]): void {
    this.budgets = budgets;
  }

  checkBudgets(): BudgetViolation[] {
    const violations: BudgetViolation[] = [];
    for (const b of this.budgets) {
      const matching = this.completed.filter((m) => m.name === b.metric);
      if (matching.length === 0) continue;
      // Use the worst (max) measurement
      const worst = Math.max(...matching.map((m) => m.duration ?? 0));
      if (worst > b.budget) {
        violations.push({
          metric: b.metric,
          actual: Math.round(worst * 100) / 100,
          budget: b.budget,
          severity: b.severity,
        });
      }
    }
    return violations;
  }

  getReport(): PerfMark[] {
    return [...this.completed].sort(
      (a, b) => (b.duration ?? 0) - (a.duration ?? 0),
    );
  }

  /** Print a console.table() summary of all completed marks. */
  toConsoleTable(): void {
    if (!this._enabled || this.completed.length === 0) return;
    const rows = this.getReport().map((m) => ({
      name: m.name,
      "duration (ms)": m.duration ? Math.round(m.duration * 100) / 100 : "—",
      metadata: m.metadata ? JSON.stringify(m.metadata) : "",
    }));
    // eslint-disable-next-line no-console
    console.table(rows);
  }

  /** Capture a JS heap memory snapshot (Chrome only). */
  captureMemory(label: string): MemorySnapshot | null {
    if (!this._enabled) return null;
    const perf = performance as unknown as Record<string, unknown>;
    if (!("memory" in perf)) return null;
    const mem = perf.memory as {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    const snapshot: MemorySnapshot = {
      usedJSHeapMB: Math.round(mem.usedJSHeapSize / 1024 / 1024),
      totalJSHeapMB: Math.round(mem.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
    };
    this.start(label, snapshot as unknown as unknown as Record<string, unknown>);
    this.end(label);
    return snapshot;
  }

  /** Set info about the currently playing audio file. */
  setAudioFileInfo(info: AudioFileInfo | null): void {
    if (!this._enabled) return;
    this._audioFileInfo = info;
    for (const fn of this.audioInfoListeners) fn(info);
  }

  /** Get current audio file info. */
  getAudioFileInfo(): AudioFileInfo | null {
    return this._audioFileInfo;
  }

  /** Subscribe to audio file info changes. */
  onAudioFileInfo(fn: (info: AudioFileInfo | null) => void): () => void {
    this.audioInfoListeners.push(fn);
    return () => {
      this.audioInfoListeners = this.audioInfoListeners.filter((l) => l !== fn);
    };
  }

  /** Store an FPS report snapshot with a label. */
  addFpsSnapshot(label: string, report: Omit<FPSSnapshot, "label" | "timestamp">): void {
    if (!this._enabled) return;
    const snap: FPSSnapshot = { label, timestamp: Date.now(), ...report };
    this.fpsSnapshots.push(snap);
    for (const fn of this.fpsListeners) fn(snap);
  }

  /** Get all stored FPS snapshots. */
  getFpsSnapshots(): FPSSnapshot[] {
    return [...this.fpsSnapshots];
  }

  /** Subscribe to new FPS snapshots. */
  onFps(fn: (snap: FPSSnapshot) => void): () => void {
    this.fpsListeners.push(fn);
    return () => {
      this.fpsListeners = this.fpsListeners.filter((l) => l !== fn);
    };
  }

  clear(): void {
    this.marks.clear();
    this.completed = [];
    this.fpsSnapshots = [];
  }
}

export const perf = new PerfProfiler();
