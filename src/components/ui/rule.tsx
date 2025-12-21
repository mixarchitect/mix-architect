import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLHRElement> & {
  dashed?: boolean;
};

export function Rule({ className, dashed, ...props }: Props) {
  return (
    <hr
      className={cn(
        "border-0 h-px bg-[var(--border)]",
        dashed && "rule-dashed bg-none",
        className
      )}
      {...props}
    />
  );
}



