/**
 * Email templates for quote notifications.
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

function unsubscribeFooter(unsubscribeUrl?: string): string {
  return unsubscribeUrl
    ? `<div style="margin-top:12px;font-size:11px"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;text-decoration:underline">Unsubscribe from these emails</a></div>`
    : "";
}

// ─── Quote Received ──────────────────────────────────────────────

export function buildQuoteReceivedEmail(
  {
    engineerName,
    quoteNumber,
    total,
    currency,
    releaseTitle,
    portalUrl,
    unsubscribeUrl,
    documentType = "quote",
  }: {
    engineerName: string;
    quoteNumber: string;
    total: number;
    currency: string;
    releaseTitle?: string;
    portalUrl: string;
    unsubscribeUrl?: string;
    documentType?: "quote" | "invoice";
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

  const docLabel = documentType === "invoice" ? "Invoice" : "Quote";
  const docLabelLower = documentType === "invoice" ? "an invoice" : "a quote";

  return {
    subject: `${docLabel} ${quoteNumber} from ${engineerName}`,
    html: brandedWrap(
      `
      ${heading(`${docLabel} ${escapeHtml(quoteNumber)}`)}
      ${paragraph(`${escapeHtml(engineerName)} has sent you ${docLabelLower}${projectLine}.`)}
      <div style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:6px;border:1px solid #eee">
        <div style="font-size:24px;font-weight:700;color:#1a1a1a">${formattedTotal}</div>
        <div style="font-size:12px;color:#999;margin-top:4px">${escapeHtml(currency)}</div>
      </div>
      ${paragraph(`View the full ${docLabel.toLowerCase()} details and pay online:`)}
      ${brandedCta(`View ${docLabel}`, portalUrl, brand)}
    `,
      brand,
      unsubscribeFooter(unsubscribeUrl),
    ),
  };
}

// ─── Payment Confirmation ────────────────────────────────────────

export function buildPaymentConfirmationEmail(
  {
    clientName,
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
  },
  brand: EmailBrand = DEFAULT_BRAND,
) {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(total);

  const projectLine = releaseTitle
    ? ` for ${escapeHtml(releaseTitle)}`
    : "";

  return {
    subject: `Payment received — ${quoteNumber}`,
    html: brandedWrap(
      `
      ${heading("Payment Received")}
      ${paragraph(`${escapeHtml(clientName)} has paid ${formattedTotal}${projectLine}.`)}
      <div style="margin:16px 0;padding:16px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0">
        <div style="font-size:14px;font-weight:600;color:#166534">Quote ${escapeHtml(quoteNumber)} — Paid</div>
        <div style="font-size:24px;font-weight:700;color:#166534;margin-top:4px">${formattedTotal}</div>
      </div>
      ${paragraph("The payment has been processed and will appear in your Stripe dashboard.")}
    `,
      brand,
      unsubscribeFooter(unsubscribeUrl),
    ),
  };
}
