"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Home, Settings, LogOut, Search } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Props = {
  userEmail?: string | null;
  onSearchClick?: () => void;
};

const NAV_ITEMS = [
  { href: "/app", icon: <Home size={20} strokeWidth={1.5} />, label: "Dashboard", exact: true },
  { href: "/app/settings", icon: <Settings size={20} strokeWidth={1.5} />, label: "Settings", exact: false },
];

export function Rail({ userEmail, onSearchClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

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

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 grid place-items-center rounded-md",
                "text-muted transition-all duration-150",
                "hover:text-text hover:bg-panel2",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
                active && "text-signal bg-signal-muted"
              )}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>

      {/* Search trigger */}
      <button
        type="button"
        onClick={onSearchClick}
        title="Search (Cmd+K)"
        className={cn(
          "w-10 h-10 grid place-items-center rounded-md",
          "text-muted transition-all duration-150",
          "hover:text-text hover:bg-panel2",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        )}
      >
        <Search size={20} strokeWidth={1.5} />
      </button>

      {/* User / sign out */}
      <div className="flex flex-col items-center gap-2">
        {userEmail && (
          <div
            className="w-9 h-9 rounded-full bg-panel2 border border-border grid place-items-center text-xs font-semibold text-muted"
            title={userEmail}
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="w-10 h-10 grid place-items-center rounded-md text-muted transition-colors hover:text-text hover:bg-panel2"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
