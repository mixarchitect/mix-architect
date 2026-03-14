import { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6 rounded-lg bg-amber-600/10 border border-amber-600/30 px-4 py-2 text-sm text-amber-500 font-medium">
          Admin Mode
        </div>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
