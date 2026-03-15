import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await requireAdmin();

  // Fetch user metadata for the top bar
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || null;

  return (
    <div className="flex flex-col min-h-dvh">
      <AdminTopBar
        userId={userId}
        userEmail={user?.email ?? null}
        displayName={displayName}
      />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 px-4 py-4 pt-16 md:pt-6 md:px-6 md:py-6 overflow-y-auto overflow-x-hidden">
          <div className="mb-6 rounded-lg bg-amber-600/10 border border-amber-600/30 px-4 py-2 text-sm text-amber-500 font-medium">
            Admin Mode
          </div>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
