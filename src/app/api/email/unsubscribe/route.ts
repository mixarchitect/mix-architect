import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { EmailCategory } from "@/lib/email/service";

const VALID_CATEGORIES: EmailCategory[] = [
  "welcome",
  "release_live",
  "new_comment",
  "client_feedback",
  "payment_reminder",
  "payment_received",
  "weekly_digest",
  "subscription_confirmed",
  "subscription_cancelled",
];

/**
 * GET /api/email/unsubscribe?token=UUID&category=xxx
 * One-click unsubscribe handler (no auth required, token-based for CAN-SPAM compliance).
 * Supports ?all=true to unsubscribe from all categories.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`email-unsub:${ip}`, 20, 60_000);
  if (!success) {
    return new NextResponse(renderHtml("Too many requests. Please try again later."), {
      status: 429,
      headers: { "Content-Type": "text/html" },
    });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const category = searchParams.get("category") as EmailCategory | null;
  const unsubAll = searchParams.get("all") === "true";

  if (!token) {
    return new NextResponse(renderHtml("Invalid unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!unsubAll && (!category || !VALID_CATEGORIES.includes(category))) {
    return new NextResponse(renderHtml("Invalid unsubscribe category."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createSupabaseServiceClient();

  // Look up the user by unsubscribe token
  const { data: prefs } = await supabase
    .from("email_preferences")
    .select("id, user_id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!prefs) {
    return new NextResponse(renderHtml("Invalid or expired unsubscribe link."), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Update preferences
  if (unsubAll) {
    const allFalse: Record<string, boolean> = {};
    for (const cat of VALID_CATEGORIES) {
      allFalse[cat] = false;
    }
    await supabase
      .from("email_preferences")
      .update(allFalse)
      .eq("id", prefs.id);
  } else if (category) {
    await supabase
      .from("email_preferences")
      .update({ [category]: false })
      .eq("id", prefs.id);
  }

  const message = unsubAll
    ? "You've been unsubscribed from all Mix Architect emails."
    : `You've been unsubscribed from ${formatCategory(category!)} emails.`;

  return new NextResponse(
    renderHtml(message, true),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

function formatCategory(category: EmailCategory): string {
  const labels: Record<EmailCategory, string> = {
    welcome: "welcome",
    release_live: "release live",
    new_comment: "new comment",
    client_feedback: "client feedback",
    payment_reminder: "payment reminder",
    payment_received: "payment received",
    weekly_digest: "weekly digest",
    subscription_confirmed: "subscription confirmed",
    subscription_cancelled: "subscription cancelled",
  };
  return labels[category] ?? category;
}

function renderHtml(message: string, showSettings = false): string {
  const settingsLink = showSettings
    ? `<p style="margin-top:16px"><a href="https://mixarchitect.com/app/settings" style="color:#0D9488;text-decoration:none">Manage email preferences in Settings &#8594;</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribe - Mix Architect</title></head>
<body style="margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;text-align:center">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #e5e5e5">
  <div style="font-size:14px;font-weight:600;color:#0D9488;margin-bottom:24px">MIX ARCHITECT</div>
  <p style="font-size:16px;color:#1a1a1a;line-height:1.6">${message}</p>
  ${settingsLink}
</div>
</body>
</html>`;
}
