"use client";

import dynamic from "next/dynamic";

const PerfOverlay = dynamic(
  () => import("./perf-overlay").then((m) => m.PerfOverlay),
  { ssr: false },
);

/**
 * Client wrapper that conditionally loads the PerfOverlay.
 * Safe to include in server component trees (layout.tsx).
 * Only loads the overlay code in development.
 */
export function PerfOverlayLoader() {
  if (process.env.NODE_ENV !== "development") return null;
  return <PerfOverlay />;
}
