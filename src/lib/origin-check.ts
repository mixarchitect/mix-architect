import { NextRequest, NextResponse } from "next/server";

/**
 * Verify that a state-changing request came from this app's own
 * frontend, not a cross-site form post or an attacker page.
 *
 * Server actions get this for free via Next.js's built-in CSRF
 * protection, but raw route handlers using JSON bodies + cookie auth
 * don't — and `SameSite=Lax` cookies (Supabase's default) only block
 * cross-site form POSTs, not JSON requests via fetch with credentials.
 *
 * Defense in depth: any same-site XSS that gains a cookie's worth of
 * trust trivially escalates without an Origin check. Adding this gate
 * raises the bar from "exfiltrate the cookie via XSS" to "must have a
 * page on the same origin" — which is exactly what Origin is designed
 * to prove.
 *
 * Returns null when allowed; returns a 403 NextResponse when the
 * Origin header is missing or doesn't match an allowed value.
 *
 * Allowed origins:
 *   - The request's own origin (same-host POST)
 *   - process.env.NEXT_PUBLIC_APP_URL (the canonical production origin)
 *
 * Vercel preview URLs share a hostname with the request itself, so the
 * request-origin check covers them too.
 */
export function requireSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) {
    return NextResponse.json(
      { error: "Missing Origin header" },
      { status: 403 },
    );
  }

  const allowed = new Set<string>();

  // Request's own origin (covers preview URLs + same-domain prod).
  try {
    allowed.add(new URL(req.url).origin);
  } catch {
    /* malformed URL — fall through, will likely 403 below */
  }

  // Canonical production origin (in case of proxies / domain aliases).
  const canonical = process.env.NEXT_PUBLIC_APP_URL;
  if (canonical) {
    try {
      allowed.add(new URL(canonical).origin);
    } catch {
      /* misconfigured env — ignore */
    }
  }

  if (!allowed.has(origin)) {
    return NextResponse.json(
      { error: "Cross-origin request denied" },
      { status: 403 },
    );
  }

  return null;
}
