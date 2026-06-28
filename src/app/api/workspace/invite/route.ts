import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import { getEntitlements } from "@/lib/entitlements";
import { getWorkspaceSenderFrom } from "@/lib/email/workspace-sender";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const ALLOWED_ROLES = ["admin", "engineer", "viewer"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildWorkspaceInviteHtml({
  inviterEmail,
  workspaceName,
  role,
  appUrl,
}: {
  inviterEmail: string;
  workspaceName: string;
  role: string;
  appUrl: string;
}) {
  const safeInviter = escapeHtml(inviterEmail);
  const safeWorkspace = escapeHtml(workspaceName);
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const signInUrl = `${appUrl}/auth/sign-in`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;margin-bottom:16px;">Mix Architect</div>
          <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">You&rsquo;ve been added to a team</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
            <strong>${safeInviter}</strong> has invited you to join <strong>${safeWorkspace}</strong> on Mix Architect as a <strong>${roleLabel}</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#71717a;">
            Sign in or create an account with this email address to access the team&rsquo;s releases.
          </p>
          <a href="${signInUrl}" style="display:inline-block;padding:10px 24px;background:#18181b;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:6px;">
            Open Mix Architect
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">
            You received this email because ${safeInviter} invited you on
            <a href="${appUrl}" style="color:#a1a1aa;">mixarchitect.com</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * POST /api/workspace/invite
 * Invite a member to the caller's Studio workspace by email.
 * Body: { email: string, role: "admin" | "engineer" | "viewer" }
 *
 * Studio is gated here (at invite time), not in RLS — per the A2 design,
 * RLS stays plan-agnostic so a billing blip can't revoke team access.
 */
export async function POST(request: NextRequest) {
  const originErr = requireSameOrigin(request);
  if (originErr) return originErr;

  const ip = getClientIp(request);
  const { success } = rateLimit(`ws-invite:${ip}`, 20, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "");

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve the caller's workspace (they must be the owner to invite).
  const { data: ws } = await supabase
    .from("workspaces")
    .select("id, name, plan")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!ws) {
    return NextResponse.json({ error: "No workspace found." }, { status: 404 });
  }

  // Studio gate (at invite time).
  if (!getEntitlements(ws.plan).teamWorkspace) {
    return NextResponse.json(
      { error: "Team members are a Studio feature. Upgrade to invite teammates." },
      { status: 403 },
    );
  }

  if (email === (user.email ?? "").toLowerCase()) {
    return NextResponse.json({ error: "You're already the owner of this workspace." }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  // Already invited / a member?
  const { data: existing } = await service
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", ws.id)
    .eq("invited_email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "That email is already a member or invited." }, { status: 409 });
  }

  // Create the pending membership (user_id NULL until they sign in and
  // claim_pending_invites() runs).
  const { error: insertErr } = await service.from("workspace_members").insert({
    workspace_id: ws.id,
    invited_email: email,
    role,
    user_id: null,
  });
  if (insertErr) {
    console.error("[workspace/invite] insert failed:", insertErr);
    return NextResponse.json({ error: "Failed to create the invite." }, { status: 500 });
  }

  // Send the invite email (best-effort — the membership is already created,
  // and the invitee will be claimed on sign-in regardless).
  try {
    await resend.emails.send({
      from: await getWorkspaceSenderFrom(ws.id),
      to: email,
      subject: `You've been added to ${ws.name || "a team"} on Mix Architect`,
      html: buildWorkspaceInviteHtml({
        inviterEmail: user.email ?? "A teammate",
        workspaceName: ws.name || "a team",
        role,
        appUrl: new URL(request.url).origin,
      }),
    });
  } catch (err) {
    console.error("[workspace/invite] email send failed (member still created):", err);
  }

  return NextResponse.json({ success: true });
}
