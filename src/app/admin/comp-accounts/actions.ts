"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { isAdmin } from "@/lib/admin";
import { fetchAllUsers } from "@/lib/admin-users";

export interface UserSearchResult {
  userId: string;
  email: string;
  label: string;
  phone: string;
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  // Validate admin
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return [];
  }

  if (!query || query.length < 2) return [];

  const allUsers = await fetchAllUsers();
  const q = query.toLowerCase();

  return allUsers
    .filter((u) => {
      const name = u.display_name?.toLowerCase() ?? "";
      const email = u.email?.toLowerCase() ?? "";
      const phone = u.phone ?? "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    })
    .slice(0, 20)
    .map((u) => ({
      userId: u.id,
      email: u.email ?? "",
      label: u.display_name || u.email || u.id.substring(0, 8),
      phone: u.phone ?? "",
    }));
}
