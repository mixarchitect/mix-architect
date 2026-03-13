import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";
import { createNotification } from "@/lib/notifications/service";

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
      .select("payments_enabled, theme, onboarding_completed")
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
  const onboardingCompleted = defaultsRes.data?.onboarding_completed ?? false;

  // Redirect to onboarding if not completed (but don't loop if already there)
  const headerList = await headers();
  const pathname = headerList.get("x-next-pathname") ?? headerList.get("x-invoke-path") ?? "";
  if (!onboardingCompleted && !pathname.startsWith("/app/onboarding")) {
    // Ensure user_defaults row exists before redirecting
    if (!defaultsRes.data) {
      await supabase.from("user_defaults").insert({ user_id: user.id });
    }
    redirect("/app/onboarding");
  }

  // Fire-and-forget: notify release owners of new collaborators without blocking render
  void (async () => {
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: recentJoins } = await supabase
      .from("release_members")
      .select("release_id, role, releases!inner(user_id, title)")
      .eq("user_id", user.id)
      .gte("accepted_at", cutoff);

    if (recentJoins?.length) {
      const displayName = user.user_metadata?.display_name || user.email || "Someone";
      for (const join of recentJoins) {
        const release = join.releases as unknown as { user_id: string; title: string };
        if (release?.user_id && release.user_id !== user.id) {
          createNotification({
            userId: release.user_id,
            type: "collaborator_joined",
            title: `${displayName} joined "${release.title}"`,
            body: `Accepted their invite as ${join.role ?? "collaborator"}`,
            releaseId: join.release_id,
            actorName: displayName,
          });
        }
      }
    }
  })();

  const subscription = {
    plan: (subRes.data?.plan as "free" | "pro") ?? "free",
    status: (subRes.data?.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete") ?? "active",
    cancelAtPeriodEnd: subRes.data?.cancel_at_period_end ?? false,
    currentPeriodEnd: subRes.data?.current_period_end ?? null,
    grantedByAdmin: subRes.data?.granted_by_admin ?? false,
  };

  const locale = await getLocale();
  const messages = await getMessages();
  const isOnboarding = pathname.startsWith("/app/onboarding");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {isOnboarding ? (
        children
      ) : (
        <Shell userId={user.id} userEmail={user.email ?? null} paymentsEnabled={paymentsEnabled} theme={theme} subscription={subscription}>
          {children}
        </Shell>
      )}
    </NextIntlClientProvider>
  );
}
