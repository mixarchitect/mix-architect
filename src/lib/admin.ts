import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Check if a given user ID has admin privileges.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !data) return false;
  return data.is_admin === true;
}

/**
 * Server-side guard. Call at the top of admin server components or route handlers.
 * Returns the authenticated user ID if admin, otherwise redirects.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/");
  }

  return user.id;
}
