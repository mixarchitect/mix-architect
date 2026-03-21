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
import { FeatureVisibilityProvider } from "@/lib/features/feature-visibility-context";
import { type FeatureVisibility } from "@/lib/features/feature-registry";
import { AudioProvider, useAudio } from "@/lib/audio-context";
import { TimestampProvider } from "@/lib/timestamp-context";
import { identifyUser } from "@/lib/openpanel-track";
import { MiniPlayer } from "@/components/ui/mini-player";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { TourProvider } from "@/components/onboarding/tour-provider";

type ShellProps = {
  userId?: string;
  userEmail?: string | null;
  displayName?: string | null;
  paymentsEnabled?: boolean;
  theme?: string;
  subscription?: SubscriptionState;
  featureVisibility?: Partial<FeatureVisibility> | null;
  persona?: string | null;
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

export function Shell({ userId, userEmail, displayName, paymentsEnabled = false, theme = "system", subscription = DEFAULT_SUB, featureVisibility = null, persona = null, isAdmin = false, children }: ShellProps) {
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
      // Identify user for OpenPanel analytics
      if (userId) {
        identifyUser({
          profileId: userId,
          email: userEmail ?? undefined,
          firstName: displayName?.split(" ")[0],
        });
      }
    }
  }, [theme, setTheme, userId, userEmail, displayName]);

  return (
    <TimestampProvider>
    <AudioProvider>
    <ToastProvider>
      <FeatureVisibilityProvider initial={featureVisibility} persona={persona}>
      <PaymentsProvider enabled={paymentsEnabled}>
      <SubscriptionProvider initial={subscription}>
      <TourProvider persona={persona} displayName={displayName ?? null}>
        <div className="flex flex-col h-dvh overflow-hidden">
          {/* Full-width top bar (desktop) */}
          <TopBar userId={userId} userEmail={userEmail ?? null} displayName={displayName ?? null} onSearchClick={open} isAdmin={isAdmin} />

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
      </TourProvider>
      </SubscriptionProvider>
      </PaymentsProvider>
      </FeatureVisibilityProvider>
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
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "flex-1 min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar p-4 md:p-6 focus:outline-none",
        miniPlayerActive ? "pb-36 md:pb-24" : "pb-20 md:pb-6",
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
