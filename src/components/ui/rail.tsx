"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Home, Users, DollarSign, LayoutTemplate, BarChart3 } from "lucide-react";
import { useFeatureVisible } from "@/hooks/use-feature-visible";

const MONEY_QUOTES = [
  "That\u2019s what I want",
  "Get away",
  "Mo money, mo problems",
  "Cash rules everything around me",
  "Money for nothing",
  "Money can\u2019t buy me love",
  "For the love of money",
  "Bills, Bills, Bills",
];

export function Rail() {
  const pathname = usePathname();
  const showPayments = useFeatureVisible("payment_tracking");
  const showTemplates = useFeatureVisible("templates");
  const t = useTranslations("nav");

  const isHome = pathname === "/app" || pathname?.startsWith("/app/releases");
  const isArtists = pathname?.startsWith("/app/artists");
  const isTemplates = pathname?.startsWith("/app/templates");
  const isMoney = pathname?.startsWith("/app/money") || pathname?.startsWith("/app/payments") || pathname?.startsWith("/app/quotes");
  const isAnalytics = pathname?.startsWith("/app/analytics");

  return (
    <nav
      aria-label="App navigation"
      className={cn(
        "group/rail hidden md:flex fixed left-0 top-14 z-20",
        "w-14 hover:w-48 overflow-hidden",
        "bg-panel border-r border-border",
        "flex-col py-3 gap-1",
        "transition-[width] duration-200 ease-out",
      )}
      style={{ height: "calc(100dvh - 3.5rem)" }}
    >
      <NavItem href="/app" icon={Home} label={t("releases")} active={isHome} />
      <NavItem href="/app/artists" icon={Users} label={t("artists")} active={isArtists} />
      {showTemplates && (
        <NavItem href="/app/templates" icon={LayoutTemplate} label={t("templates")} active={isTemplates} />
      )}
      {showPayments && (
        <NavItem href="/app/money" icon={DollarSign} label={t("money")} active={isMoney} easterEgg />
      )}
      <NavItem href="/app/analytics" icon={BarChart3} label={t("analytics")} active={isAnalytics} />
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  easterEgg,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
  easterEgg?: boolean;
}) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <div
      className="relative"
      onMouseEnter={
        easterEgg
          ? () => {
              clearTimeout(timeout.current);
              timeout.current = setTimeout(() => {
                setTooltip(MONEY_QUOTES[Math.floor(Math.random() * MONEY_QUOTES.length)]);
              }, 200);
            }
          : undefined
      }
      onMouseLeave={
        easterEgg
          ? () => {
              clearTimeout(timeout.current);
              setTooltip(null);
            }
          : undefined
      }
    >
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 w-full px-4 h-10 rounded-md",
          "text-muted transition-all duration-150",
          "hover:text-text hover:bg-panel2",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
          active && "text-signal bg-signal-muted",
        )}
      >
        <span className="w-6 h-10 grid place-items-center shrink-0">
          <Icon size={20} strokeWidth={1.5} />
        </span>
        <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
          {label}
        </span>
      </Link>
      {easterEgg && tooltip && (
        <span
          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 rounded-md text-[11px] whitespace-nowrap pointer-events-none bg-text text-panel italic"
          role="tooltip"
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}
