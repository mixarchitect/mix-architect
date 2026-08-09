import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { drainEmailOutbox } from "@/lib/email/outbox";

/**
 * Cron job: safety net for the welcome-email outbox. The normal delivery
 * paths are the signup route, the auth callback, and the activity-log
 * endpoint; this sweep catches anything they missed (e.g. a Resend outage
 * during signup). Secured by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  // Fail closed if CRON_SECRET is unset — otherwise the expected digest is
  // of the literal "Bearer undefined", which an attacker can simply send.
  if (!secret || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const actual = crypto.createHash("sha256").update(secret).digest();
  const expected = crypto
    .createHash("sha256")
    .update(`Bearer ${process.env.CRON_SECRET}`)
    .digest();
  if (!crypto.timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settled = await drainEmailOutbox({ limit: 25 });
  return NextResponse.json({ ok: true, settled });
}
