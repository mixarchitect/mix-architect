import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { logActivity, type ActivityEventType } from "@/lib/activity-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { drainEmailOutbox } from "@/lib/email/outbox";

const ALLOWED_EVENTS: Set<string> = new Set([
  "login",
  "signup",
  "release_created",
  "track_uploaded",
  "collaborator_invited",
]);

/**
 * POST /api/admin/log-activity
 * Lightweight endpoint for client-side activity logging.
 * Authenticates the caller and logs the event with their user ID.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`admin-log:${ip}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventType, metadata } = body as {
      eventType: string;
      metadata?: Record<string, unknown>;
    };

    if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    logActivity(user.id, eventType as ActivityEventType, metadata, { ip: getClientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });

    // Signup/login side effect: deliver any pending welcome email from the
    // outbox seeded by handle_new_user(). Awaited (not fire-and-forget) so
    // Vercel doesn't terminate the send when the handler returns. Re-posting
    // the event can't re-send or spam admins — the drain only processes rows
    // still in 'pending' for THIS user, claimed with a conditional update.
    if (eventType === "signup" || eventType === "login") {
      await drainEmailOutbox({ userId: user.id });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
