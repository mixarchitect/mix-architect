import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { logActivity, type ActivityEventType } from "@/lib/activity-logger";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { sendTransactionalEmail, buildUnsubscribeUrl, getUserEmail } from "@/lib/email/service";
import { buildWelcomeEmail } from "@/lib/email-templates/transactional";
import { buildAdminEmail } from "@/lib/email-templates/admin-notification";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

/**
 * Email all admins that a new user signed up. Internal ops alert — sent
 * directly (not through the user-preference system), never throws.
 */
async function notifyAdminsOfSignup(newUserEmail: string, newUserName: string) {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return;
    const svc = createSupabaseServiceClient();
    const { data: admins } = await svc.from("profiles").select("id").eq("is_admin", true);
    if (!admins || admins.length === 0) return;

    const emails = (
      await Promise.all(admins.map((a) => getUserEmail(a.id as string)))
    ).filter((e): e is string => !!e);
    if (emails.length === 0) return;

    const { Resend } = require("resend") as typeof import("resend");
    const resend = new Resend(key);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com";
    const { subject, html } = buildAdminEmail({
      subject: `New signup: ${newUserEmail}`,
      heading: "New user signed up",
      body: `${newUserName} (${newUserEmail}) just created a Mix Architect account.`,
      ctaLabel: "View subscribers",
      ctaUrl: `${appUrl}/admin/subscribers`,
    });
    await resend.emails.send({
      from: "Mix Architect <team@mixarchitect.com>",
      to: emails,
      subject,
      html,
    });
  } catch (err) {
    console.error("[log-activity] admin signup alert failed (non-fatal):", err);
  }
}

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

    // Signup side effects: welcome email to the user + admin alert.
    // Awaited (not fire-and-forget) so Vercel doesn't terminate the sends
    // when the handler returns.
    if (eventType === "signup" && user.email) {
      const displayName =
        user.user_metadata?.display_name ?? user.email.split("@")[0];

      // Welcome email to the new user.
      try {
        const svc = createSupabaseServiceClient();
        await svc
          .from("email_preferences")
          .upsert({ user_id: user.id }, { onConflict: "user_id" });

        const { data: prefs } = await svc
          .from("email_preferences")
          .select("unsubscribe_token")
          .eq("user_id", user.id)
          .maybeSingle();

        const unsubscribeUrl = prefs?.unsubscribe_token
          ? buildUnsubscribeUrl(prefs.unsubscribe_token, "welcome")
          : undefined;

        const { subject, html } = buildWelcomeEmail({ displayName, unsubscribeUrl });
        await sendTransactionalEmail({
          userId: user.id,
          to: user.email,
          category: "welcome",
          subject,
          html,
        });
      } catch (err) {
        console.error("[log-activity] welcome email error:", err);
      }

      // Alert admins that a new user joined.
      await notifyAdminsOfSignup(user.email, displayName);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
