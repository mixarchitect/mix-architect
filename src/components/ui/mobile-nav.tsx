"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Home, Settings, Search, LogOut, DollarSign } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { usePaymentsEnabled } from "@/lib/payments-context";

const NAV_ITEMS = [
  { href: "/app", icon: Home, label: "Home", exact: true },
  { href: "/app/settings", icon: Settings, label: "Settings", exact: false },
];

type Props = {
  onSearchClick?: () => void;
};

export function MobileNav({ onSearchClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const paymentsEnabled = usePaymentsEnabled();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden h-16 border-t border-border bg-panel flex items-center justify-around z-50">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
              active ? "text-signal" : "text-muted",
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
      {paymentsEnabled && (
        <Link
          href="/app/payments"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
            pathname?.startsWith("/app/payments") ? "text-signal" : "text-muted",
          )}
        >
          <DollarSign size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Payments</span>
        </Link>
      )}
      <button
        type="button"
        onClick={onSearchClick}
        className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted"
      >
        <Search size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Search</span>
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted"
      >
        <LogOut size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Sign Out</span>
      </button>
    </nav>
  );
}
