/**
 * Sentry browser SDK init.
 *
 * Loaded by Next.js as a client-side instrumentation entrypoint.
 * Initializes once per page load. When NEXT_PUBLIC_SENTRY_DSN is
 * unset (e.g. fresh clone, no Sentry account), the SDK turns into a
 * no-op — captureException calls are silently dropped.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    // Trace sample rate — keep low in prod to bound costs. Bump for
    // a specific debugging session, not as a default.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // PII is data the user provided themselves (email, name). On for
    // release-collaboration debugging, off if compliance requires.
    sendDefaultPii: true,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
