import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

export type ActivityEventType =
  | "signup"
  | "login"
  | "release_created"
  | "track_uploaded"
  | "collaborator_invited"
  | "subscription_started"
  | "subscription_cancelled"
  | "subscription_renewed"
  | "payment_failed"
  | "export_requested"
  | "conversion_completed"
  | "comp_account_granted"
  | "comp_account_revoked"
  | "attribution_click"
  | "attribution_signup";

/**
 * Log a user activity event. Fire-and-forget on the server side.
 * Uses the service role client to bypass RLS.
 */
export function logActivity(
  userId: string,
  eventType: ActivityEventType,
  metadata?: Record<string, unknown>,
  requestInfo?: { ip?: string; userAgent?: string },
): void {
  const supabase = createSupabaseServiceClient();
  supabase
    .from("admin_activity_log")
    .insert({
      user_id: userId,
      event_type: eventType,
      event_metadata: metadata ?? {},
      ...(requestInfo?.ip && { ip_address: requestInfo.ip }),
      ...(requestInfo?.userAgent && { user_agent: requestInfo.userAgent }),
    })
    .then(({ error }) => {
      if (error) console.error("[activity-logger] Failed to log event:", error.message);
    });
}
