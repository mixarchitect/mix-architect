import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { RequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  const mutableCookies = cookieStore as unknown as RequestCookies;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        mutableCookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        mutableCookies.set({ name, value: "", ...options });
      },
    },
  });
}

