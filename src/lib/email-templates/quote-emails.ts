/**
 * Email templates for quote notifications.
 * Follows the same inline HTML pattern as transactional.ts.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(content: string, unsubscribeUrl?: string): string {
  const unsubscribeHtml = unsubscribeUrl
    ? `<div style="margin-top:12px;font-size:11px"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;text-decoration:underline">Unsubscribe from these emails</a></div>`
    : "";

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
    ${unsubscribeHtml}
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function cta(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:10px 24px;background:#0D9488;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.6">${text}</p>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a">${escapeHtml(text)}</h2>`;
}

// ─── Quote Received ──────────────────────────────────────────────

export function buildQuoteReceivedEmail({
  engineerName,
  quoteNumber,
  total,
  currency,
  releaseTitle,
  portalUrl,
  unsubscribeUrl,
}: {
  engineerName: string;
  quoteNumber: string;
  total: number;
  currency: string;
  releaseTitle?: string;
  portalUrl: string;
  unsubscribeUrl?: string;
}) {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total);

  const projectLine = releaseTitle
    ? ` for <strong>${escapeHtml(releaseTitle)}</strong>`
    : "";

  return {
    subject: `Quote ${quoteNumber} from ${engineerName}`,
    html: wrap(
      `
      ${heading(`Quote ${escapeHtml(quoteNumber)}`)}
      ${paragraph(`${escapeHtml(engineerName)} has sent you a quote${projectLine}.`)}
      <div style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:6px;border:1px solid #eee">
        <div style="font-size:24px;font-weight:700;color:#1a1a1a">${formattedTotal}</div>
        <div style="font-size:12px;color:#999;margin-top:4px">${escapeHtml(currency)}</div>
      </div>
      ${paragraph("View the full quote details and pay online:")}
      ${cta("View Quote", portalUrl)}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── Payment Confirmation ────────────────────────────────────────

export function buildPaymentConfirmationEmail({
  clientName,
  engineerName,
  quoteNumber,
  total,
  currency,
  releaseTitle,
  unsubscribeUrl,
}: {
  clientName: string;
  engineerName: string;
  quoteNumber: string;
  total: number;
  currency: string;
  releaseTitle?: string;
  unsubscribeUrl?: string;
}) {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total);

  const projectLine = releaseTitle
    ? ` for ${escapeHtml(releaseTitle)}`
    : "";

  return {
    subject: `Payment received — ${quoteNumber}`,
    html: wrap(
      `
      ${heading("Payment Received")}
      ${paragraph(`${escapeHtml(clientName)} has paid ${formattedTotal}${projectLine}.`)}
      <div style="margin:16px 0;padding:16px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0">
        <div style="font-size:14px;font-weight:600;color:#166534">Quote ${escapeHtml(quoteNumber)} — Paid</div>
        <div style="font-size:24px;font-weight:700;color:#166534;margin-top:4px">${formattedTotal}</div>
      </div>
      ${paragraph("The payment has been processed and will appear in your Stripe dashboard.")}
    `,
      unsubscribeUrl,
    ),
  };
}
