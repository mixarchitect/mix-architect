"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { Rail } from "@/components/ui/rail";
import { MobileNav } from "@/components/ui/mobile-nav";
import { TopBar } from "@/components/ui/top-bar";
import { CommandPalette } from "@/components/ui/command-palette";
import { PaymentsProvider } from "@/lib/payments-context";
import { SubscriptionProvider, type SubscriptionState } from "@/lib/subscription-context";
import { AudioProvider, useAudio } from "@/lib/audio-context";
import { TimestampProvider } from "@/lib/timestamp-context";
import { MiniPlayer } from "@/components/ui/mini-player";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { ToastProvider } from "@/components/ui/toast";

type ShellProps = {
  userId?: string;
  userEmail?: string | null;
  paymentsEnabled?: boolean;
  theme?: string;
  subscription?: SubscriptionState;
  isAdmin?: boolean;
  children: React.ReactNode;
};

const DEFAULT_SUB: SubscriptionState = {
  plan: "free",
  status: "active",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  grantedByAdmin: false,
};

export function Shell({ userId, userEmail, paymentsEnabled = false, theme = "system", subscription = DEFAULT_SUB, isAdmin = false, children }: ShellProps) {
  const { isOpen, open, close } = useCommandPalette();
  const { setTheme } = useTheme();

  // Sync the user's DB preference with next-themes once on mount.
  const syncedRef = React.useRef(false);
  React.useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      if (theme !== "system") {
        setTheme(theme);
      }
    }
  }, [theme, setTheme]);

  return (
    <TimestampProvider>
    <AudioProvider>
    <ToastProvider>
      <PaymentsProvider enabled={paymentsEnabled}>
      <SubscriptionProvider initial={subscription}>
        <div className="flex flex-col h-dvh overflow-hidden">
          {/* Full-width top bar (desktop) */}
          <TopBar userId={userId} userEmail={userEmail ?? null} onSearchClick={open} isAdmin={isAdmin} />

          {/* Below top bar: sidebar + content */}
          <div className="flex flex-1 min-h-0">
            {/* Spacer for fixed-position Rail (desktop) */}
            <div className="hidden md:block w-14 shrink-0" />
            <Rail />
            <MobileNav userId={userId} userEmail={userEmail} onSearchClick={open} isAdmin={isAdmin} />
            <MainContent>{children}</MainContent>
          </div>
        </div>
        <MiniPlayer />
        <CommandPalette isOpen={isOpen} onClose={close} />
      </SubscriptionProvider>
      </PaymentsProvider>
    </ToastProvider>
    </AudioProvider>
    </TimestampProvider>
  );
}

/** Reads audio context to add extra bottom padding when the MiniPlayer is visible. */
function MainContent({ children }: { children: React.ReactNode }) {
  const { activeVersion } = useAudio();
  const miniPlayerActive = !!activeVersion;

  return (
    <div
      className={cn(
        "flex-1 min-w-0 overflow-y-auto no-scrollbar p-4 md:p-6",
        miniPlayerActive ? "pb-36 md:pb-24" : "pb-20 md:pb-6",
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
