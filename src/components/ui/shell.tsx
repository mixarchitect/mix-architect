"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Rail } from "@/components/ui/rail";
import { MobileNav } from "@/components/ui/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { PaymentsProvider } from "@/lib/payments-context";
import { AudioProvider } from "@/lib/audio-context";
import { TimestampProvider } from "@/lib/timestamp-context";
import { MiniPlayer } from "@/components/ui/mini-player";
import { useCommandPalette } from "@/hooks/use-command-palette";

type ShellProps = {
  userEmail?: string | null;
  paymentsEnabled?: boolean;
  theme?: string;
  children: React.ReactNode;
};

export function Shell({ paymentsEnabled = false, theme = "system", children }: ShellProps) {
  const { isOpen, open, close } = useCommandPalette();
  const { setTheme } = useTheme();

  // Sync the user's DB preference with next-themes once on mount.
  // Must not re-run when setTheme reference changes, otherwise it
  // resets user-initiated theme toggles back to the server prop.
  const syncedRef = React.useRef(false);
  React.useEffect(() => {
    if (!syncedRef.current) {
      setTheme(theme);
      syncedRef.current = true;
    }
  }, [theme, setTheme]);

  return (
    <TimestampProvider>
    <AudioProvider>
      <PaymentsProvider enabled={paymentsEnabled}>
        <div className="flex h-screen overflow-hidden">
          {/* Spacer for fixed-position Rail */}
          <div className="hidden md:block w-16 shrink-0" />
          <Rail onSearchClick={open} />
          <MobileNav onSearchClick={open} />
          <div className="flex-1 min-w-0 overflow-y-auto no-scrollbar p-4 pb-20 md:p-6 md:pb-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
        </div>
        <MiniPlayer />
        <CommandPalette isOpen={isOpen} onClose={close} />
      </PaymentsProvider>
    </AudioProvider>
    </TimestampProvider>
  );
}
