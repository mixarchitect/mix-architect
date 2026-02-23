import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Shell userEmail={user?.email ?? null}>{children}</Shell>;
}
