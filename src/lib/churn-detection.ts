import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

export type ChurnSignalType =
  | "subscription_cancelled"
  | "payment_failed"
  | "downgraded"
  | "inactive";

export type ChurnSeverity = "low" | "medium" | "high";

/**
 * Create a churn signal. Fire-and-forget using service role client.
 */
export function createChurnSignal(
  userId: string,
  signalType: ChurnSignalType,
  severity: ChurnSeverity,
  details?: Record<string, unknown>,
): void {
  const supabase = createSupabaseServiceClient();
  supabase
    .from("admin_churn_signals")
    .insert({
      user_id: userId,
      signal_type: signalType,
      severity,
      details: details ?? {},
      resolved: false,
    })
    .then(({ error }) => {
      if (error) console.error("[churn-detection] Failed to create signal:", error.message);
    });
}

/**
 * Resolve all open churn signals for a user (e.g. when they renew).
 */
export function resolveChurnSignals(userId: string): void {
  const supabase = createSupabaseServiceClient();
  supabase
    .from("admin_churn_signals")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("resolved", false)
    .then(({ error }) => {
      if (error) console.error("[churn-detection] Failed to resolve signals:", error.message);
    });
}
