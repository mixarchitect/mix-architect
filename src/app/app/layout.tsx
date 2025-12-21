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
    <main className="min-h-screen flex flex-col bg-transparent">
      <header className="border-b border-[#dcdcdc] bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="pill">Mix Architect</div>
          <span className="text-subtle text-xs uppercase tracking-[0.2em]">
            Control Room
          </span>
        </div>
        <div className="text-sm text-subtle">{user?.email ?? "No user"}</div>
      </header>

      {debugError && (
        <div className="bg-red-100 text-red-700 text-xs px-6 py-3 border-b border-red-200 whitespace-pre-wrap">
          {debugError}
        </div>
      )}

      <div className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">{children}</div>
    </main>
  );
}
