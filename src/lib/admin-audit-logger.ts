import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

/**
 * Log an admin action to the admin_audit_log table.
 * Fire-and-forget: errors are caught and logged but never thrown.
 */
export function logAdminAction(
  adminId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = createSupabaseServiceClient();
  supabase
    .from("admin_audit_log")
    .insert({
      admin_id: adminId,
      action,
      action_metadata: metadata ?? {},
    })
    .then(({ error }) => {
      if (error) {
        console.error("[admin-audit] Failed to log:", error.message);
      }
    });
}
