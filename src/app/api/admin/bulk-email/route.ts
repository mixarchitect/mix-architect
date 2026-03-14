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
 * POST /api/admin/bulk-email
 * Send an email to multiple recipients at once.
 *
 * Body: {
 *   recipients: { email: string; userId?: string }[];
 *   subject: string;
 *   heading: string;
 *   body: string;
 *   ctaLabel?: string;
 *   ctaUrl?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
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
    const { recipients, subject, heading, body: emailBody, ctaLabel, ctaUrl } = body as {
      recipients: { email: string; userId?: string }[];
      subject: string;
      heading: string;
      body: string;
      ctaLabel?: string;
      ctaUrl?: string;
    };

    if (!recipients?.length || !subject || !heading || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: recipients, subject, heading, body" },
        { status: 400 },
      );
    }

    const email = buildAdminEmail({ subject, heading, body: emailBody, ctaLabel, ctaUrl });

    // Send emails using Resend batch API
    const emails = recipients.map((r) => ({
      from: "Mix Architect <team@mixarchitect.com>",
      to: r.email,
      subject: email.subject,
      html: email.html,
    }));

    // Resend batch supports up to 100 emails
    const { error } = await resend.batch.send(emails);
    if (error) {
      console.error("[admin/bulk-email] Send error:", error);
      return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
    }

    // Log notifications
    const serviceClient = createSupabaseServiceClient();
    const logs = recipients.map((r) => ({
      sent_by: user.id,
      recipient_email: r.email,
      recipient_user_id: r.userId || null,
      subject,
      heading,
      body: emailBody,
      cta_label: ctaLabel || null,
      cta_url: ctaUrl || null,
      category: "bulk",
    }));

    await serviceClient.from("admin_notifications_log").insert(logs);

    logAdminAction(user.id, "bulk_email", {
      count: recipients.length,
      subject,
    });

    return NextResponse.json({ sent: true, count: recipients.length });
  } catch (err) {
    console.error("[admin/bulk-email] Error:", err);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
