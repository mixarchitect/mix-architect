import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { logActivity, type ActivityEventType } from "@/lib/activity-logger";

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

    logActivity(user.id, eventType as ActivityEventType, metadata);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
