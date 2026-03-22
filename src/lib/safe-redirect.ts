/**
 * Validates that a redirect URL is a safe, same-origin relative path.
 * Blocks protocol-relative URLs, absolute URLs, and other bypass attempts.
 */
export function getSafeRedirectUrl(
  requestedUrl: string | null,
  fallback: string = "/app",
): string {
  if (!requestedUrl) return fallback;

  if (
    !requestedUrl.startsWith("/") ||
    requestedUrl.startsWith("//") ||
    requestedUrl.includes("\\") ||
    requestedUrl.includes("\0")
  ) {
    return fallback;
  }

  return requestedUrl;
}
