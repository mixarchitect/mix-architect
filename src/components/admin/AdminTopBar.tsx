"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, LogOut, Settings, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Tooltip } from "@/components/ui/tooltip";

type Props = {
  userId: string;
  userEmail: string | null;
  displayName: string | null;
};

export function AdminTopBar({ userId, userEmail, displayName }: Props) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function cycleTheme() {
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
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
  const themeLabel = !mounted ? "Toggle theme" : theme === "light" ? "Switch to dark mode" : theme === "dark" ? "Switch to auto" : "Switch to light mode";

  return (
    <header className="hidden md:flex h-14 shrink-0 items-center justify-between px-6 border-b border-border bg-panel">
      {/* Left: logo + back to app */}
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <img
            src={mounted && resolvedTheme === "dark" ? "/mix-architect-logo-white.svg" : "/mix-architect-logo.svg"}
            alt="Mix Architect"
            className="h-6 w-auto"
          />
        </Link>
        <div className="h-4 w-px bg-border" />
        <Link
          href="/app"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to App
        </Link>
      </div>

      {/* Right: utility items */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Tooltip label={themeLabel} align="right">
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={themeLabel}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-panel2 transition-colors"
          >
            <ThemeIcon size={18} strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Account avatar */}
        <Tooltip label="Account" align="right">
          <span className="ml-1">
            <AccountMenu userEmail={userEmail} displayName={displayName} />
          </span>
        </Tooltip>
      </div>
    </header>
  );
}

/* ─── Account Dropdown ──────────────────────────────────── */

function AccountMenu({ userEmail, displayName }: { userEmail: string | null; displayName: string | null }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const initial = displayName ? displayName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : "?";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white transition-opacity hover:opacity-80"
        style={{ background: "var(--signal)" }}
      >
        {initial}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-panel shadow-xl py-1 z-50"
        >
          <div className="px-3 py-2 border-b border-border">
            {displayName && <p className="text-sm text-text font-medium truncate">{displayName}</p>}
            <p className={cn("text-sm truncate", displayName ? "text-muted" : "text-text font-medium")}>{userEmail}</p>
          </div>

          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel2 transition-colors"
          >
            <Settings size={15} strokeWidth={1.5} />
            User Settings
          </Link>

          <div className="border-t border-border my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-panel2 transition-colors text-left"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
