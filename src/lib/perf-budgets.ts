import type { PerfBudget } from "./perf";

/* ------------------------------------------------------------------ */
/*  Performance budgets — mid-tier device baseline                    */
/*  (4-core CPU, 8 GB RAM, integrated GPU)                           */
/*                                                                    */
/*  Tighten after optimizing: set to measured p95 + 20% headroom.    */
/*  Relax only with justification in a comment next to the constant. */
/* ------------------------------------------------------------------ */

export const PERF_BUDGETS = {
  /** WaveSurfer instance creation + plugin init */
  WAVESURFER_INIT: 150,

  /** Web Audio API decodeAudioData — ms per minute of source audio */
  AUDIO_DECODE_PER_MIN: 800,

  /** Decoded audio → visible waveform */
  WAVEFORM_FIRST_PAINT: 200,

  /** Full peaks calculated and drawn (5-min track) */
  WAVEFORM_FULL_RENDER: 500,

  /** Generating peaks array from decoded AudioBuffer */
  PEAK_CALCULATION: 300,

  /** Per-track budget for multi-track release page load */
  MULTI_WAVEFORM_LOAD_PER_TRACK: 600,

  /** Click play → audible output */
  PLAYBACK_START: 100,

  /** Waveform click → visual seek update */
  WAVEFORM_SEEK: 50,

  /** Zoom in/out → waveform redraw */
  WAVEFORM_ZOOM: 100,

  /** Max JS heap per WaveSurfer instance (MB) */
  MEMORY_PER_WAVEFORM_MB: 50,

  /** Max total JS heap for a 12-track release page (MB) */
  MEMORY_TOTAL_AUDIO_MB: 400,

  /** Canvas frame budget — 60 fps target */
  CANVAS_FRAME: 16.67,

  /** Audio player component mount → interactive */
  PLAYER_TTI: 300,
} as const;

export type PerfMetric = keyof typeof PERF_BUDGETS;

/** Convert PERF_BUDGETS to the PerfBudget[] format used by perf.setBudgets(). */
export function toBudgetArray(): PerfBudget[] {
  const metricToMarkName: Record<string, string> = {
    WAVESURFER_INIT: "wavesurfer:init",
    WAVEFORM_FIRST_PAINT: "waveform:first-paint",
    WAVEFORM_FULL_RENDER: "waveform:render",
    PEAK_CALCULATION: "peaks:calculate",
    PLAYBACK_START: "playback:start",
    WAVEFORM_SEEK: "waveform:seek",
    WAVEFORM_ZOOM: "waveform:zoom",
    PLAYER_TTI: "player:tti",
  };

  return Object.entries(metricToMarkName).map(([key, markName]) => ({
    metric: markName,
    budget: PERF_BUDGETS[key as PerfMetric],
    severity: "warn" as const,
  }));
}
