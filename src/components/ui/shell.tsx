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
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold tracking-tight text-text">
              {title}
            </div>
            <div className="label text-[10px] text-faint hidden sm:block">
              {subtitle}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-xs text-muted font-mono tracking-tight">
                {userEmail}
              </span>
            )}
          </div>
        </header>

        {/* Main layout: rail + content + inspector */}
        <div className="mt-6 flex gap-4">
          <Rail
            items={[
              { href: "/app", icon: <Folder size={18} strokeWidth={1.5} />, label: "Releases" },
              { href: "/app/releases/new", icon: <Plus size={18} strokeWidth={1.5} />, label: "New release" },
              { href: "/app/settings", icon: <Settings size={18} strokeWidth={1.5} />, label: "Settings" },
            ]}
          />

          <main className="flex-1 min-w-0">{children}</main>

          {/* Desktop inspector */}
          <aside className="hidden lg:block w-[340px] shrink-0 sticky top-6 self-start">
            {inspector ?? <Inspector />}
          </aside>
        </div>

        {/* Mobile inspector (stacks below) */}
        <div className="lg:hidden mt-4">{inspector ?? <Inspector />}</div>
      </div>
    </div>
  );
}
