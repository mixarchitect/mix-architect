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
    <main className="min-h-screen flex flex-col bg-transparent relative">
      <div className="canvas-noise" aria-hidden />

      <header className="border-b border-stroke bg-surface/70 backdrop-blur-md px-5 py-3 flex items-center justify-between shadow-panel">
        <div className="flex items-center gap-3">
          <div className="pill">Mix Architect</div>
          <span className="text-subtle text-[11px] uppercase tracking-[0.24em]">
            Control Room
          </span>
        </div>
        <div className="text-sm text-subtle">{user?.email ?? "No user"}</div>
      </header>

      {debugError && (
        <div className="bg-red-900/50 text-red-100 text-xs px-6 py-3 border-b border-red-700 whitespace-pre-wrap">
          {debugError}
        </div>
      )}

      <div className="flex-1">{children}</div>
    </main>
  );
}
