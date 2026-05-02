/**
 * Next.js instrumentation entrypoint.
 *
 * Runs once per process boot — Next loads this BEFORE the first
 * request. We use it to initialize Sentry on whichever runtime is
 * actually executing this file. The browser-side init lives in
 * instrumentation-client.ts; Next loads that automatically alongside
 * page bundles.
 *
 * Sentry is a no-op when NEXT_PUBLIC_SENTRY_DSN is unset, so this
 * file is safe to ship even before a Sentry account exists.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Forward unhandled request errors (Server Components, route handlers,
 * server actions) to Sentry. Required for the dashboard to show
 * server-side errors with stack traces.
 */
export const onRequestError = Sentry.captureRequestError;
