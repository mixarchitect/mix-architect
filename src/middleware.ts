import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Build the Content-Security-Policy header value.
 *
 * The previous setup used a per-request nonce + 'strict-dynamic', but
 * RootLayout never read x-nonce or propagated it to <Script> tags, so
 * the nonce did nothing — inline scripts (Google Analytics ga4-init)
 * had no nonce, and the policy was effectively security theater on the
 * verge of silently breaking under any future Next.js streaming
 * change. To wire a working nonce we'd have to make RootLayout dynamic
 * (kills static optimization on marketing/changelog/featured pages).
 *
 * Trade-off taken: drop the nonce, keep the tight origin allowlist,
 * accept 'unsafe-inline' for script-src so the GA init script works.
 * This still blocks scripts from non-allowed origins and prevents
 * framing/object-src; we lose the (already-broken) inline-script
 * protection. When we drop GA or move it to a hash-based approach,
 * remove 'unsafe-inline' here.
 */
function buildCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' js.stripe.com www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: sjdodeauawmuzredpxwa.supabase.co *.mzstatic.com",
    "connect-src 'self' sjdodeauawmuzredpxwa.supabase.co *.supabase.co wss://sjdodeauawmuzredpxwa.supabase.co api.stripe.com www.google-analytics.com *.google-analytics.com *.analytics.google.com",
    "font-src 'self'",
    "frame-src js.stripe.com bandcamp.com *.bandcamp.com",
    "media-src 'self' blob: sjdodeauawmuzredpxwa.supabase.co",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Expose pathname so server components (e.g. app layout) can read it
  response.headers.set("x-next-pathname", request.nextUrl.pathname);

  // Set the enforced CSP
  response.headers.set("Content-Security-Policy", buildCsp());

  // Only run Supabase auth check on /app routes
  if (request.nextUrl.pathname.startsWith("/app")) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from /app routes
    if (!user) {
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png (browser icons)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
