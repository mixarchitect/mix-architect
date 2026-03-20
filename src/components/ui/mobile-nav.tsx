"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  Home, Users, Search, Menu, X, DollarSign,
  Sun, Moon, Monitor, LayoutTemplate, HelpCircle,
  Settings, LogOut, Bug, Download, Shield, BarChart3,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { usePaymentsEnabled } from "@/lib/payments-context";
import { NotificationBell } from "@/components/ui/notification-bell";

type Props = {
  userId?: string;
  userEmail?: string | null;
  onSearchClick?: () => void;
  isAdmin?: boolean;
};

export function MobileNav({ userId, userEmail, onSearchClick, isAdmin }: Props) {
  const pathname = usePathname();
  const paymentsEnabled = usePaymentsEnabled();
  const t = useTranslations("nav");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isHome = pathname === "/app" || pathname?.startsWith("/app/releases");
  const isArtists = pathname?.startsWith("/app/artists");
  const isTemplates = pathname?.startsWith("/app/templates");

  const itemClass = (active?: boolean) =>
    cn(
      "flex flex-col items-center gap-1 px-3 py-2 transition-colors min-w-[44px]",
      active ? "text-signal" : "text-muted",
    );

  return (
    <>
      {/* Bottom bar */}
      <nav aria-label="App navigation" className="fixed bottom-0 left-0 right-0 md:hidden h-16 border-t border-border bg-panel flex items-center justify-around z-50">
        <Link href="/app" className={itemClass(isHome)}>
          <Home size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{t("releases")}</span>
        </Link>

        <Link href="/app/artists" className={itemClass(isArtists)}>
          <Users size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{t("artists")}</span>
        </Link>

        <Link href="/app/templates" className={itemClass(isTemplates)}>
          <LayoutTemplate size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{t("templates")}</span>
        </Link>

        <button
          type="button"
          onClick={onSearchClick}
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors text-muted min-w-[44px]"
        >
          <Search size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{t("search")}</span>
        </button>

        {userId && <NotificationBell userId={userId} variant="mobile" />}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-2 transition-colors text-muted min-w-[44px]"
          aria-label="Menu"
        >
          <Menu size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">{t("more")}</span>
        </button>
      </nav>

      {/* Slide-out drawer */}
      {drawerOpen && (
        <MobileDrawer
          onClose={() => setDrawerOpen(false)}
          paymentsEnabled={paymentsEnabled}
          userEmail={userEmail ?? null}
          pathname={pathname}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}

/* ─── Drawer ──────────────────────────────────── */

function MobileDrawer({
  onClose,
  paymentsEnabled,
  userEmail,
  pathname,
  isAdmin,
}: {
  onClose: () => void;
  paymentsEnabled: boolean;
  userEmail: string | null;
  pathname: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const tNav = useTranslations("nav");
  const tTheme = useTranslations("theme");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  const ThemeIcon = !mounted ? Monitor : theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const themeLabel = !mounted ? tTheme("system") : theme === "light" ? tTheme("light") : theme === "dark" ? tTheme("dark") : tTheme("system");

  const linkClass = (active?: boolean) =>
    cn(
      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
      active ? "text-signal" : "text-text",
    );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed right-0 top-0 bottom-0 w-64 bg-panel border-l border-border z-50 md:hidden flex flex-col"
        style={{ background: "var(--panel)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          {userEmail && (
            <span className="text-sm text-muted truncate mr-2">{userEmail}</span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-text transition-colors shrink-0"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav section */}
        <div className="flex-1 overflow-y-auto py-2">
          {paymentsEnabled && (
            <Link href="/app/payments" className={linkClass(pathname?.startsWith("/app/payments"))} onClick={onClose}>
              <DollarSign size={18} strokeWidth={1.5} />
              {tNav("payments")}
            </Link>
          )}
          <Link href="/app/analytics" className={linkClass(pathname?.startsWith("/app/analytics"))} onClick={onClose}>
            <BarChart3 size={18} strokeWidth={1.5} />
            {tNav("analytics")}
          </Link>

          <div className="border-t border-border my-2" />

          <Link href="/app/settings" className={linkClass(pathname?.startsWith("/app/settings"))} onClick={onClose}>
            <Settings size={18} strokeWidth={1.5} />
            {tNav("settings")}
          </Link>
          <Link href="/app/help" className={linkClass(pathname?.startsWith("/app/help"))} onClick={onClose}>
            <HelpCircle size={18} strokeWidth={1.5} />
            {tNav("help")}
          </Link>
          <Link href="/app/help?tab=bug" className={linkClass()} onClick={onClose}>
            <Bug size={18} strokeWidth={1.5} />
            {tNav("reportBug")}
          </Link>
          <Link href="/api/export" className={linkClass()} onClick={onClose}>
            <Download size={18} strokeWidth={1.5} />
            {tNav("exportData")}
          </Link>

          {isAdmin && (
            <>
              <div className="border-t border-border my-2" />
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-500 transition-colors" onClick={onClose}>
                <Shield size={18} strokeWidth={1.5} />
                Admin
              </Link>
            </>
          )}

          <div className="border-t border-border my-2" />

          <button type="button" onClick={cycleTheme} className={linkClass()}>
            <ThemeIcon size={18} strokeWidth={1.5} />
            {tTheme("themeLabel", { theme: themeLabel })}
          </button>
        </div>

        {/* Sign out at bottom */}
        <div className="border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 text-sm font-medium text-red-500 transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {tNav("signOut")}
          </button>
        </div>
      </div>
    </>
  );
}
