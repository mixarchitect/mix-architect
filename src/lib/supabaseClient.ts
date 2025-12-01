import process from "node:process";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServerClient(cookies: CookieMethodsServer) {
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies });
}
