import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  buildNewVersionEmail,
  buildTrackApprovedEmail,
  buildChangesRequestedEmail,
  buildTrackDeliveredEmail,
} from "@/lib/email-templates/portal-notification";

// Lazy-init Resend to avoid build failures when RESEND_API_KEY is missing
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  // Dynamic import not needed — Resend constructor is lightweight
  const { Resend } = require("resend") as typeof import("resend");
  return new Resend(key);
}

/**
 * POST /api/portal/notify
 * Internal notification dispatcher for portal events.
 *
 * Body: {
 *   share_token: string;
 *   event: "new_version" | "approved" | "changes_requested" | "delivered";
 *   track_id: string;
 *   actor_name?: string;
 *   note?: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json(
        { error: "Email not configured" },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { share_token, event, track_id, actor_name, note } = body as {
      share_token: string;
      event: "new_version" | "approved" | "changes_requested" | "delivered";
      track_id: string;
      actor_name?: string;
      note?: string;
    };

    if (!share_token || !event || !track_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();

    // Fetch share + release + track
    const { data: share } = await supabase
      .from("brief_shares")
      .select("*, releases!inner(title, user_id)")
      .eq("share_token", share_token)
      .maybeSingle();

    if (!share) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 401 });
    }

    const { data: track } = await supabase
      .from("tracks")
      .select("title")
      .eq("id", track_id)
      .maybeSingle();

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const releaseTitle = (share as Record<string, unknown>).releases
      ? ((share as Record<string, unknown>).releases as { title: string }).title
      : "Release";
    const trackTitle = track.title;
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.mixarchitect.com"}/portal/${share_token}`;

    // Determine recipient and check notification preferences
    let recipientEmail: string | null = null;
    let emailContent: { subject: string; html: string } | null = null;

    if (event === "approved" || event === "changes_requested") {
      // Notify engineer (release owner)
      if (
        (event === "approved" && !share.notify_on_approval) ||
        (event === "changes_requested" && !share.notify_on_changes)
      ) {
        return NextResponse.json({ skipped: true, reason: "notifications_disabled" });
      }

      // Get engineer email
      const ownerId = ((share as Record<string, unknown>).releases as { user_id: string }).user_id;
      const { data: ownerData } = await supabase.auth.admin.getUserById(ownerId);
      recipientEmail = ownerData?.user?.email ?? null;

      if (event === "approved") {
        emailContent = buildTrackApprovedEmail({
          releaseTitle,
          trackTitle,
          actorName: actor_name || "Client",
          portalUrl,
        });
      } else {
        emailContent = buildChangesRequestedEmail({
          releaseTitle,
          trackTitle,
          actorName: actor_name || "Client",
          note: note || "",
          portalUrl,
        });
      }
    } else if (event === "new_version" || event === "delivered") {
      // Notify client
      if (event === "new_version" && !share.notify_on_new_version) {
        return NextResponse.json({ skipped: true, reason: "notifications_disabled" });
      }

      recipientEmail = share.client_notification_email;

      if (event === "new_version") {
        emailContent = buildNewVersionEmail({ releaseTitle, trackTitle, portalUrl });
      } else {
        emailContent = buildTrackDeliveredEmail({ releaseTitle, trackTitle, portalUrl });
      }
    }

    if (!recipientEmail || !emailContent) {
      return NextResponse.json({ skipped: true, reason: "no_recipient" });
    }

    await resend.emails.send({
      from: "Mix Architect <team@mixarchitect.com>",
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
