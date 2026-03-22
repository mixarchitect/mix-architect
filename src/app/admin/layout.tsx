import { ReactNode, Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

async function AdminTopBarData() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    null;

  return (
    <AdminTopBar
      userId={user?.id ?? ""}
      userEmail={user?.email ?? null}
      displayName={displayName}
    />
  );
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-col h-dvh">
      <Suspense
        fallback={
          <header className="hidden md:flex h-14 shrink-0 items-center justify-between px-6 border-b border-border bg-panel" />
        }
      >
        <AdminTopBarData />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-4 pt-16 md:pt-6 md:px-6 md:py-6 overflow-y-auto overflow-x-hidden focus:outline-none">
          <div className="mb-6 rounded-lg bg-amber-600/10 border border-amber-600/30 px-4 py-2 text-sm text-amber-500 font-medium">
            Admin Mode
          </div>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
