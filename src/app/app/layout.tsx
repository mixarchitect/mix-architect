import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

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
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Mix Architect</div>
        <div className="text-sm text-neutral-400">{user?.email ?? "No user"}</div>
      </header>

      {debugError && (
        <div className="bg-red-950 text-red-200 text-xs px-4 py-3 border-b border-red-700 whitespace-pre-wrap">
          {debugError}
        </div>
      )}

      <div className="flex-1 px-4 py-6">{children}</div>
    </main>
  );
}
