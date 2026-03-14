"use client";

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
  { label: "Featured Releases", href: "/admin/featured", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-panel p-4 space-y-1">
      <Link
        href="/app"
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
    </aside>
  );
}
