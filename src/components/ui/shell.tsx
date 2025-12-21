import * as React from "react";
import { Rail } from "@/components/ui/rail";
import { Inspector } from "@/components/ui/inspector";
import { Folder, Plus, Settings } from "lucide-react";

export function Shell({
  title = "Mix Architect",
  subtitle = "DRAFTING TABLE",
  userEmail,
  children,
  inspector,
}: {
  title?: string;
  subtitle?: string;
  userEmail?: string | null;
  children: React.ReactNode;
  inspector?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm font-semibold tracking-tight text-text">{title}</div>
            <div className="label text-[11px] text-faint hidden sm:block">
              {subtitle}
            </div>
          </div>
          <div className="text-sm text-muted">{userEmail ?? "No user"}</div>
        </header>

        <div className="mt-6 flex gap-4">
          <Rail
            items={[
              { href: "/app", icon: <Folder size={18} />, label: "Releases" },
              { href: "/app/releases/new", icon: <Plus size={18} />, label: "New release" },
              { href: "/app/settings", icon: <Settings size={18} />, label: "Settings" },
            ]}
          />

          <main className="flex-1 min-w-0">{children}</main>

          <aside className="hidden lg:block w-[360px] shrink-0 sticky top-6 self-start">
            {inspector ?? <Inspector />}
          </aside>
        </div>

        <div className="lg:hidden mt-4">{inspector ?? <Inspector />}</div>
      </div>
    </div>
  );
}


