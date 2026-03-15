import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { notifyReleaseMembers, type NotificationType } from "@/lib/notifications/service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { emailReleaseMembers } from "@/lib/email/release-email";
import { buildNewCommentEmail } from "@/lib/email-templates/transactional";

/**
 * POST /api/notify
 * Fire-and-forget endpoint for client-side code to create notifications.
 * Authenticates the caller and notifies all release members except the caller.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`notify:${ip}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

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

    const resolvedActorName = actorName || user.user_metadata?.display_name || user.email || "Someone";

    await notifyReleaseMembers({
      releaseId,
      excludeUserId: user.id,
      type,
      title,
      body: notifBody,
      trackId,
      actorName: resolvedActorName,
    });

    // Send email for comment notifications (fire-and-forget)
    if (type === "comment") {
      const svc = createSupabaseServiceClient();
      const { data: releaseInfo } = await svc
        .from("releases")
        .select("title")
        .eq("id", releaseId)
        .maybeSingle();

      const { data: trackInfo } = trackId
        ? await svc.from("tracks").select("title").eq("id", trackId).maybeSingle()
        : { data: null };

      const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com"}/app/releases/${releaseId}`;
      emailReleaseMembers({
        releaseId,
        excludeUserId: user.id,
        category: "new_comment",
        buildEmail: ({ unsubscribeUrl }) =>
          buildNewCommentEmail({
            releaseTitle: releaseInfo?.title ?? "Untitled Release",
            trackTitle: trackInfo?.title ?? "Untitled Track",
            commentAuthor: resolvedActorName,
            commentPreview: (notifBody ?? "").slice(0, 200),
            appUrl,
            unsubscribeUrl,
          }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
