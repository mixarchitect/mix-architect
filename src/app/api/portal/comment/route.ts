import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { notifyReleaseMembers } from "@/lib/notifications/service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { emailReleaseMembers } from "@/lib/email/release-email";
import { buildNewCommentEmail } from "@/lib/email-templates/transactional";

/**
 * POST /api/portal/comment
 * Creates a timestamped comment on a portal track version.
 * Uses service role to bypass RLS (anonymous portal visitors).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`portal-comment:${ip}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const {
      share_token,
      track_id,
      audio_version_id,
      content,
      timecode_seconds,
      author_name,
    } = body as {
      share_token: string;
      track_id: string;
      audio_version_id: string;
      content: string;
      timecode_seconds: number;
      author_name?: string;
    };

    if (!share_token || !track_id || !audio_version_id || !content?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();

    // Validate share_token and that the track belongs to this release
    const { data: share } = await supabase
      .from("brief_shares")
      .select("id, release_id")
      .eq("share_token", share_token)
      .maybeSingle();

    if (!share) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 401 });
    }

    // Verify the track belongs to this release
    const { data: track } = await supabase
      .from("tracks")
      .select("id, title")
      .eq("id", track_id)
      .eq("release_id", share.release_id)
      .maybeSingle();

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Generate an opaque delete token. The portal client stores it in
    // localStorage keyed by the new comment's id; only the holder of
    // this token can delete the comment via the portal endpoint
    // (preventing the previous bug where any visitor with the share
    // token could delete any comment by spoofing author_name).
    const deleteToken = crypto.randomUUID();

    // Insert the comment
    const { data: comment, error } = await supabase
      .from("revision_notes")
      .insert({
        track_id,
        audio_version_id,
        content: content.trim(),
        author: author_name?.trim() || "Client",
        timecode_seconds: Math.round(timecode_seconds * 100) / 100,
        delete_token: deleteToken,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify + email release members (awaited so Vercel doesn't kill the function)
    const actor = author_name?.trim() || "Client";
    const { data: releaseInfo } = await supabase
      .from("releases")
      .select("title")
      .eq("id", share.release_id)
      .maybeSingle();

    const appUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mixarchitect.com"}/app/releases/${share.release_id}`;

    await Promise.allSettled([
      notifyReleaseMembers({
        releaseId: share.release_id,
        type: "portal_comment",
        title: `${actor} commented on "${track.title}"`,
        body: content.trim().slice(0, 120),
        trackId: track_id,
        actorName: actor,
      }),
      emailReleaseMembers({
        releaseId: share.release_id,
        category: "new_comment",
        buildEmail: ({ unsubscribeUrl }) =>
          buildNewCommentEmail({
            releaseTitle: releaseInfo?.title ?? "Untitled Release",
            trackTitle: track.title ?? "Untitled Track",
            commentAuthor: actor,
            commentPreview: content.trim().slice(0, 200),
            appUrl,
            unsubscribeUrl,
          }),
      }),
    ]);

    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/portal/comment
 * Deletes a portal-authored comment by id. Authorization is by an
 * opaque delete_token issued at POST time; the previous self-asserted
 * author_name check let any portal visitor with the share token
 * delete any comment (defaults named "Client" were deletable by all).
 *
 * Comments created before delete_token shipped have NULL — they can't
 * be deleted from the portal. Release owners can still delete them
 * via the in-app comment thread.
 */
export async function DELETE(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = rateLimit(`portal-comment:${ip}`, 30, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const { share_token, comment_id, delete_token } = body as {
      share_token: string;
      comment_id: string;
      delete_token?: string;
    };

    if (!share_token || !comment_id || !delete_token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServiceClient();

    // Validate share_token
    const { data: share } = await supabase
      .from("brief_shares")
      .select("id, release_id")
      .eq("share_token", share_token)
      .maybeSingle();

    if (!share) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 401 });
    }

    // Fetch the comment with its delete_token. Don't surface whether the
    // row exists vs. token-mismatched — both return 403 — so a probe
    // can't enumerate comment ids.
    const { data: comment } = await supabase
      .from("revision_notes")
      .select("id, track_id, delete_token")
      .eq("id", comment_id)
      .maybeSingle();

    if (!comment || !comment.delete_token || comment.delete_token !== delete_token) {
      return NextResponse.json(
        { error: "Cannot delete this comment" },
        { status: 403 },
      );
    }

    // Verify the comment's track belongs to this share's release
    // (defense in depth — the token alone already authorizes delete).
    const { data: track } = await supabase
      .from("tracks")
      .select("id")
      .eq("id", comment.track_id)
      .eq("release_id", share.release_id)
      .maybeSingle();

    if (!track) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("revision_notes")
      .delete()
      .eq("id", comment_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
