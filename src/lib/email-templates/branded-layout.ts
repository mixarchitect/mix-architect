/**
 * Shared HTML email layout. Renders the outer shell, header, and footer with an
 * optional per-workspace brand (Studio white-label). Falls back to Mix Architect
 * chrome via DEFAULT_BRAND so non-branded callers render exactly as before.
 *
 * The brand is resolved server-side by getWorkspaceEmailBrand() in
 * src/lib/email/workspace-sender.ts — only Studio workspaces (removePoweredBy)
 * get a non-default brand.
 */

export type EmailBrand = {
  /** Studio name, or "Mix Architect" for the default. */
  name: string;
  /** Public URL of the studio logo (light variant), or null to render the name. */
  logoUrl: string | null;
  /** Accent hex (#RRGGBB) for the header text and neutral CTAs. */
  accent: string;
  /** When true, the footer credits Mix Architect; when false, it credits `name`. */
  showPoweredBy: boolean;
};

export const DEFAULT_BRAND: EmailBrand = {
  name: "Mix Architect",
  logoUrl: null,
  accent: "#0D9488",
  showPoweredBy: true,
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap body `content` in the branded shell. `footerExtra` appends inside the
 * footer block (e.g. an unsubscribe link).
 */
export function brandedWrap(
  content: string,
  brand: EmailBrand = DEFAULT_BRAND,
  footerExtra = "",
): string {
  const header = brand.logoUrl
    ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${escapeHtml(brand.name)}" style="max-height:40px;max-width:220px;margin-bottom:24px;display:block">`
    : `<div style="font-size:14px;font-weight:600;color:${brand.accent};margin-bottom:24px;text-transform:uppercase;letter-spacing:0.04em">${escapeHtml(brand.name)}</div>`;

  const attribution = brand.showPoweredBy
    ? `Sent by <a href="https://mixarchitect.com" style="color:${brand.accent};text-decoration:none">Mix Architect</a>`
    : `Sent by ${escapeHtml(brand.name)}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
<tr><td style="padding:32px 40px">
  ${header}
  ${content}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999">
    ${attribution}
    ${footerExtra}
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** A solid button in the brand accent (white label text). */
export function brandedCta(
  label: string,
  url: string,
  brand: EmailBrand = DEFAULT_BRAND,
): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:10px 24px;background:${brand.accent};color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a>`;
}

export function heading(text: string): string {
  return `<h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a">${escapeHtml(text)}</h2>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.6">${text}</p>`;
}
