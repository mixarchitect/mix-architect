/**
 * Email template for admin-initiated notifications.
 * Used for churn outreach, welcome messages, and custom admin emails.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
<tr><td style="padding:32px 40px">
  <div style="font-size:14px;font-weight:600;color:#0D9488;margin-bottom:24px">MIX ARCHITECT</div>
  ${content}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999">
    Sent by <a href="https://mixarchitect.com" style="color:#0D9488;text-decoration:none">Mix Architect</a>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

type AdminEmailParams = {
  subject: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function buildAdminEmail({
  subject,
  heading,
  body,
  ctaLabel,
  ctaUrl,
}: AdminEmailParams) {
  const bodyHtml = escapeHtml(body)
    .split("\n")
    .map((line) => `<p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.6">${line}</p>`)
    .join("");

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;margin-top:8px;padding:10px 24px;background:#0D9488;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">${escapeHtml(ctaLabel)}</a>`
      : "";

  return {
    subject,
    html: wrap(`
      <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a">${escapeHtml(heading)}</h2>
      ${bodyHtml}
      ${ctaHtml}
    `),
  };
}
