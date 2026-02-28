import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

/**
 * POST /api/portal/approve
 * Handles approval actions from portal clients: approve, request_changes.
 * Also handles engineer actions: deliver, reopen.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      share_token,
      track_id,
      action,
      note,
      actor_name,
    } = body as {
      share_token: string;
      track_id: string;
      action: "approve" | "request_changes" | "deliver" | "reopen";
      note?: string;
      actor_name?: string;
    };

    if (!share_token || !track_id || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (action === "request_changes" && !note?.trim()) {
      return NextResponse.json(
        { error: "Note is required when requesting changes" },
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

    // Verify the track belongs to this release
    const { data: track } = await supabase
      .from("tracks")
      .select("id")
      .eq("id", track_id)
      .eq("release_id", share.release_id)
      .maybeSingle();

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Map action to approval_status
    const statusMap: Record<string, string> = {
      approve: "approved",
      request_changes: "changes_requested",
      deliver: "delivered",
      reopen: "awaiting_review",
    };
    const newStatus = statusMap[action];

    // Upsert the portal_track_settings with approval_status
    await supabase
      .from("portal_track_settings")
      .upsert(
        {
          brief_share_id: share.id,
          track_id,
          approval_status: newStatus,
          visible: true,
          download_enabled: true,
        },
        { onConflict: "brief_share_id,track_id" },
      );

    // Log approval event
    await supabase.from("portal_approval_events").insert({
      brief_share_id: share.id,
      track_id,
      event_type: action,
      actor_name: actor_name?.trim() || "Client",
      note: note?.trim() || null,
    });

    // If request_changes, also create a revision_note with the feedback
    if (action === "request_changes" && note?.trim()) {
      await supabase.from("revision_notes").insert({
        track_id,
        content: note.trim(),
        author: actor_name?.trim() || "Client",
      });
    }

    // Recompute release-level portal_status rollup
    const { data: allTrackSettings } = await supabase
      .from("portal_track_settings")
      .select("approval_status")
      .eq("brief_share_id", share.id);

    let portalStatus = "in_review";
    if (allTrackSettings && allTrackSettings.length > 0) {
      const statuses = allTrackSettings.map((s) => s.approval_status);
      if (statuses.every((s) => s === "delivered")) {
        portalStatus = "delivered";
      } else if (statuses.every((s) => s === "approved" || s === "delivered")) {
        portalStatus = "approved";
      }
    }

    await supabase
      .from("brief_shares")
      .update({ portal_status: portalStatus })
      .eq("id", share.id);

    return NextResponse.json({
      approval_status: newStatus,
      portal_status: portalStatus,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
