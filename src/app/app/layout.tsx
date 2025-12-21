import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { Shell } from "@/components/ui/shell";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  let user: { email?: string | null } | null = null;
  let debugError: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      debugError = `supabase.auth.getUser error: ${error.message}`;
    } else {
      user = data.user;
    }
  } catch (err) {
    debugError = `Thrown error in AppLayout: ${err instanceof Error ? err.message : String(err)}`;
  }

  return (
    <>
      {debugError && (
        <div className="px-6 pt-6">
          <div className="surface p-4 border border-hairline text-sm text-muted">
            {debugError}
          </div>
        </div>
      )}
      <Shell userEmail={user?.email ?? null}>{children}</Shell>
    </>
  );
}
