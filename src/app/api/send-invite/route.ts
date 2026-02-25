import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildInviteHtml({
  inviterEmail,
  releaseTitle,
  role,
  appUrl,
}: {
  inviterEmail: string;
  releaseTitle: string;
  role: string;
  appUrl: string;
}) {
  const safeInviter = escapeHtml(inviterEmail);
  const safeTitle = escapeHtml(releaseTitle);
  const roleLabel = role === "collaborator" ? "Collaborator" : "Client";
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
          <h1 style="margin:0 0 16px;font-size:20px;color:#18181b;">You&rsquo;ve been invited to collaborate</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46;">
            <strong>${safeInviter}</strong> has invited you as a <strong>${roleLabel}</strong> on the release <strong>&ldquo;${safeTitle}&rdquo;</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#71717a;">
            Sign in or create an account to view the project and start collaborating.
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

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, role, releaseTitle, inviterEmail, releaseId } = body as {
    email?: string;
    role?: string;
    releaseTitle?: string;
    inviterEmail?: string;
    releaseId?: string;
  };

  if (!email || !role || !releaseTitle || !inviterEmail || !releaseId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Authenticate caller
  const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller owns the release
  const { data: release } = await supabase
    .from("releases")
    .select("id")
    .eq("id", releaseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!release) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Send email
  const appUrl = new URL(request.url).origin;

  try {
    await resend.emails.send({
      from: "Mix Architect <team@mixarchitect.com>",
      to: email,
      subject: `You've been invited to collaborate on "${releaseTitle}"`,
      html: buildInviteHtml({ inviterEmail, releaseTitle, role, appUrl }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to send invite email:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
