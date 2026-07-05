/**
 * Email templates for workflow-triggered emails (client-facing).
 * Branded per workspace (Studio white-label) via the shared layout.
 */

import {
  brandedWrap,
  brandedCta,
  escapeHtml,
  heading,
  paragraph,
  DEFAULT_BRAND,
  type EmailBrand,
} from "./branded-layout";

// ─── Thank You ───────────────────────────────────────────────────

export function buildThankYouEmail(
  {
    engineerName,
    clientName,
    releaseTitle,
  }: {
    engineerName: string;
    clientName: string;
    releaseTitle: string;
  },
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `Thank you — ${releaseTitle}`,
    html: brandedWrap(
      `
      ${heading(`Thank you, ${escapeHtml(clientName)}!`)}
      ${paragraph(`Thank you for working with ${escapeHtml(engineerName)} on <strong>${escapeHtml(releaseTitle)}</strong>. We hope you're happy with the result!`)}
      ${paragraph("If you have any feedback or need anything else, don't hesitate to reach out.")}
    `,
      brand,
    ),
  };
}

// ─── Testimonial Request ─────────────────────────────────────────

export function buildTestimonialRequestEmail(
  {
    engineerName,
    clientName,
    releaseTitle,
  }: {
    engineerName: string;
    clientName: string;
    releaseTitle: string;
  },
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `How was your experience? — ${releaseTitle}`,
    html: brandedWrap(
      `
      ${heading("How was your experience?")}
      ${paragraph(`Hi ${escapeHtml(clientName)},`)}
      ${paragraph(`Now that <strong>${escapeHtml(releaseTitle)}</strong> is complete, we'd love to hear your feedback. How was your experience working with ${escapeHtml(engineerName)}?`)}
      ${paragraph("A quick testimonial would mean the world — just reply to this email with your thoughts!")}
    `,
      brand,
    ),
  };
}

// ─── Payment Reminder ────────────────────────────────────────────

export function buildPaymentReminderWorkflowEmail(
  {
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
  },
  brand: EmailBrand = DEFAULT_BRAND,
) {
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
    html: brandedWrap(
      `
      ${heading("Payment Reminder")}
      ${paragraph(`Friendly reminder: Quote ${escapeHtml(quoteNumber)}${projectLine} is outstanding.`)}
      <div style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:6px;border:1px solid #eee">
        <div style="font-size:20px;font-weight:700;color:#1a1a1a">${formattedTotal}</div>
        <div style="font-size:12px;color:#999;margin-top:4px">${escapeHtml(currency)}${dueLine}</div>
      </div>
      ${brandedCta("Pay Now", portalUrl, brand)}
    `,
      brand,
    ),
  };
}
