"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Home, Search, Settings, LogOut, DollarSign, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { usePaymentsEnabled } from "@/lib/payments-context";

type Props = {
  onSearchClick?: () => void;
};

export function Rail({ onSearchClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const paymentsEnabled = usePaymentsEnabled();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function cycleTheme() {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    // Fire-and-forget DB persist
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) {
        supabase.from("user_defaults").upsert(
          { user_id: user.id, theme: next },
          { onConflict: "user_id" },
        );
      }
    });
  }

  const ThemeIcon = !mounted ? Monitor : theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const themeLabel = !mounted ? "Auto" : theme === "light" ? "Light" : theme === "dark" ? "Dark" : "Auto";

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  const isHome = pathname === "/app";
  const isPayments = pathname?.startsWith("/app/payments");
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
      aria-label="App navigation"
      className={cn(
        "group/rail hidden md:flex fixed left-0 top-0 h-dvh z-20",
        "w-16 hover:w-48 overflow-hidden",
        "bg-panel border-r border-border",
        "flex-col py-5 gap-1",
        "transition-[width] duration-200 ease-out",
      )}
    >
      {/* Logo mark */}
      <Link
        href="/app"
        className="flex items-center px-3 mb-5 h-10 hover:opacity-90 transition-opacity"
      >
        {/* Collapsed: icon only — dark variant has all-white internals */}
        <span className="w-10 h-10 grid place-items-center shrink-0 group-hover/rail:hidden">
          <img
            src={mounted && resolvedTheme === "dark" ? "/mix-architect-icon-dark.svg" : "/mix-architect-icon.svg"}
            alt="Mix Architect"
            className="w-7 h-7"
          />
        </span>
        {/* Expanded: full wordmark logo — white variant in dark mode */}
        <img
          src={mounted && resolvedTheme === "dark" ? "/mix-architect-logo-white.svg" : "/mix-architect-logo.svg"}
          alt="Mix Architect"
          className="h-7 w-auto hidden group-hover/rail:block"
        />
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

      {/* Payments (conditional) */}
      {paymentsEnabled && (
        <Link href="/app/payments" className={itemClass(isPayments)}>
          <span className="w-10 h-10 grid place-items-center shrink-0">
            <DollarSign size={20} strokeWidth={1.5} />
          </span>
          <span className={labelClass}>Payments</span>
        </Link>
      )}

      {/* Settings */}
      <Link href="/app/settings" className={itemClass(isSettings)}>
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <Settings size={20} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Settings</span>
      </Link>

      {/* Theme toggle */}
      <button type="button" onClick={cycleTheme} className={cn(itemClass(), "mt-auto")}>
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <ThemeIcon size={18} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>{themeLabel}</span>
      </button>

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        className={itemClass()}
      >
        <span className="w-10 h-10 grid place-items-center shrink-0">
          <LogOut size={18} strokeWidth={1.5} />
        </span>
        <span className={labelClass}>Sign Out</span>
      </button>
    </nav>
  );
}
