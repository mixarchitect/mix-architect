/**
 * Start a download by navigating to the file's own URL.
 *
 * Supabase storage answers with `Content-Disposition: attachment` when a
 * signed URL carries a `download` param, so the browser streams the file
 * straight to disk. Fetching it into a Blob first holds the whole lossless
 * file in memory (which kills the tab on phones) and, because the anchor
 * click then happens after an await, iOS no longer treats it as the user's
 * tap and drops it.
 */
export function downloadFromUrl(url: string, fileName: string) {
  const a = document.createElement("a");
  a.download = fileName;
  a.rel = "noopener";
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.pathname.includes("/storage/v1/object/")) {
      parsed.searchParams.set("download", fileName);
      a.href = parsed.toString();
    } else {
      a.href = url;
      a.target = "_blank";
    }
  } catch {
    a.href = url;
    a.target = "_blank";
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}
