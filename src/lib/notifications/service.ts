/**
 * Server-side notification service.
 * Uses the service-role client to bypass RLS when inserting notifications.
 * Only import this in API routes and server actions — never in client code.
 */

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

export type NotificationType =
  | "comment"
  | "portal_comment"
  | "status_change"
  | "payment_update"
  | "approval"
  | "audio_upload"
  | "collaborator_joined"
  | "export_complete";

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  releaseId?: string;
  trackId?: string;
  actorName?: string;
};

/**
 * Insert a single notification for a user.
 * Fires and forgets — errors are logged but not thrown.
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createSupabaseServiceClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    release_id: params.releaseId ?? null,
    track_id: params.trackId ?? null,
    actor_name: params.actorName ?? null,
  });

  if (error) {
    console.error("[notifications] insert failed:", error);
  }
}

/**
 * Insert notifications for multiple users at once (e.g., all release members).
 * Skips `excludeUserId` to prevent self-notifications.
 */
export async function notifyReleaseMembers(params: {
  releaseId: string;
  excludeUserId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  trackId?: string;
  actorName?: string;
}) {
  const supabase = createSupabaseServiceClient();

  // Get release owner
  const { data: release } = await supabase
    .from("releases")
    .select("user_id")
    .eq("id", params.releaseId)
    .single();

  // Get accepted collaborators
  const { data: members } = await supabase
    .from("release_members")
    .select("user_id")
    .eq("release_id", params.releaseId)
    .not("accepted_at", "is", null);

  const recipientIds = new Set<string>();

  if (release?.user_id) recipientIds.add(release.user_id);
  for (const m of members ?? []) {
    if (m.user_id) recipientIds.add(m.user_id);
  }

  // Exclude the actor (no self-notifications)
  if (params.excludeUserId) {
    recipientIds.delete(params.excludeUserId);
  }

  if (recipientIds.size === 0) return;

  const rows = Array.from(recipientIds).map((uid) => ({
    user_id: uid,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    release_id: params.releaseId,
    track_id: params.trackId ?? null,
    actor_name: params.actorName ?? null,
  }));

  const { error } = await supabase.from("notifications").insert(rows);

  if (error) {
    console.error("[notifications] bulk insert failed:", error);
  }
}
