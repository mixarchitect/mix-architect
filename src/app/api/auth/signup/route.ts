import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { requireSameOrigin } from "@/lib/origin-check";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { drainEmailOutbox } from "@/lib/email/outbox";
import { logActivity } from "@/lib/activity-logger";
import { recordSignupAttribution } from "@/lib/attribution-capture";

/**
 * POST /api/auth/signup
 *
 * Server-side signup so the post-signup side effects (welcome email via the
 * email_outbox seeded by handle_new_user, activity log) run before the
 * response returns — they used to depend on a client-side fetch that carried
 * no session and silently 401'd. The password only transits to Supabase Auth;
 * it is never stored or logged here.
 */
export async function POST(req: NextRequest) {
  const originErr = requireSameOrigin(req);
  if (originErr) return originErr;

  const ip = getClientIp(req);
  const { success } = rateLimit(`signup:${ip}`, 10, 3_600_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { email?: unknown; password?: unknown; fullName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName =
    typeof body.fullName === "string" && body.fullName.trim()
      ? body.fullName.trim()
      : undefined;

  if (!email || !email.includes("@") || !password) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient({ allowCookieWrite: true });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 400 },
    );
  }

  // For an address that already has a confirmed account, Supabase returns an
  // obfuscated user with no identities and no new auth.users row — skip the
  // side effects for it, and the identical response leaks nothing about
  // account existence.
  if (data.user && (data.user.identities?.length ?? 0) > 0) {
    logActivity(data.user.id, "signup", { method: "email" }, {
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    await recordSignupAttribution(req, data.user);
    await drainEmailOutbox({ userId: data.user.id });
  }

  return NextResponse.json({ ok: true, hasSession: !!data.session });
}
