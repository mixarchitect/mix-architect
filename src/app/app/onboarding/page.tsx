import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
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
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (defaults?.onboarding_completed) {
    redirect("/app");
  }

  return <OnboardingFlow userId={user.id} />;
}
