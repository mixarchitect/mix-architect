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

    console.log("[portal/approve]", action, track_id, share_token?.slice(0, 8));

    const supabase = createSupabaseServiceClient();

    // Validate share_token
    const { data: share, error: shareErr } = await supabase
      .from("brief_shares")
      .select("id, release_id")
      .eq("share_token", share_token)
      .maybeSingle();

    if (shareErr) {
      console.error("[portal/approve] share lookup failed:", shareErr);
      return NextResponse.json({ error: "Failed to validate share token", detail: shareErr.message }, { status: 500 });
    }

    if (!share) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 401 });
    }

    // Verify the track belongs to this release
    const { data: track, error: trackErr } = await supabase
      .from("tracks")
      .select("id")
      .eq("id", track_id)
      .eq("release_id", share.release_id)
      .maybeSingle();

    if (trackErr) {
      console.error("[portal/approve] track lookup failed:", trackErr);
      return NextResponse.json({ error: "Failed to validate track", detail: trackErr.message }, { status: 500 });
    }

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

    // Upsert the portal_track_settings with ONLY approval_status
    // (don't overwrite visible/download_enabled — those are owner-managed)
    const { error: upsertErr } = await supabase
      .from("portal_track_settings")
      .upsert(
        {
          brief_share_id: share.id,
          track_id,
          approval_status: newStatus,
        },
        { onConflict: "brief_share_id,track_id" },
      );

    if (upsertErr) {
      console.error("[portal/approve] portal_track_settings upsert failed:", upsertErr);
      return NextResponse.json(
        { error: "Failed to update approval status", detail: upsertErr.message },
        { status: 500 },
      );
    }

    // Log approval event
    const { error: eventErr } = await supabase.from("portal_approval_events").insert({
      brief_share_id: share.id,
      track_id,
      event_type: action,
      actor_name: actor_name?.trim() || "Client",
      note: note?.trim() || null,
    });

    if (eventErr) {
      console.error("[portal/approve] portal_approval_events insert failed:", eventErr);
      // Non-fatal: the status was already updated, so continue
    }

    // If request_changes, also create a revision_note with the feedback
    if (action === "request_changes" && note?.trim()) {
      const { error: noteErr } = await supabase.from("revision_notes").insert({
        track_id,
        content: note.trim(),
        author: actor_name?.trim() || "Client",
      });

      if (noteErr) {
        console.error("[portal/approve] revision_notes insert failed:", noteErr);
        // Non-fatal: the status was already updated
      }
    }

    // Recompute release-level portal_status rollup
    const { data: allTrackSettings, error: rollupErr } = await supabase
      .from("portal_track_settings")
      .select("approval_status")
      .eq("brief_share_id", share.id);

    if (rollupErr) {
      console.error("[portal/approve] rollup query failed:", rollupErr);
    }

    let portalStatus = "in_review";
    if (allTrackSettings && allTrackSettings.length > 0) {
      const statuses = allTrackSettings.map((s) => s.approval_status);
      if (statuses.every((s) => s === "delivered")) {
        portalStatus = "delivered";
      } else if (statuses.every((s) => s === "approved" || s === "delivered")) {
        portalStatus = "approved";
      }
    }

    const { error: statusErr } = await supabase
      .from("brief_shares")
      .update({ portal_status: portalStatus })
      .eq("id", share.id);

    if (statusErr) {
      console.error("[portal/approve] brief_shares status update failed:", statusErr);
    }

    console.log("[portal/approve] success:", { action, newStatus, portalStatus });

    return NextResponse.json({
      approval_status: newStatus,
      portal_status: portalStatus,
    });
  } catch (err) {
    console.error("[portal/approve] unhandled error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Internal server error: ${message}` },
      { status: 500 },
    );
  }
}
