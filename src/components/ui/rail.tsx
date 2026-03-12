"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Home, Users, DollarSign, LayoutTemplate } from "lucide-react";
import { useTheme } from "next-themes";
import { usePaymentsEnabled } from "@/lib/payments-context";

export function Rail() {
  const pathname = usePathname();
  const paymentsEnabled = usePaymentsEnabled();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isHome = pathname === "/app" || pathname?.startsWith("/app/releases");
  const isArtists = pathname?.startsWith("/app/artists");
  const isTemplates = pathname?.startsWith("/app/templates");
  const isPayments = pathname?.startsWith("/app/payments");

  return (
    <nav
      aria-label="App navigation"
      className="hidden md:flex fixed left-0 top-0 h-dvh z-20 w-[200px] bg-panel border-r border-border flex-col"
    >
      {/* Logo header — matches top bar height */}
      <Link
        href="/app"
        className="flex items-center h-14 px-5 shrink-0 hover:opacity-90 transition-opacity"
      >
        <img
          src={mounted && resolvedTheme === "dark" ? "/mix-architect-logo-white.svg" : "/mix-architect-logo.svg"}
          alt="Mix Architect"
          className="h-6 w-auto"
        />
      </Link>

      {/* Nav items */}
      <div className="flex flex-col gap-1 px-3 pt-2">
        <NavItem href="/app" icon={Home} label="Releases" active={isHome} />
        <NavItem href="/app/artists" icon={Users} label="Artists" active={isArtists} />
        <NavItem href="/app/templates" icon={LayoutTemplate} label="Templates" active={isTemplates} />
        {paymentsEnabled && (
          <NavItem href="/app/payments" icon={DollarSign} label="Payments" active={isPayments} />
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium",
        "transition-colors duration-150",
        "hover:text-text hover:bg-panel2",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        active ? "text-signal bg-signal-muted" : "text-muted",
      )}
    >
      <Icon size={18} strokeWidth={1.5} />
      {label}
    </Link>
  );
}
