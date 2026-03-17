"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Square, Timer, X } from "lucide-react";
import { createTimeEntry } from "@/app/app/releases/[releaseId]/time-entry-actions";
import { cn } from "@/lib/cn";

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
  const [elapsed, setElapsed] = useState(0);
  const [showLogForm, setShowLogForm] = useState(false);
  const [minimized, setMinimized] = useState(false);

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

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  function handleStart() {
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    timerStartedAtRef.current = new Date().toISOString();
    setState("running");
    setElapsed(0);
    setMinimized(false);

    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 1000);
  }

  function handlePause() {
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearTimerInterval();
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
    let finalMs = accumulatedRef.current;
    if (state === "running") {
      finalMs += Date.now() - startTimeRef.current;
    }
    clearTimerInterval();
    setState("stopped");
    setElapsed(0);

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

  function handleMinimize() {
    if (state === "running" || state === "paused") {
      setMinimized(true);
    }
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

  const isActive = state === "running" || state === "paused";

  // Minimized state (running/paused but dismissed): small teal icon
  if (minimized && isActive) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 max-sm:bottom-20 z-40 w-10 h-10 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center shadow-lg shadow-black/20 hover:bg-signal/30 transition-all duration-200"
        title="Expand timer"
      >
        <Timer size={16} className="text-signal" />
      </button>
    );
  }

  // Collapsed state: just the stopwatch icon when not active and no log form
  if (state === "stopped" && !showLogForm) {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="fixed bottom-6 right-6 max-sm:bottom-20 z-40 w-10 h-10 rounded-full border border-border bg-panel flex items-center justify-center shadow-lg shadow-black/20 hover:border-signal/40 hover:bg-signal/10 transition-all duration-200 group"
        title="Time tracking"
      >
        <Timer size={16} className="text-faint group-hover:text-signal transition-colors" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 max-sm:bottom-20 z-40 shadow-lg shadow-black/20 transition-all duration-200",
        "max-sm:left-4 max-sm:right-4",
        showLogForm
          ? "w-80 max-sm:w-auto rounded-xl border border-border bg-panel"
          : "rounded-xl border border-signal/30 bg-panel",
      )}
    >
      {!showLogForm ? (
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Timer size={14} className="text-signal" />

          <span
            className={cn(
              "text-sm tabular-nums",
              state === "running" ? "text-signal" : "text-muted",
            )}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatElapsed(elapsed)}
          </span>

          <div className="flex items-center gap-1.5">
            {state === "running" && (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  className="p-1.5 rounded-full text-muted hover:text-text hover:bg-panel2 transition-colors"
                  title="Pause"
                >
                  <Pause size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-1.5 rounded-full text-muted hover:text-text hover:bg-panel2 transition-colors"
                  title="Stop & save"
                >
                  <Square size={14} />
                </button>
              </>
            )}
            {state === "paused" && (
              <>
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-signal/10 text-signal text-xs font-medium hover:bg-signal/20 transition-colors"
                >
                  <Play size={12} />
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-1.5 rounded-full text-muted hover:text-text hover:bg-panel2 transition-colors"
                  title="Stop & save"
                >
                  <Square size={14} />
                </button>
              </>
            )}
          </div>

          {/* Minimize button when running/paused */}
          <button
            type="button"
            onClick={handleMinimize}
            className="p-1 rounded text-faint hover:text-muted transition-colors ml-auto"
            title="Minimize timer"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        /* Log entry form after stopping */
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted">Log this session</p>
            <button
              type="button"
              onClick={handleDiscard}
              className="p-1 rounded text-faint hover:text-muted transition-colors"
              title="Discard"
            >
              <X size={12} />
            </button>
          </div>
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
    </div>
  );
}
