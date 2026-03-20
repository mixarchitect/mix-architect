import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Dev-only auto-login route.
 *
 * GET /api/dev-login — signs in with credentials from DEV_LOGIN_EMAIL
 * and DEV_LOGIN_PASSWORD env vars, sets session cookies, and redirects
 * to /app. Only works when NODE_ENV !== "production".
 *
 * Add to .env.local:
 *   DEV_LOGIN_EMAIL=your@email.com
 *   DEV_LOGIN_PASSWORD=yourpassword
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const email = process.env.DEV_LOGIN_EMAIL;
  const password = process.env.DEV_LOGIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      {
        error:
          "Set DEV_LOGIN_EMAIL and DEV_LOGIN_PASSWORD in .env.local to use dev login.",
      },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("next") ?? "/app";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") ?? "";
          return cookieHeader.split(";").filter(Boolean).map((c) => {
            const [name, ...rest] = c.trim().split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: `Login failed: ${error.message}` },
      { status: 401 },
    );
  }

  return response;
}
