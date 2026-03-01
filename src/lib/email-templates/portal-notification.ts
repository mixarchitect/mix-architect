/**
 * Email templates for portal notification events.
 * Follows the same HTML structure pattern as send-invite.
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
  <div style="font-size:14px;font-weight:600;color:#D9AF30;margin-bottom:24px">MIX ARCHITECT</div>
  ${content}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999">
    Sent by <a href="https://mixarchitect.com" style="color:#D9AF30;text-decoration:none">Mix Architect</a>
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

type NewVersionParams = {
  releaseTitle: string;
  trackTitle: string;
  portalUrl: string;
};

export function buildNewVersionEmail({ releaseTitle, trackTitle, portalUrl }: NewVersionParams) {
  return {
    subject: `New version ready for review — ${escapeHtml(trackTitle)}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">New version ready for review</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        A new version of <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong> is ready for your review.
      </p>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#D9AF30;color:#1a1a1a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        Review on Portal
      </a>
    `),
  };
}

type ApprovalParams = {
  releaseTitle: string;
  trackTitle: string;
  actorName: string;
  portalUrl: string;
};

export function buildTrackApprovedEmail({ releaseTitle, trackTitle, actorName, portalUrl }: ApprovalParams) {
  return {
    subject: `Track approved — ${escapeHtml(trackTitle)}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Track approved</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        <strong>${escapeHtml(actorName)}</strong> approved
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong>.
      </p>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#22C55E;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        View Portal
      </a>
    `),
  };
}

type ChangesParams = {
  releaseTitle: string;
  trackTitle: string;
  actorName: string;
  note: string;
  portalUrl: string;
};

export function buildChangesRequestedEmail({ releaseTitle, trackTitle, actorName, note, portalUrl }: ChangesParams) {
  return {
    subject: `Changes requested — ${escapeHtml(trackTitle)}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Changes requested</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#666">
        <strong>${escapeHtml(actorName)}</strong> requested changes on
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong>:
      </p>
      <div style="margin:0 0 16px;padding:12px 16px;background:#f9f5f0;border-left:3px solid #D9AF30;border-radius:4px;font-size:14px;color:#333;line-height:1.5">
        ${escapeHtml(note)}
      </div>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#D9AF30;color:#1a1a1a;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        View Portal
      </a>
    `),
  };
}

type DeliveredParams = {
  releaseTitle: string;
  trackTitle: string;
  portalUrl: string;
};

export function buildTrackDeliveredEmail({ releaseTitle, trackTitle, portalUrl }: DeliveredParams) {
  return {
    subject: `Track delivered — ${escapeHtml(trackTitle)}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Track delivered</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#666">
        <strong>${escapeHtml(trackTitle)}</strong> on
        <strong>${escapeHtml(releaseTitle)}</strong> has been marked as delivered.
      </p>
      <a href="${escapeHtml(portalUrl)}" style="display:inline-block;padding:10px 24px;background:#3B82F6;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px">
        View Portal
      </a>
    `),
  };
}
