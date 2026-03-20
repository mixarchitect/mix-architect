"use client";

import { useEffect } from "react";
import { perfReporter } from "@/lib/perf-reporter";

/** Starts the perf reporter on mount. Include once in the app layout. */
export function PerfReporterInit() {
  useEffect(() => {
    perfReporter.start();
  }, []);
  return null;
}
