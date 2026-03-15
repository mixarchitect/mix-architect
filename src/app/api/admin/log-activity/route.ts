import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { logActivity, type ActivityEventType } from "@/lib/activity-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendTransactionalEmail, buildUnsubscribeUrl } from "@/lib/email/service";
import { buildWelcomeEmail } from "@/lib/email-templates/transactional";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

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

    // Send welcome email on signup (fire-and-forget)
    if (eventType === "signup" && user.email) {
      (async () => {
        try {
          const svc = createSupabaseServiceClient();

          // Ensure email_preferences row exists for this new user
          await svc
            .from("email_preferences")
            .upsert({ user_id: user.id }, { onConflict: "user_id" });

          // Get unsubscribe token
          const { data: prefs } = await svc
            .from("email_preferences")
            .select("unsubscribe_token")
            .eq("user_id", user.id)
            .maybeSingle();

          const unsubscribeUrl = prefs?.unsubscribe_token
            ? buildUnsubscribeUrl(prefs.unsubscribe_token, "welcome")
            : undefined;

          const displayName =
            user.user_metadata?.display_name ??
            user.email!.split("@")[0];

          const { subject, html } = buildWelcomeEmail({
            displayName,
            unsubscribeUrl,
          });

          await sendTransactionalEmail({
            userId: user.id,
            to: user.email!,
            category: "welcome",
            subject,
            html,
          });
        } catch (err) {
          console.error("[log-activity] welcome email error:", err);
        }
      })();
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
