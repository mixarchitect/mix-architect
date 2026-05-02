"use client";

/**
 * Top-level error boundary.
 *
 * Catches uncaught errors thrown anywhere under the root segment that
 * don't have a closer error.tsx. Without this, render errors on
 * /portal/*, /featured/*, /changelog/*, /admin/* and the marketing /
 * fall through to Next.js's default fallback (a small unstyled
 * "Application error" page) — and we have no signal in production
 * because nothing is wired to a tracker.
 *
 * Per Next.js convention, `error.tsx` is always a Client Component.
 */

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to Sentry. No-op when NEXT_PUBLIC_SENTRY_DSN is unset,
    // so this is safe even before a Sentry account exists. The
    // `digest` is kept in console output so a Vercel runtime log
    // line can be correlated with the Sentry event when both exist.
    Sentry.captureException(error);
    console.error("[app/error] Unhandled error:", error, {
      digest: error.digest,
    });
  }, [error]);

  // error.tsx renders inside the existing layout — it must NOT emit
  // its own <html> / <body> tags. (global-error.tsx, which catches
  // errors in the root layout itself, is the one that does.)
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-text">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted">
            We hit an unexpected error. The team has been notified.
          </p>
        </div>
        {error.digest && (
          <p className="text-xs text-faint font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-signal text-signal-on text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-border text-sm font-medium text-text hover:bg-panel2 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
