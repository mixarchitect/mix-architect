"use client";

/**
 * Last-resort error boundary.
 *
 * Catches errors thrown in the root layout itself (or anywhere above
 * a closer error.tsx). Because it replaces the whole document, it
 * MUST render its own <html> and <body> — it can't inherit the layout
 * that crashed.
 *
 * Per Next.js convention, this file is only used in production
 * builds; in development you see the stack trace overlay instead.
 */

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Even more important to capture here — global-error means the
    // root layout itself broke, so the user has no app shell context.
    // No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
    Sentry.captureException(error);
    console.error("[app/global-error] Root layout crashed:", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#0a0a0a",
          color: "#ededed",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: 28 * 16, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "1.5rem" }}>
            The application failed to start. Please try again.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                fontFamily: "ui-monospace, monospace",
                marginBottom: "1.5rem",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#0d9488",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
