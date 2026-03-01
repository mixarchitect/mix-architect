import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Defense-in-depth: middleware should catch this, but guard here too
  if (error || !user) {
    redirect("/auth/sign-in");
  }

  // Run in parallel: fetch user defaults + subscription + claim any pending invites
  const [defaultsRes, subRes] = await Promise.all([
    supabase
      .from("user_defaults")
      .select("payments_enabled, theme")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status, cancel_at_period_end, current_period_end, granted_by_admin")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.rpc("claim_pending_invites"),
  ]);
  const paymentsEnabled = defaultsRes.data?.payments_enabled ?? false;
  const theme = (defaultsRes.data?.theme as string) ?? "system";

  const subscription = {
    plan: (subRes.data?.plan as "free" | "pro") ?? "free",
    status: (subRes.data?.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete") ?? "active",
    cancelAtPeriodEnd: subRes.data?.cancel_at_period_end ?? false,
    currentPeriodEnd: subRes.data?.current_period_end ?? null,
    grantedByAdmin: subRes.data?.granted_by_admin ?? false,
  };

  return (
    <Shell userEmail={user.email ?? null} paymentsEnabled={paymentsEnabled} theme={theme} subscription={subscription}>
      {children}
    </Shell>
  );
}
