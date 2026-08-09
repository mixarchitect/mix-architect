import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";
import { drainEmailOutbox } from "@/lib/email/outbox";
import { recordSignupAttribution } from "@/lib/attribution-capture";

/**
 * Supabase Auth callback handler.
 *
 * When a user clicks the confirmation link in a Supabase email
 * (sign-up confirmation, magic link, password reset, etc.),
 * Supabase redirects here with a `code` query parameter.
 * We exchange that code for a session, then redirect the user
 * into the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectUrl(searchParams.get("next"));

  // Supabase appends these to the redirect when an upstream link/OAuth step
  // fails (e.g. an expired confirmation link → error_code=otp_expired).
  const inboundErrorCode = searchParams.get("error_code");

  if (code) {
    const response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // First authenticated server touchpoint for email-confirmation and
      // OAuth signups — deliver any pending welcome email and record signup
      // attribution now. Neither blocks the redirect: both helpers catch
      // their own errors, and attribution skips accounts older than an hour.
      if (data.user) {
        await recordSignupAttribution(request, data.user);
        await drainEmailOutbox({ userId: data.user.id });
      }
      return response;
    }
  }

  // If no code or exchange failed, redirect to sign-in with an error hint.
  // Preserve "link expired" specifically so the page can offer a resend.
  const signInUrl = new URL("/auth/sign-in", request.url);
  signInUrl.searchParams.set(
    "error",
    inboundErrorCode === "otp_expired" ? "link_expired" : "auth_failed",
  );
  return NextResponse.redirect(signInUrl);
}
