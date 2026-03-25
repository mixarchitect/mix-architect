/**
 * Email templates for workflow-triggered emails.
 * Follows the same inline HTML pattern as transactional.ts.
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

function cta(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:10px 24px;background:#0D9488;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.6">${text}</p>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a">${escapeHtml(text)}</h2>`;
}

// ─── Thank You ───────────────────────────────────────────────────

export function buildThankYouEmail({
  engineerName,
  clientName,
  releaseTitle,
}: {
  engineerName: string;
  clientName: string;
  releaseTitle: string;
}) {
  return {
    subject: `Thank you — ${releaseTitle}`,
    html: wrap(`
      ${heading(`Thank you, ${escapeHtml(clientName)}!`)}
      ${paragraph(`Thank you for working with ${escapeHtml(engineerName)} on <strong>${escapeHtml(releaseTitle)}</strong>. We hope you're happy with the result!`)}
      ${paragraph("If you have any feedback or need anything else, don't hesitate to reach out.")}
    `),
  };
}

// ─── Testimonial Request ─────────────────────────────────────────

export function buildTestimonialRequestEmail({
  engineerName,
  clientName,
  releaseTitle,
}: {
  engineerName: string;
  clientName: string;
  releaseTitle: string;
}) {
  return {
    subject: `How was your experience? — ${releaseTitle}`,
    html: wrap(`
      ${heading("How was your experience?")}
      ${paragraph(`Hi ${escapeHtml(clientName)},`)}
      ${paragraph(`Now that <strong>${escapeHtml(releaseTitle)}</strong> is complete, we'd love to hear your feedback. How was your experience working with ${escapeHtml(engineerName)}?`)}
      ${paragraph("A quick testimonial would mean the world — just reply to this email with your thoughts!")}
    `),
  };
}

// ─── Payment Reminder ────────────────────────────────────────────

export function buildPaymentReminderWorkflowEmail({
  engineerName,
  quoteNumber,
  total,
  currency,
  releaseTitle,
  portalUrl,
  dueDate,
}: {
  engineerName: string;
  quoteNumber: string;
  total: number;
  currency: string;
  releaseTitle?: string | null;
  portalUrl: string;
  dueDate?: string | null;
}) {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total);

  const projectLine = releaseTitle
    ? ` for <strong>${escapeHtml(releaseTitle)}</strong>`
    : "";

  const dueLine = dueDate
    ? `<br>Due date: ${new Date(dueDate).toLocaleDateString()}`
    : "";

  return {
    subject: `Payment reminder — Quote ${quoteNumber}`,
    html: wrap(`
      ${heading("Payment Reminder")}
      ${paragraph(`Friendly reminder: Quote ${escapeHtml(quoteNumber)}${projectLine} is outstanding.`)}
      <div style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:6px;border:1px solid #eee">
        <div style="font-size:20px;font-weight:700;color:#1a1a1a">${formattedTotal}</div>
        <div style="font-size:12px;color:#999;margin-top:4px">${escapeHtml(currency)}${dueLine}</div>
      </div>
      ${cta("Pay Now", portalUrl)}
    `),
  };
}
