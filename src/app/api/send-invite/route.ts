import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { requireSameOrigin } from "@/lib/origin-check";
import {
  getWorkspaceSenderFrom,
  getWorkspaceEmailBrand,
  getWorkspaceReplyTo,
} from "@/lib/email/workspace-sender";
import {
  brandedWrap,
  brandedCta,
  escapeHtml,
  heading,
  paragraph,
  DEFAULT_BRAND,
  type EmailBrand,
} from "@/lib/email-templates/branded-layout";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

function buildInviteHtml(
  {
    inviterEmail,
    releaseTitle,
    role,
    appUrl,
  }: {
    inviterEmail: string;
    releaseTitle: string;
    role: string;
    appUrl: string;
  },
  brand: EmailBrand = DEFAULT_BRAND,
) {
  const roleLabel = role === "collaborator" ? "Collaborator" : "Client";
  const signInUrl = `${appUrl}/auth/sign-in`;

  return brandedWrap(
    `
      ${heading("You've been invited to collaborate")}
      ${paragraph(`<strong>${escapeHtml(inviterEmail)}</strong> has invited you as a <strong>${roleLabel}</strong> on the release <strong>&ldquo;${escapeHtml(releaseTitle)}&rdquo;</strong>.`)}
      ${paragraph("Sign in or create an account to view the project and start collaborating.")}
      ${brandedCta("Accept invitation", signInUrl, brand)}
    `,
    brand,
  );
}

export async function POST(request: NextRequest) {
  const originErr = requireSameOrigin(request);
  if (originErr) return originErr;

  const ip = getClientIp(request);
  const { success } = rateLimit(`invite:${ip}`, 10, 60_000);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, role, releaseTitle, releaseId } = body as {
    email?: string;
    role?: string;
    releaseTitle?: string;
    releaseId?: string;
  };

  if (!email || !role || !releaseTitle || !releaseId) {
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
    .select("id, workspace_id")
    .eq("id", releaseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!release) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Send email. Inviter identity comes from the session — a body-supplied
  // inviterEmail would let any authenticated user impersonate someone else
  // in the invite.
  const inviterEmail = user.email ?? "A collaborator";
  const appUrl = new URL(request.url).origin;
  const brand = await getWorkspaceEmailBrand(release.workspace_id);

  try {
    await resend.emails.send({
      from: await getWorkspaceSenderFrom(release.workspace_id),
      replyTo: await getWorkspaceReplyTo(release.workspace_id),
      to: email,
      subject: `You've been invited to collaborate on "${releaseTitle}"`,
      html: buildInviteHtml({ inviterEmail, releaseTitle, role, appUrl }, brand),
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
