import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { notifyReleaseMembers, type NotificationType } from "@/lib/notifications/service";

/**
 * POST /api/notify
 * Fire-and-forget endpoint for client-side code to create notifications.
 * Authenticates the caller and notifies all release members except the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, body: notifBody, releaseId, trackId, actorName } = body as {
      type: NotificationType;
      title: string;
      body?: string;
      releaseId: string;
      trackId?: string;
      actorName?: string;
    };

    if (!type || !title || !releaseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await notifyReleaseMembers({
      releaseId,
      excludeUserId: user.id,
      type,
      title,
      body: notifBody,
      trackId,
      actorName: actorName || user.user_metadata?.display_name || user.email || "Someone",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
