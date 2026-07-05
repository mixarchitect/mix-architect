/**
 * Email templates for portal notification events.
 * Header/footer/neutral CTAs are branded per workspace (Studio white-label);
 * approved/delivered keep their semantic status colors.
 */

import {
  brandedWrap,
  brandedCta,
  escapeHtml,
  DEFAULT_BRAND,
  type EmailBrand,
} from "./branded-layout";

type NewVersionParams = {
  releaseTitle: string;
  trackTitle: string;
  portalUrl: string;
};

export function buildNewVersionEmail(
  { releaseTitle, trackTitle, portalUrl }: NewVersionParams,
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `New version ready for review — ${escapeHtml(trackTitle)}`,
    html: brandedWrap(
      `
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">New version ready for review</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        A new version of <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong> is ready for your review.
      </p>
      ${brandedCta("Review on Portal", portalUrl, brand)}
    `,
      brand,
    ),
  };
}

type ApprovalParams = {
  releaseTitle: string;
  trackTitle: string;
  actorName: string;
  portalUrl: string;
};

export function buildTrackApprovedEmail(
  { releaseTitle, trackTitle, actorName, portalUrl }: ApprovalParams,
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `Track approved — ${escapeHtml(trackTitle)}`,
    html: brandedWrap(
      `
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Track approved</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        <strong>${escapeHtml(actorName)}</strong> approved
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong>.
      </p>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#22C55E;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        View Portal
      </a>
    `,
      brand,
    ),
  };
}

type ChangesParams = {
  releaseTitle: string;
  trackTitle: string;
  actorName: string;
  note: string;
  portalUrl: string;
};

export function buildChangesRequestedEmail(
  { releaseTitle, trackTitle, actorName, note, portalUrl }: ChangesParams,
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `Changes requested — ${escapeHtml(trackTitle)}`,
    html: brandedWrap(
      `
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Changes requested</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#666">
        <strong>${escapeHtml(actorName)}</strong> requested changes on
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong>:
      </p>
      <div style="margin:0 0 16px;padding:12px 16px;background:#f9f5f0;border-left:3px solid ${brand.accent};border-radius:4px;font-size:14px;color:#333;line-height:1.5">
        ${escapeHtml(note)}
      </div>
      ${brandedCta("View Portal", portalUrl, brand)}
    `,
      brand,
    ),
  };
}

type DeliveredParams = {
  releaseTitle: string;
  trackTitle: string;
  portalUrl: string;
};

export function buildTrackDeliveredEmail(
  { releaseTitle, trackTitle, portalUrl }: DeliveredParams,
  brand: EmailBrand = DEFAULT_BRAND,
) {
  return {
    subject: `Track delivered — ${escapeHtml(trackTitle)}`,
    html: brandedWrap(
      `
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Track delivered</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong> has been marked as delivered.
      </p>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#3B82F6;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        View Portal
      </a>
    `,
      brand,
    ),
  };
}
