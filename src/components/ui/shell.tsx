import * as React from "react";
import { Rail } from "@/components/ui/rail";

type ShellProps = {
  userEmail?: string | null;
  children: React.ReactNode;
};

export function Shell({ userEmail, children }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Rail userEmail={userEmail} />
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
