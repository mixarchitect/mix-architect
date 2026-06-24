import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";

/**
 * Supabase email-link confirmation handler (token_hash / verifyOtp flow).
 *
 * Email templates link here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app
 *
 * Unlike the PKCE `code` exchange used by /auth/callback (OAuth), `verifyOtp`
 * with a `token_hash` does NOT require the code-verifier cookie from the browser
 * that started sign-up. That makes confirmation work when the link is opened in
 * a different browser/app than the one used to register, or after an email
 * security scanner pre-fetches it — the two main reasons email confirmation was
 * failing with the old `code` flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeRedirectUrl(searchParams.get("next"));

  if (tokenHash && type) {
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

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return response;
    }
  }

  // Missing / expired / already-used token. Send the user somewhere they can
  // request a fresh link: recovery (password reset) links go back to
  // forgot-password; everything else (signup confirmation, etc.) to sign-in.
  const failurePath =
    type === "recovery" ? "/auth/forgot-password" : "/auth/sign-in";
  const failureUrl = new URL(failurePath, request.url);
  failureUrl.searchParams.set("error", "link_expired");
  return NextResponse.redirect(failureUrl);
}
