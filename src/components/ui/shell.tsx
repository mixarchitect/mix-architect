import * as React from "react";
import { Rail } from "@/components/ui/rail";
import { MobileNav } from "@/components/ui/mobile-nav";
import { PaymentsProvider } from "@/lib/payments-context";

type ShellProps = {
  userEmail?: string | null;
  paymentsEnabled?: boolean;
  children: React.ReactNode;
};

export function Shell({ userEmail, paymentsEnabled = false, children }: ShellProps) {
  return (
    <PaymentsProvider enabled={paymentsEnabled}>
      <div className="flex min-h-screen">
        <Rail userEmail={userEmail} />
        <MobileNav />
        <div className="flex-1 min-w-0 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </PaymentsProvider>
  );
}
