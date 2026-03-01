"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { Rail } from "@/components/ui/rail";
import { MobileNav } from "@/components/ui/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { PaymentsProvider } from "@/lib/payments-context";
import { SubscriptionProvider, type SubscriptionState } from "@/lib/subscription-context";
import { AudioProvider, useAudio } from "@/lib/audio-context";
import { TimestampProvider } from "@/lib/timestamp-context";
import { MiniPlayer } from "@/components/ui/mini-player";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { ToastProvider } from "@/components/ui/toast";

type ShellProps = {
  userEmail?: string | null;
  paymentsEnabled?: boolean;
  theme?: string;
  subscription?: SubscriptionState;
  children: React.ReactNode;
};

const DEFAULT_SUB: SubscriptionState = {
  plan: "free",
  status: "active",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  grantedByAdmin: false,
};

export function Shell({ paymentsEnabled = false, theme = "system", subscription = DEFAULT_SUB, children }: ShellProps) {
  const { isOpen, open, close } = useCommandPalette();
  const { setTheme } = useTheme();

  // Sync the user's DB preference with next-themes once on mount.
  // Only apply when the DB holds an explicit choice (light/dark).
  // When the server prop is "system" (the default), let next-themes'
  // own localStorage persistence take precedence — this prevents
  // resetting user toggles when the fire-and-forget DB upsert
  // hasn't completed before a page refresh.
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
        <div className="flex h-dvh overflow-hidden">
          {/* Spacer for fixed-position Rail */}
          <div className="hidden md:block w-16 shrink-0" />
          <Rail onSearchClick={open} />
          <MobileNav onSearchClick={open} />
          <MainContent>{children}</MainContent>
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
