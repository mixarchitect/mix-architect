// src/lib/supabaseServerClient.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client for App Router.
// Pass allowCookieWrite=true only in Route Handlers/Server Actions where writes are permitted.
export async function createSupabaseServerClient(options: { allowCookieWrite?: boolean } = {}) {
  const { allowCookieWrite = false } = options;

  // In Next 16 cookies() is async
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Supabase now expects getAll / setAll, not get / set / remove
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Avoid cookie writes when running inside RSC/layouts (they throw).
        if (!allowCookieWrite) return;

        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // The runtime accepts name, value, options; cast to avoid TS noise
            (cookieStore as unknown as {
              set: (name: string, value: string, options?: CookieOptions) => void;
            }).set(name, value, options);
          });
        } catch {
          // Swallow in layouts/RSC to avoid crashing the render path.
        }
      },
    },
  });
}
