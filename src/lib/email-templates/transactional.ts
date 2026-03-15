/**
 * Transactional email templates for automated user lifecycle emails.
 * Follows the same inline HTML pattern as admin-notification.ts.
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

// ─── 1. Welcome ──────────────────────────────────────────────────────

export function buildWelcomeEmail({
  displayName,
  unsubscribeUrl,
}: {
  displayName: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: "Welcome to Mix Architect",
    html: wrap(
      `
      ${heading(`Welcome, ${displayName}!`)}
      ${paragraph("Thanks for joining Mix Architect. Here's what you can do:")}
      <ul style="margin:8px 0 16px;padding-left:20px;font-size:14px;color:#666;line-height:1.8">
        <li>Upload and organize tracks for your releases</li>
        <li>Share review portals with clients and collaborators</li>
        <li>Track distribution status across streaming platforms</li>
        <li>Get real-time feedback with timestamped comments</li>
      </ul>
      ${cta("Go to Dashboard", "https://mixarchitect.com/app")}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 2. Release Live ─────────────────────────────────────────────────

export function buildReleaseLiveEmail({
  releaseTitle,
  platformLabel,
  externalUrl,
  appUrl,
  unsubscribeUrl,
}: {
  releaseTitle: string;
  platformLabel: string;
  externalUrl?: string;
  appUrl: string;
  unsubscribeUrl?: string;
}) {
  const linkHtml = externalUrl
    ? `${paragraph(`<a href="${escapeHtml(externalUrl)}" style="color:#0D9488;text-decoration:none">Listen on ${escapeHtml(platformLabel)} &#8594;</a>`)}`
    : "";

  return {
    subject: `${releaseTitle} is now live on ${platformLabel}`,
    html: wrap(
      `
      ${heading(`${releaseTitle} is live!`)}
      ${paragraph(`Your release is now available on <strong style="color:#1a1a1a">${escapeHtml(platformLabel)}</strong>.`)}
      ${linkHtml}
      ${cta("View Release", appUrl)}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 3. New Comment ──────────────────────────────────────────────────

export function buildNewCommentEmail({
  releaseTitle,
  trackTitle,
  commentAuthor,
  commentPreview,
  appUrl,
  unsubscribeUrl,
}: {
  releaseTitle: string;
  trackTitle: string;
  commentAuthor: string;
  commentPreview: string;
  appUrl: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: `New comment on "${trackTitle}" from ${commentAuthor}`,
    html: wrap(
      `
      ${heading("New Comment")}
      ${paragraph(`<strong style="color:#1a1a1a">${escapeHtml(commentAuthor)}</strong> commented on <strong style="color:#1a1a1a">${escapeHtml(trackTitle)}</strong> in ${escapeHtml(releaseTitle)}:`)}
      <div style="margin:12px 0;padding:12px 16px;background:#f9fafb;border-left:3px solid #0D9488;border-radius:0 4px 4px 0;font-size:14px;color:#666;line-height:1.6">
        ${escapeHtml(commentPreview)}
      </div>
      ${cta("View Comment", appUrl)}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 4. Payment Reminder ─────────────────────────────────────────────

export function buildPaymentReminderEmail({
  displayName,
  appUrl,
  unsubscribeUrl,
}: {
  displayName: string;
  appUrl: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: "Action needed: payment issue with your Mix Architect subscription",
    html: wrap(
      `
      ${heading("Payment Issue")}
      ${paragraph(`Hi ${escapeHtml(displayName)}, we were unable to process your latest subscription payment.`)}
      ${paragraph("Please update your payment method to avoid any interruption to your Pro features.")}
      ${cta("Update Payment", appUrl)}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 5. Payment Received ─────────────────────────────────────────────

export function buildPaymentReceivedEmail({
  displayName,
  amount,
  periodEnd,
  unsubscribeUrl,
}: {
  displayName: string;
  amount: string;
  periodEnd: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: "Payment received for Mix Architect Pro",
    html: wrap(
      `
      ${heading("Payment Confirmed")}
      ${paragraph(`Hi ${escapeHtml(displayName)}, we've received your payment of <strong style="color:#1a1a1a">${escapeHtml(amount)}</strong>.`)}
      ${paragraph(`Your next billing date is <strong style="color:#1a1a1a">${escapeHtml(periodEnd)}</strong>.`)}
      ${paragraph("Thank you for being a Pro subscriber!")}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 6. Weekly Digest ────────────────────────────────────────────────

export type DigestStats = {
  newComments: number;
  audioUploads: number;
  statusChanges: number;
  newCollaborators: number;
};

export function buildWeeklyDigestEmail({
  displayName,
  stats,
  appUrl,
  unsubscribeUrl,
}: {
  displayName: string;
  stats: DigestStats;
  appUrl: string;
  unsubscribeUrl?: string;
}) {
  const lines: string[] = [];
  if (stats.newComments > 0)
    lines.push(`${stats.newComments} new comment${stats.newComments !== 1 ? "s" : ""}`);
  if (stats.audioUploads > 0)
    lines.push(`${stats.audioUploads} audio upload${stats.audioUploads !== 1 ? "s" : ""}`);
  if (stats.statusChanges > 0)
    lines.push(`${stats.statusChanges} status change${stats.statusChanges !== 1 ? "s" : ""}`);
  if (stats.newCollaborators > 0)
    lines.push(`${stats.newCollaborators} new collaborator${stats.newCollaborators !== 1 ? "s" : ""}`);

  const statsHtml = lines
    .map((line) => `<li style="margin-bottom:4px">${escapeHtml(line)}</li>`)
    .join("");

  return {
    subject: "Your weekly Mix Architect summary",
    html: wrap(
      `
      ${heading(`Weekly Summary`)}
      ${paragraph(`Hi ${escapeHtml(displayName)}, here's what happened across your releases this week:`)}
      <ul style="margin:8px 0 16px;padding-left:20px;font-size:14px;color:#666;line-height:1.8">
        ${statsHtml}
      </ul>
      ${cta("Go to Dashboard", appUrl)}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 7. Subscription Confirmed ───────────────────────────────────────

export function buildSubscriptionConfirmedEmail({
  displayName,
  plan,
  unsubscribeUrl,
}: {
  displayName: string;
  plan: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: `Welcome to Mix Architect ${plan}!`,
    html: wrap(
      `
      ${heading(`You're on ${plan}!`)}
      ${paragraph(`Hi ${escapeHtml(displayName)}, your subscription is now active. Here's what's unlocked:`)}
      <ul style="margin:8px 0 16px;padding-left:20px;font-size:14px;color:#666;line-height:1.8">
        <li>Unlimited releases and tracks</li>
        <li>Advanced audio conversion tools</li>
        <li>Distribution tracking across all platforms</li>
        <li>Priority support</li>
      </ul>
      ${cta("Start Creating", "https://mixarchitect.com/app")}
    `,
      unsubscribeUrl,
    ),
  };
}

// ─── 8. Subscription Cancelled ───────────────────────────────────────

export function buildSubscriptionCancelledEmail({
  displayName,
  periodEnd,
  unsubscribeUrl,
}: {
  displayName: string;
  periodEnd: string;
  unsubscribeUrl?: string;
}) {
  return {
    subject: "Your Mix Architect subscription has been cancelled",
    html: wrap(
      `
      ${heading("Subscription Cancelled")}
      ${paragraph(`Hi ${escapeHtml(displayName)}, your subscription has been cancelled.`)}
      ${paragraph(`You'll continue to have access to Pro features until <strong style="color:#1a1a1a">${escapeHtml(periodEnd)}</strong>.`)}
      ${paragraph("If you change your mind, you can resubscribe at any time.")}
      ${cta("Resubscribe", "https://mixarchitect.com/app/settings")}
    `,
      unsubscribeUrl,
    ),
  };
}
