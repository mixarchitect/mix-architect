/**
 * Fire-and-forget notification helper for client components.
 * Calls POST /api/notify — errors are silently logged.
 */
export function sendNotification(params: {
  type: "comment" | "status_change" | "payment_update" | "approval";
  title: string;
  body?: string;
  releaseId: string;
  trackId?: string;
}) {
  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch((err) => console.error("[notify] failed:", err));
}
