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

  const itemClass = (active?: boolean) =>
    cn(
      "flex items-center gap-3 w-full px-3 h-10 rounded-md",
      "text-muted transition-all duration-150",
      "hover:text-text hover:bg-panel2",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
      active && "text-signal bg-signal-muted",
    );

  const labelClass =
    "text-sm font-medium whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75";

  return (
    <nav
      className={cn(
        "group/rail hidden md:flex fixed left-0 top-0 h-screen z-20",
        "w-16 hover:w-48 overflow-hidden",
        "bg-panel border-r border-border",
        "flex-col py-5 gap-1",
        "transition-[width] duration-200 ease-out",
      )}
    >
      {/* Logo mark */}
      <Link
        href="/app"
        className="flex items-center gap-3 px-3 mb-5 hover:opacity-90 transition-opacity"
      >
        <span className="w-10 h-10 rounded-lg grid place-items-center shrink-0">
          <img src="/mix-architect-icon.svg" alt="Mix Architect" className="w-8 h-8" />
        </span>
        <span className={cn(labelClass, "font-semibold")}>Mix Architect</span>
      </Link>

      {/* Home */}
      <Link href="/app" className={itemClass(isHome)}>
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <Home size={20} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Dashboard</span>
      </Link>

      {/* Search */}
      <button type="button" onClick={onSearchClick} className={itemClass()}>
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <Search size={20} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Search</span>
      </button>

      {/* Settings */}
      <Link href="/app/settings" className={itemClass(isSettings)}>
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <Settings size={20} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Settings</span>
      </Link>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className={cn(itemClass(), "mt-auto")}
      >
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <LogOut size={18} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Sign Out</span>
      </button>
    </nav>
  );
}
