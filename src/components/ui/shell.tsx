"use client";

import * as React from "react";
import { Rail } from "@/components/ui/rail";
import { MobileNav } from "@/components/ui/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { PaymentsProvider } from "@/lib/payments-context";
import { useCommandPalette } from "@/hooks/use-command-palette";

type ShellProps = {
  userEmail?: string | null;
  paymentsEnabled?: boolean;
  children: React.ReactNode;
};

export function Shell({ paymentsEnabled = false, children }: ShellProps) {
  const { isOpen, open, close } = useCommandPalette();

  return (
    <PaymentsProvider enabled={paymentsEnabled}>
      <div className="flex min-h-screen">
        <Rail onSearchClick={open} />
        <MobileNav onSearchClick={open} />
        <div className="flex-1 min-w-0 overflow-y-auto no-scrollbar p-4 pb-20 md:p-6 md:pb-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
      <CommandPalette isOpen={isOpen} onClose={close} />
    </PaymentsProvider>
  );
}
