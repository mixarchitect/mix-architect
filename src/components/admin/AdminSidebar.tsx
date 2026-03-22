"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Gift,
  Activity,
  Bell,
  Star,
  ArrowLeft,
  Shield,
  TrendingUp,
  Menu,
  X,
  Megaphone,
  Lightbulb,
  Gauge,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/subscribers", icon: Users },
  { label: "Churn Signals", href: "/admin/churn", icon: AlertTriangle },
  { label: "Comp Accounts", href: "/admin/comp-accounts", icon: Gift },
  { label: "Activity Log", href: "/admin/activity", icon: Activity },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Audit Log", href: "/admin/audit", icon: Shield },
  { label: "Attributions", href: "/admin/attributions", icon: TrendingUp },
  { label: "Featured Releases", href: "/admin/featured", icon: Star },
  { label: "Feature Requests", href: "/admin/feature-requests", icon: Lightbulb },
  { label: "Changelog", href: "/admin/changelog", icon: Megaphone },
  { label: "Site Traffic", href: "/admin/traffic", icon: BarChart3 },
  { label: "Performance", href: "/admin/performance", icon: Gauge },
  { label: "Security", href: "/admin/security", icon: ShieldCheck },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/app"
        onClick={onNavigate}
        className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-4"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to App
      </Link>

      <div className="text-xs uppercase tracking-wider text-faint mt-4 mb-2 font-semibold">
        Admin
      </div>

      {adminNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-amber-600/15 text-amber-500 font-medium"
                : "text-muted hover:text-text hover:bg-panel2",
            )}
          >
            <item.icon size={16} strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0 border-r border-border bg-panel p-4 space-y-1">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-panel border border-border text-muted hover:text-text transition-colors shadow-sm"
        aria-label="Open admin menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

          {/* Drawer */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation menu"
            className="absolute inset-y-0 left-0 w-64 bg-panel border-r border-border p-4 space-y-1 overflow-y-auto"
            style={{ background: "var(--panel)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-faint font-semibold">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-panel2 transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
