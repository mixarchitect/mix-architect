// src/lib/supabaseServiceClient.ts
// Service role client for server-side operations that bypass RLS.
// Used for portal anonymous write operations (comments, approvals).
// Requires SUPABASE_SERVICE_ROLE_KEY in environment.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createSupabaseServiceClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
