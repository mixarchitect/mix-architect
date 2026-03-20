"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PerfOverlay = dynamic(
  () => import("./perf-overlay").then((m) => m.PerfOverlay),
  { ssr: false },
);

/**
 * Client wrapper that conditionally loads the PerfOverlay.
 * Dev-only visual tool — only loads when NODE_ENV is development
 * AND ?perf is in the URL. Production perf data is collected by
 * PerfReporterInit and sent to the admin dashboard instead.
 */
export function PerfOverlayLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const has = new URLSearchParams(window.location.search).has("perf");
    setShow(has);
  }, []);

  if (!show) return null;
  return <PerfOverlay />;
}
