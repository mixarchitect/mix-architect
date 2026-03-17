"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Square } from "lucide-react";
import { Panel, PanelBody } from "@/components/ui/panel";
import { createTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";

type TimerState = "stopped" | "running" | "paused";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function roundToQuarter(hours: number): number {
  return Math.round(hours * 4) / 4;
}

interface Props {
  releaseId: string;
  defaultRate: number | null;
  currency: string;
  locale: string;
}

export function ReleaseTimer({ releaseId, defaultRate, currency, locale }: Props) {
  const router = useRouter();
  const [state, setState] = useState<TimerState>("stopped");
  const [elapsed, setElapsed] = useState(0); // ms
  const [showLogForm, setShowLogForm] = useState(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const timerStartedAtRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Log form state
  const [logHours, setLogHours] = useState("");
  const [logBillable, setLogBillable] = useState(true);
  const [logRate, setLogRate] = useState(defaultRate != null ? String(defaultRate) : "");
  const [logDesc, setLogDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  function handleStart() {
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    timerStartedAtRef.current = new Date().toISOString();
    setState("running");
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 1000);
  }

  function handlePause() {
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearTimer();
    setState("paused");
    setElapsed(accumulatedRef.current);
  }

  function handleResume() {
    startTimeRef.current = Date.now();
    setState("running");

    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 1000);
  }

  function handleStop() {
    // Calculate final elapsed
    let finalMs = accumulatedRef.current;
    if (state === "running") {
      finalMs += Date.now() - startTimeRef.current;
    }
    clearTimer();
    setState("stopped");
    setElapsed(0);

    // Pre-fill the log form
    const rawHours = finalMs / (1000 * 60 * 60);
    const rounded = roundToQuarter(rawHours);
    setLogHours(String(Math.max(rounded, 0.25)));
    setLogBillable(true);
    setLogRate(defaultRate != null ? String(defaultRate) : "");
    setLogDesc("");
    setShowLogForm(true);
  }

  function handleDiscard() {
    setShowLogForm(false);
    setLogHours("");
    setLogRate("");
    setLogDesc("");
  }

  async function handleSaveEntry() {
    const hours = parseFloat(logHours);
    if (isNaN(hours) || hours <= 0) return;
    const rate = logBillable && logRate.trim() ? parseFloat(logRate) : null;

    setSaving(true);
    const result = await createTimeEntry({
      releaseId,
      hours,
      rate,
      description: logDesc || undefined,
      entryType: "timer",
      startedAt: timerStartedAtRef.current || undefined,
      endedAt: new Date().toISOString(),
    });
    setSaving(false);

    if (!result.error) {
      setShowLogForm(false);
      router.refresh();
    }
  }

  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="label-sm text-muted mb-3">TIMER</div>

        {!showLogForm ? (
          <>
            {/* Timer display */}
            <div className="text-center mb-3">
              <span
                className={`text-2xl font-mono tabular-nums ${
                  state === "running" ? "text-signal" : "text-muted"
                }`}
              >
                {formatElapsed(elapsed)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              {state === "stopped" && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-signal/10 text-signal text-sm font-medium hover:bg-signal/20 transition-colors"
                >
                  <Play size={14} />
                  Start
                </button>
              )}
              {state === "running" && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel2 border border-border text-muted text-sm hover:text-text transition-colors"
                  >
                    <Pause size={14} />
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel2 border border-border text-muted text-sm hover:text-text transition-colors"
                  >
                    <Square size={14} />
                    Stop
                  </button>
                </>
              )}
              {state === "paused" && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal/10 text-signal text-sm font-medium hover:bg-signal/20 transition-colors"
                  >
                    <Play size={14} />
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-panel2 border border-border text-muted text-sm hover:text-text transition-colors"
                  >
                    <Square size={14} />
                    Stop
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          /* Log entry form after stopping */
          <div className="space-y-2">
            <p className="text-xs text-muted mb-2">Log this session:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-faint uppercase">Hours</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="input text-xs h-7 w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] text-faint uppercase">Rate/hr</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={logBillable ? logRate : ""}
                  onChange={(e) => setLogRate(e.target.value)}
                  className="input text-xs h-7 w-full"
                  placeholder="—"
                  disabled={!logBillable}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={logBillable}
                onChange={(e) => setLogBillable(e.target.checked)}
                className="accent-signal"
              />
              <span className="text-xs text-muted">Billable</span>
            </label>
            {logBillable && logHours && logRate && (
              <p className="text-xs text-faint">
                Total: {fmtCurrency(parseFloat(logHours || "0") * parseFloat(logRate || "0"))}
              </p>
            )}
            <input
              type="text"
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              className="input text-xs h-7 w-full"
              placeholder="What did you work on?"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEntry();
                if (e.key === "Escape") handleDiscard();
              }}
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={handleDiscard}
                className="text-xs text-muted hover:text-text transition-colors px-2 py-1"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveEntry}
                disabled={saving || !logHours || parseFloat(logHours) <= 0}
                className="text-xs text-signal hover:text-teal-300 transition-colors px-2 py-1 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
