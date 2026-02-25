import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReleaseRole } from "./permissions";

/**
 * Determine the current user's role for a given release.
 * Returns 'owner' | 'collaborator' | 'client' | null.
 *
 * Call from server components; pass the result as a prop to client components.
 */
export async function getReleaseRole(
  supabase: SupabaseClient,
  releaseId: string,
  userId: string,
): Promise<ReleaseRole> {
  // Check owner (fast indexed lookup)
  const { data: release } = await supabase
    .from("releases")
    .select("user_id")
    .eq("id", releaseId)
    .maybeSingle();

  if (release?.user_id === userId) return "owner";

  // Check membership
  const { data: member } = await supabase
    .from("release_members")
    .select("role")
    .eq("release_id", releaseId)
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .maybeSingle();

  return (member?.role as ReleaseRole) ?? null;
}
