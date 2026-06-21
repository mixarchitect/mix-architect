import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * POST /api/csp-report
 *
 * Browser-sent CSP violation reports. The Content-Security-Policy
 * header's `report-uri` directive points here. Body shape varies by
 * browser/spec version:
 *   - Legacy: { "csp-report": { ... } } with content-type application/csp-report
 *   - Reporting API: [{ type, body, ... }] with content-type application/reports+json
 *
 * We don't try to enforce a schema — just forward the raw payload
 * to Sentry so a policy regression (a new third-party script,
 * a forgotten origin in connect-src) surfaces in our existing
 * error feed instead of as a silent in-app breakage.
 *
 * No auth: browsers send these without cookies. Heavy rate-limit
 * to prevent a hostile page from spamming the endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: true });
    }

    Sentry.captureMessage("CSP violation", {
      level: "warning",
      extra: {
        report: payload,
        userAgent: req.headers.get("user-agent") ?? "unknown",
        referer: req.headers.get("referer") ?? "unknown",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never bubble errors — a broken reporter shouldn't block the page.
    return NextResponse.json({ ok: true });
  }
}
