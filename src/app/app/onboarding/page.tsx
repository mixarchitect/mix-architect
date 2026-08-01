import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { createSupabaseServiceClient } from "@/lib/supabaseServiceClient";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // If onboarding already completed, go to dashboard
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("onboarding_completed, account_reset_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (defaults?.onboarding_completed) {
    redirect("/app");
  }

  // After an admin account reset, the user's old releases are parked
  // (soft-deleted). Count them so onboarding can offer to bring them back.
  // Parked rows are hidden from the user's own RLS view, so this needs the
  // service client; the query is still pinned to their own user id.
  let parkedReleaseCount = 0;
  const resetAt = defaults?.account_reset_at as string | null | undefined;
  if (resetAt) {
    const service = createSupabaseServiceClient();
    const { count } = await service
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("deleted_at", resetAt);
    parkedReleaseCount = count ?? 0;
  }

  return (
    <OnboardingFlow userId={user.id} parkedReleaseCount={parkedReleaseCount} />
  );
}
