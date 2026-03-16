import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";

interface AdminUserInfo {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
}

/**
 * Fetch user info (email, display_name, phone) from auth.users for a list of user IDs.
 * Uses the service role client which has access to auth.admin APIs.
 * Returns a map of userId -> display string.
 */
export async function fetchUserDisplayMap(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const supabase = createSupabaseServiceClient();
  const map: Record<string, string> = {};

  // Fetch users in batches (auth.admin.listUsers returns paginated results)
  // For efficiency, fetch all users and filter client-side
  const idSet = new Set(userIds);
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error || !data?.users) break;

    for (const user of data.users) {
      if (idSet.has(user.id)) {
        const name = user.user_metadata?.display_name || user.user_metadata?.full_name;
        if (name) {
          map[user.id] = name;
        } else if (user.email) {
          map[user.id] = user.email;
        } else if (user.phone) {
          map[user.id] = user.phone;
        } else {
          map[user.id] = user.id.substring(0, 8);
        }
        // Stop early if we found all users
        if (Object.keys(map).length === idSet.size) {
          hasMore = false;
          break;
        }
      }
    }

    if (data.users.length < perPage) {
      hasMore = false;
    }
    page++;
  }

  // Fill in any missing IDs with truncated ID
  for (const id of userIds) {
    if (!map[id]) {
      map[id] = id.substring(0, 8);
    }
  }

  return map;
}

/**
 * Fetch persona values from user_defaults for a list of user IDs.
 * Returns a map of userId -> persona string (artist, engineer, both, other).
 */
export async function fetchUserPersonaMap(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_defaults")
    .select("user_id, persona")
    .in("user_id", userIds);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.persona) {
      map[row.user_id] = row.persona;
    }
  }
  return map;
}

/**
 * Fetch all users for admin search/autocomplete.
 * Returns basic info for each user.
 */
export async function fetchAllUsers(): Promise<AdminUserInfo[]> {
  const supabase = createSupabaseServiceClient();
  const users: AdminUserInfo[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error || !data?.users) break;

    for (const user of data.users) {
      users.push({
        id: user.id,
        email: user.email ?? null,
        display_name:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          null,
        phone: user.phone ?? null,
      });
    }

    if (data.users.length < perPage) {
      hasMore = false;
    }
    page++;
  }

  return users;
}
