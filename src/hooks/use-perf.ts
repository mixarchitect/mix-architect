"use client";

import { useEffect, useRef, useCallback } from "react";
import { perf, type PerfMark } from "@/lib/perf";

/**
 * Component-level performance profiling hook.
 * All mark names are prefixed with the component name.
 * No-op when the profiler is disabled (zero overhead in production).
 */
export function usePerf(componentName: string) {
  const mountTime = useRef(performance.now());
  const mounted = useRef(false);

  // Track mount-to-interactive time
  useEffect(() => {
    if (!perf.enabled || mounted.current) return;
    mounted.current = true;
    const name = `${componentName}:mount`;
    perf.start(name, { component: componentName });
    // Mark the mount as the time from component creation to first effect
    const mark = perf.end(name);
    if (mark) {
      mark.duration = performance.now() - mountTime.current;
    }
  }, [componentName]);

  /** Wrap an async or sync operation with timing. */
  const trackOperation = useCallback(
    <T,>(opName: string, fn: () => T, metadata?: Record<string, unknown>): T =>
      perf.measure(`${componentName}:${opName}`, fn, metadata),
    [componentName],
  );

  /** Start a named mark scoped to this component. */
  const start = useCallback(
    (name: string, metadata?: Record<string, unknown>) =>
      perf.start(`${componentName}:${name}`, metadata),
    [componentName],
  );

  /** End a named mark scoped to this component. */
  const end = useCallback(
    (name: string): PerfMark | null => perf.end(`${componentName}:${name}`),
    [componentName],
  );

  /** Get all completed marks for this component. */
  const getMetrics = useCallback(
    () =>
      perf.getReport().filter((m) => m.name.startsWith(`${componentName}:`)),
    [componentName],
  );

  return { trackOperation, start, end, getMetrics, enabled: perf.enabled };
}
