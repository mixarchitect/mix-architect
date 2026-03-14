/**
 * Client-side fire-and-forget activity logger.
 * Calls the /api/admin/log-activity endpoint.
 */
export function logActivityClient(
  eventType: string,
  metadata?: Record<string, unknown>,
): void {
  fetch("/api/admin/log-activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, metadata }),
  }).catch(() => {
    // Swallow errors — activity logging should never disrupt the user
  });
}
