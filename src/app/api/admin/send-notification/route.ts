import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { isAdmin } from "@/lib/admin";
import { buildAdminEmail } from "@/lib/email-templates/admin-notification";
import { logAdminAction } from "@/lib/admin-audit-logger";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = require("resend") as typeof import("resend");
  return new Resend(key);
}

/**
 * POST /api/admin/send-notification
 * Send an admin email notification to a user. Requires admin auth.
 *
 * Body: {
 *   recipientEmail: string;
 *   recipientUserId?: string;
 *   subject: string;
 *   heading: string;
 *   body: string;
 *   ctaLabel?: string;
 *   ctaUrl?: string;
 *   category?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resend = getResend();
    if (!resend) {
      return NextResponse.json(
        { error: "Email not configured (RESEND_API_KEY missing)" },
        { status: 503 },
      );
    }

    const body = await req.json();
    const {
      recipientEmail,
      recipientUserId,
      subject,
      heading,
      body: emailBody,
      ctaLabel,
      ctaUrl,
      category,
    } = body as {
      recipientEmail: string;
      recipientUserId?: string;
      subject: string;
      heading: string;
      body: string;
      ctaLabel?: string;
      ctaUrl?: string;
      category?: string;
    };

    if (!recipientEmail || !subject || !heading || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: recipientEmail, subject, heading, body" },
        { status: 400 },
      );
    }

    // Build and send email
    const email = buildAdminEmail({
      subject,
      heading,
      body: emailBody,
      ctaLabel,
      ctaUrl,
    });

    await resend.emails.send({
      from: "Mix Architect <team@mixarchitect.com>",
      to: recipientEmail,
      subject: email.subject,
      html: email.html,
    });

    // Log the sent notification
    const serviceClient = createSupabaseServiceClient();
    await serviceClient.from("admin_notifications_log").insert({
      sent_by: user.id,
      recipient_email: recipientEmail,
      recipient_user_id: recipientUserId || null,
      subject,
      heading,
      body: emailBody,
      cta_label: ctaLabel || null,
      cta_url: ctaUrl || null,
      category: category || "custom",
    });

    logAdminAction(user.id, "send_notification", {
      recipient: recipientEmail,
      subject,
      category: category || "custom",
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[admin/send-notification] Error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
