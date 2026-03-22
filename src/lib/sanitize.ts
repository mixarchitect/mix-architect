/**
 * Sanitize a file extension extracted from MIME type or user input.
 * Strips path separators, dots, null bytes, and non-alphanumeric characters.
 * Returns a safe lowercase extension or "bin" as fallback.
 */
export function sanitizeExt(ext: string | undefined): string {
  if (!ext) return "bin";
  const clean = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return clean || "bin";
}

/**
 * Sanitize a slug or path segment to prevent path traversal.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
export function sanitizePathSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 128);
}
