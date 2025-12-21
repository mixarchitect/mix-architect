import * as React from "react";
import { cn } from "@/lib/cn";

export function Rule({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("border-0 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}


