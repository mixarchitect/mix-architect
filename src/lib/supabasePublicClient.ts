// Cookie-free Supabase client for public reads (no next/headers dependency).
// Safe for use in generateStaticParams, sitemap, and any build-time context.
// Relies on RLS public SELECT policies for data access.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createSupabasePublicClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
