import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth: middleware should catch this, but guard here too
  if (!user) {
    redirect("/auth/sign-in");
  }

  let paymentsEnabled = false;
  const { data: defaults } = await supabase
    .from("user_defaults")
    .select("payments_enabled")
    .eq("user_id", user.id)
    .maybeSingle();
  paymentsEnabled = defaults?.payments_enabled ?? false;

  return (
    <Shell userEmail={user.email ?? null} paymentsEnabled={paymentsEnabled}>
      {children}
    </Shell>
  );
}
