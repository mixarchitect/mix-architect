import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Rail } from "@/components/ui/rail";
import { Inspector } from "@/components/ui/inspector";
import { StatusIndicator } from "@/components/ui/status-dot";
import { Folder, Plus, Settings } from "lucide-react";

export function Shell({
  subtitle = "CONTROL ROOM",
  userEmail,
  children,
  inspector,
}: {
  subtitle?: string;
  userEmail?: string | null;
  children: React.ReactNode;
  inspector?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/app" className="flex items-center group">
              <Image
                src="/logo.svg"
                alt="Mix Architect"
                width={180}
                height={36}
                priority
                className="h-8 w-auto group-hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="label-sm text-faint hidden sm:block">
              {subtitle}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator color="green" label="Connected" />
            {userEmail && (
              <span className="text-xs text-muted font-mono tracking-tight">
                {userEmail}
              </span>
            )}
          </div>
        </header>

        {/* Main layout: rail + content + inspector */}
        <div className="mt-6 flex gap-5">
          <Rail
            items={[
              { href: "/app", icon: <Folder size={18} strokeWidth={1.5} />, label: "Releases" },
              { href: "/app/releases/new", icon: <Plus size={18} strokeWidth={1.5} />, label: "New release" },
              { href: "/app/settings", icon: <Settings size={18} strokeWidth={1.5} />, label: "Settings" },
            ]}
          />

          <main className="flex-1 min-w-0">{children}</main>

          {/* Desktop inspector */}
          <aside className="hidden lg:block w-[360px] shrink-0 sticky top-6 self-start">
            {inspector ?? <Inspector />}
          </aside>
        </div>
      </div>
    </div>
  );
}
