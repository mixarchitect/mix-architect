"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Home, Search, Settings, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Props = {
  onSearchClick?: () => void;
};

export function Rail({ onSearchClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  const isHome = pathname === "/app";
  const isSettings = pathname?.startsWith("/app/settings");

  const iconClass = (active?: boolean) =>
    cn(
      "w-10 h-10 grid place-items-center rounded-md",
      "text-muted transition-all duration-150",
      "hover:text-text hover:bg-panel2",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
      active && "text-signal bg-signal-muted",
    );

  return (
    <nav className="hidden md:flex w-16 shrink-0 border-r border-border bg-panel flex-col items-center py-5 gap-1">
      {/* Logo mark */}
      <Link
        href="/app"
        className="w-10 h-10 rounded-lg grid place-items-center mb-6 hover:opacity-90 transition-opacity"
        title="Mix Architect"
      >
        <img src="/mix-architect-icon.svg" alt="Mix Architect" className="w-8 h-8" />
      </Link>

      {/* Home */}
      <Link href="/app" title="Dashboard" className={iconClass(isHome)}>
        <Home size={20} strokeWidth={1.5} />
      </Link>

      {/* Search */}
      <button type="button" onClick={onSearchClick} title="Search (Cmd+K)" className={iconClass()}>
        <Search size={20} strokeWidth={1.5} />
      </button>

      {/* Settings */}
      <Link href="/app/settings" title="Settings" className={iconClass(isSettings)}>
        <Settings size={20} strokeWidth={1.5} />
      </Link>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        title="Sign out"
        className={iconClass()}
      >
        <LogOut size={18} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
