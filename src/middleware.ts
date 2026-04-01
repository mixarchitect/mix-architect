import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Generate a random nonce for CSP inline scripts. */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/** Build the Content-Security-Policy header value with a per-request nonce. */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: sjdodeauawmuzredpxwa.supabase.co",
    "connect-src 'self' sjdodeauawmuzredpxwa.supabase.co *.supabase.co api.stripe.com",
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
  // Generate a per-request nonce for CSP
  const nonce = generateNonce();

  const requestHeaders = new Headers(request.headers);
  // Pass nonce to server components via request header
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Expose pathname so server components (e.g. app layout) can read it
  response.headers.set("x-next-pathname", request.nextUrl.pathname);

  // Set the enforced CSP with the nonce
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

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
