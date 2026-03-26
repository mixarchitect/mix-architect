"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Sun, Moon, Monitor, LogOut, Settings, Download, Bug, Sparkles, Shield } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Tooltip } from "@/components/ui/tooltip";

type Props = {
  userId?: string;
  userEmail?: string | null;
  displayName?: string | null;
  onSearchClick?: () => void;
  isAdmin?: boolean;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar({ userId, userEmail, displayName, onSearchClick, isAdmin }: Props) {
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
      {/* Left: greeting + logo */}
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
        {displayName && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted">
              {mounted ? getGreeting() : ""}, <span className="text-text font-medium">{displayName.split(" ")[0]}</span>
            </span>
          </>
        )}
      </div>

      {/* Right: utility items */}
      <div className="flex items-center gap-1">
        {/* Search trigger */}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search (⌘K)"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg mr-1",
            "bg-panel2 border border-border",
            "text-sm text-muted hover:text-text transition-colors",
            "w-52",
          )}
        >
          <Search size={16} strokeWidth={1.5} />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] font-medium text-muted bg-panel border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </button>

        {/* Featured releases */}
        <Tooltip label="Featured Releases" align="right">
          <Link
            href="/app/featured"
            aria-label="Featured Releases"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-panel2 transition-colors"
          >
            <Sparkles size={18} strokeWidth={1.5} />
          </Link>
        </Tooltip>

        {/* Notification bell */}
        {userId && (
          <Tooltip label="Notifications" align="right">
            <NotificationBell userId={userId} variant="topbar" />
          </Tooltip>
        )}

        {/* Help */}
        <Tooltip label="Help Center" align="right">
          <Link
            href="/app/help"
            aria-label="Help Center"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-panel2 transition-colors"
          >
            <HelpCircle size={18} strokeWidth={1.5} />
          </Link>
        </Tooltip>

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

        {/* Admin link */}
        {isAdmin && (
          <Tooltip label="Admin Dashboard" align="right">
            <Link
              href="/admin"
              aria-label="Admin"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-500 hover:text-amber-400 hover:bg-panel2 transition-colors"
            >
              <Shield size={18} strokeWidth={1.5} />
            </Link>
          </Tooltip>
        )}

        {/* Account avatar */}
        {userId && (
          <Tooltip label="Account" align="right">
            <span className="ml-1">
              <AccountMenu userEmail={userEmail ?? null} displayName={displayName ?? null} />
            </span>
          </Tooltip>
        )}
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
          {/* User info */}
          <div className="px-3 py-2 border-b border-border">
            {displayName && <p className="text-sm text-text font-medium truncate">{displayName}</p>}
            <p className={cn("text-sm truncate", displayName ? "text-muted" : "text-text font-medium")}>{userEmail}</p>
          </div>

          {/* Menu items */}
          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel2 transition-colors"
          >
            <Settings size={15} strokeWidth={1.5} />
            User Settings
          </Link>
          <Link
            href="/api/export"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel2 transition-colors"
          >
            <Download size={15} strokeWidth={1.5} />
            Export Data
          </Link>
          <Link
            href="/app/help?tab=bug"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-panel2 transition-colors"
          >
            <Bug size={15} strokeWidth={1.5} />
            Report a Bug
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

