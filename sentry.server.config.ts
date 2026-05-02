/**
 * Sentry Node.js (Vercel Functions / RSC) SDK init. Loaded from
 * instrumentation.ts. No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // Don't expose PII by default on the server — RSC fetches and
    // route handlers can carry tokens we don't want in error
    // payloads. Per-error context is added at capture time.
    sendDefaultPii: false,
  });
}
