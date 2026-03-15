/**
 * Email helper for notifying release members (owner + collaborators).
 * Mirrors the pattern from notifyReleaseMembers() in notifications/service.ts.
 */

import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import {
  sendTransactionalEmail,
  buildUnsubscribeUrl,
  getUserEmail,
  type EmailCategory,
} from "./service";

type EmailBuilder = (params: {
  userEmail: string;
  displayName: string;
  unsubscribeUrl: string;
}) => { subject: string; html: string };

/**
 * Send transactional emails to all members of a release.
 * Fetches release owner + accepted collaborators, excludes the actor,
 * then calls sendTransactionalEmail for each recipient.
 */
export async function emailReleaseMembers({
  releaseId,
  excludeUserId,
  category,
  buildEmail,
}: {
  releaseId: string;
  excludeUserId?: string;
  category: EmailCategory;
  buildEmail: EmailBuilder;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Get release owner
  const { data: release } = await supabase
    .from("releases")
    .select("user_id")
    .eq("id", releaseId)
    .single();

  // Get accepted collaborators
  const { data: members } = await supabase
    .from("release_members")
    .select("user_id")
    .eq("release_id", releaseId)
    .not("accepted_at", "is", null);

  const recipientIds = new Set<string>();

  if (release?.user_id) recipientIds.add(release.user_id);
  for (const m of members ?? []) {
    if (m.user_id) recipientIds.add(m.user_id);
  }

  // Exclude the actor (no self-emails)
  if (excludeUserId) {
    recipientIds.delete(excludeUserId);
  }

  console.log(`[email/release-email] releaseId=${releaseId} category=${category} owner=${release?.user_id ?? "none"} members=${members?.length ?? 0} recipients=${recipientIds.size} excludeUserId=${excludeUserId ?? "none"}`);

  if (recipientIds.size === 0) return;

  // Send emails in parallel (fire-and-forget per recipient)
  const promises = Array.from(recipientIds).map(async (userId) => {
    try {
      console.log(`[email/release-email] sending to userId=${userId}`);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.admin.getUserById(userId);

      if (userError) {
        console.error(`[email/release-email] getUserById error for ${userId}:`, userError);
        return;
      }

      if (!user?.email) {
        console.warn(`[email/release-email] no email for userId=${userId}`);
        return;
      }

      const displayName =
        user.user_metadata?.display_name ??
        user.email.split("@")[0];

      // Get unsubscribe token
      const { data: prefs } = await supabase
        .from("email_preferences")
        .select("unsubscribe_token")
        .eq("user_id", userId)
        .maybeSingle();

      const unsubscribeUrl = prefs?.unsubscribe_token
        ? buildUnsubscribeUrl(prefs.unsubscribe_token, category)
        : "";

      const { subject, html } = buildEmail({
        userEmail: user.email,
        displayName,
        unsubscribeUrl,
      });

      await sendTransactionalEmail({
        userId,
        to: user.email,
        category,
        subject,
        html,
      });
    } catch (err) {
      console.error(
        `[email/release-email] failed for user ${userId}:`,
        err,
      );
    }
  });

  await Promise.allSettled(promises);
}
