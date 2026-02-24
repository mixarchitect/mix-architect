import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let paymentsEnabled = false;
  if (user) {
    const { data: defaults } = await supabase
      .from("user_defaults")
      .select("payments_enabled")
      .eq("user_id", user.id)
      .maybeSingle();
    paymentsEnabled = defaults?.payments_enabled ?? false;
  }

  return (
    <Shell userEmail={user?.email ?? null} paymentsEnabled={paymentsEnabled}>
      {children}
    </Shell>
  );
}
