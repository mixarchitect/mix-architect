"use client";

import { useState, useCallback, useRef } from "react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Rule } from "@/components/ui/rule";
import { perf } from "@/lib/perf";
import { toBudgetArray } from "@/lib/perf-budgets";
import { assertBudgets, type PerfAssertionResult } from "@/lib/perf-assert";
import {
  benchmarkDecode,
  type DecodeBenchResult,
} from "@/lib/audio-decode-bench";
import { FPSMonitor, type FPSReport } from "@/lib/fps-monitor";

/* ------------------------------------------------------------------ */
/*  Dev-only performance benchmark page                                */
/* ------------------------------------------------------------------ */

type BenchState = "idle" | "running" | "done" | "error";

export default function PerfPage() {
  // Gate to dev only
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-sm">
          This page is only available in development.
        </p>
      </div>
    );
  }

  return <PerfPageContent />;
}

function PerfPageContent() {
  /* ---- Audio decode benchmark ---- */
  const [audioUrl, setAudioUrl] = useState("");
  const [decodeState, setDecodeState] = useState<BenchState>("idle");
  const [decodeResult, setDecodeResult] = useState<DecodeBenchResult | null>(
    null,
  );
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const runDecodeBench = useCallback(async () => {
    if (!audioUrl.trim()) return;
    setDecodeState("running");
    setDecodeError(null);
    try {
      const result = await benchmarkDecode(audioUrl.trim());
      setDecodeResult(result);
      setDecodeState("done");
    } catch (err) {
      setDecodeError(err instanceof Error ? err.message : String(err));
      setDecodeState("error");
    }
  }, [audioUrl]);

  /* ---- FPS benchmark ---- */
  const [fpsState, setFpsState] = useState<BenchState>("idle");
  const [fpsReport, setFpsReport] = useState<FPSReport | null>(null);
  const fpsMonitorRef = useRef<FPSMonitor | null>(null);
  const fpsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fpsDuration, setFpsDuration] = useState(5);

  const runFpsBench = useCallback(() => {
    setFpsState("running");
    const monitor = new FPSMonitor();
    fpsMonitorRef.current = monitor;
    monitor.start();
    fpsTimerRef.current = setTimeout(() => {
      const report = monitor.stop();
      setFpsReport(report);
      setFpsState("done");
      fpsMonitorRef.current = null;
    }, fpsDuration * 1000);
  }, [fpsDuration]);

  const stopFpsBench = useCallback(() => {
    if (fpsTimerRef.current) clearTimeout(fpsTimerRef.current);
    if (fpsMonitorRef.current) {
      const report = fpsMonitorRef.current.stop();
      setFpsReport(report);
      setFpsState("done");
      fpsMonitorRef.current = null;
    }
  }, []);

  /* ---- Budget assertions ---- */
  const [budgetResults, setBudgetResults] = useState<
    PerfAssertionResult[] | null
  >(null);

  const runBudgetCheck = useCallback(() => {
    perf.setBudgets(toBudgetArray());
    const marks = perf.getReport();
    const results = assertBudgets(marks);
    setBudgetResults(results);
  }, []);

  /* ---- Export all ---- */
  const exportAll = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      decode: decodeResult,
      fps: fpsReport,
      budgets: budgetResults,
      marks: perf.getReport(),
      violations: perf.checkBudgets(),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }, [decodeResult, fpsReport, budgetResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel variant="float">
        <PanelHeader>
          <div className="label text-[11px] text-faint">DEV TOOLS</div>
          <h1 className="mt-2 text-2xl font-bold h1 text-text">
            Performance Benchmarks
          </h1>
          <p className="mt-2 text-sm text-muted">
            Run benchmarks for audio decoding, frame rate, and budget
            assertions.
          </p>
        </PanelHeader>
      </Panel>

      {/* Audio Decode Benchmark */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">
            Audio Decode Benchmark
          </h2>
          <p className="text-xs text-muted mt-1">
            Measures fetch, decode, and peak generation for an audio file.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-4 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="Paste an audio file URL..."
              aria-label="Audio file URL"
              className="flex-1 min-w-0 px-3 py-2 text-sm bg-bg border border-border rounded-md text-text placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <Button
              onClick={runDecodeBench}
              disabled={decodeState === "running" || !audioUrl.trim()}
            >
              {decodeState === "running" ? "Running..." : "Run Benchmark"}
            </Button>
          </div>

          {decodeError && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {decodeError}
            </div>
          )}

          {decodeResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Fetch" value={`${decodeResult.fetchMs}ms`} />
              <MetricCard label="Decode" value={`${decodeResult.decodeMs}ms`} />
              <MetricCard
                label="Peak Gen"
                value={`${decodeResult.peakGenMs}ms`}
              />
              <MetricCard label="Total" value={`${decodeResult.totalMs}ms`} />
              <MetricCard
                label="File Size"
                value={`${decodeResult.fileSizeMB} MB`}
              />
              <MetricCard
                label="Duration"
                value={`${decodeResult.durationSec}s`}
              />
              <MetricCard
                label="Sample Rate"
                value={`${decodeResult.sampleRate} Hz`}
              />
              <MetricCard
                label="Channels"
                value={String(decodeResult.channels)}
              />
              <MetricCard
                label="Decode Rate"
                value={`${decodeResult.decodeRatioMs}ms/min`}
                hint="ms to decode per minute of audio"
              />
              <MetricCard
                label="Buffer Memory"
                value={`${decodeResult.bufferSizeMB} MB`}
                hint="Raw Float32 AudioBuffer footprint"
              />
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* FPS Benchmark */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">FPS Monitor</h2>
          <p className="text-xs text-muted mt-1">
            Measures frame rate using requestAnimationFrame. Interact with the
            page during the test to measure real-world performance.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <label htmlFor="fps-duration" className="text-sm text-muted">Duration:</label>
            <select
              id="fps-duration"
              value={fpsDuration}
              onChange={(e) => setFpsDuration(Number(e.target.value))}
              className="px-2 py-1.5 text-sm bg-bg border border-border rounded-md text-text"
              disabled={fpsState === "running"}
            >
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
            </select>
            {fpsState === "running" ? (
              <Button onClick={stopFpsBench} variant="secondary">
                Stop Early
              </Button>
            ) : (
              <Button onClick={runFpsBench}>Start FPS Test</Button>
            )}
          </div>

          {fpsState === "running" && (
            <div className="text-sm text-signal animate-pulse">
              Recording frames... Interact with the page to test real
              performance.
            </div>
          )}

          {fpsReport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="Avg FPS"
                value={String(fpsReport.avgFps)}
                status={fpsReport.avgFps >= 55 ? "pass" : fpsReport.avgFps >= 30 ? "warn" : "fail"}
              />
              <MetricCard
                label="Min FPS"
                value={String(fpsReport.minFps)}
                status={fpsReport.minFps >= 30 ? "pass" : "fail"}
              />
              <MetricCard
                label="Max FPS"
                value={String(fpsReport.maxFps)}
              />
              <MetricCard
                label="P5 FPS"
                value={String(fpsReport.p5Fps)}
                hint="5th percentile (worst 5%)"
                status={fpsReport.p5Fps >= 30 ? "pass" : "fail"}
              />
              <MetricCard
                label="Dropped Frames"
                value={String(fpsReport.droppedFrames)}
                hint="> 20ms"
                status={fpsReport.droppedFrames === 0 ? "pass" : "warn"}
              />
              <MetricCard
                label="Jank Frames"
                value={String(fpsReport.jankFrames)}
                hint="> 50ms"
                status={fpsReport.jankFrames === 0 ? "pass" : "fail"}
              />
              <MetricCard
                label="Total Frames"
                value={String(fpsReport.totalFrames)}
              />
              <MetricCard
                label="Duration"
                value={`${fpsReport.durationSec}s`}
              />
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Budget Assertions */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Budget Assertions</h2>
          <p className="text-xs text-muted mt-1">
            Compares collected perf marks against defined budgets. Navigate to
            pages with audio first to collect marks, then run this check.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={runBudgetCheck}>Check Budgets</Button>
            <Button onClick={exportAll} variant="secondary">
              Export All Data
            </Button>
          </div>

          {budgetResults && budgetResults.length === 0 && (
            <div className="text-sm text-muted px-3 py-2 bg-bg rounded-md">
              No matching marks found. Visit a page with audio (e.g., a track
              detail page with <code className="text-xs">?perf</code>) to
              collect timing data first.
            </div>
          )}

          {budgetResults && budgetResults.length > 0 && (
            <>
              <div className="space-y-1">
                {budgetResults.map((r) => (
                  <div
                    key={r.metric}
                    className="flex items-center justify-between px-3 py-2 bg-bg rounded-md text-sm"
                  >
                    <span className="text-text font-medium">{r.metric}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted text-xs">
                        budget: {r.budget}ms
                      </span>
                      <span className="text-text text-xs">
                        actual: {r.actual}ms
                      </span>
                      <span
                        className={`text-xs font-bold ${r.passed ? "text-green-500" : "text-red-500"}`}
                      >
                        {r.passed ? "PASS" : `FAIL (+${r.overage}%)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted">
                Score:{" "}
                {Math.round(
                  (budgetResults.filter((r) => r.passed).length /
                    budgetResults.length) *
                    100,
                )}
                % ({budgetResults.filter((r) => r.passed).length}/
                {budgetResults.length} passing)
              </div>
            </>
          )}
        </PanelBody>
      </Panel>

      {/* Current Marks */}
      <Panel>
        <PanelHeader>
          <h2 className="text-lg font-bold h2 text-text">Collected Marks</h2>
          <p className="text-xs text-muted mt-1">
            All perf marks recorded in this session across all pages.
          </p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-4">
          <MarksTable />
        </PanelBody>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  hint,
  status,
}: {
  label: string;
  value: string;
  hint?: string;
  status?: "pass" | "warn" | "fail";
}) {
  const statusColor =
    status === "pass"
      ? "border-green-500/30 bg-green-500/5"
      : status === "warn"
        ? "border-yellow-500/30 bg-yellow-500/5"
        : status === "fail"
          ? "border-red-500/30 bg-red-500/5"
          : "border-border bg-bg";

  return (
    <div className={`rounded-md border px-3 py-2 ${statusColor}`}>
      <div className="text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-semibold text-text mt-0.5 font-mono">
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-faint mt-0.5">{hint}</div>
      )}
    </div>
  );
}

function MarksTable() {
  const marks = perf.getReport();

  if (marks.length === 0) {
    return (
      <div className="text-sm text-muted text-center py-6">
        No marks recorded. Navigate to a page with audio and add{" "}
        <code className="text-xs">?perf</code> to the URL.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {marks.map((m, i) => (
        <div
          key={`${m.name}-${i}`}
          className="flex items-center justify-between px-3 py-1.5 bg-bg rounded text-xs"
        >
          <span className="text-text font-mono truncate flex-1 min-w-0">
            {m.name}
          </span>
          <span className="text-muted ml-3 shrink-0 font-mono">
            {m.duration != null
              ? `${Math.round(m.duration * 10) / 10}ms`
              : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
