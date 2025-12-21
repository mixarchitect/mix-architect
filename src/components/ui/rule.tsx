import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLHRElement> & {
  dashed?: boolean;
};

export function Rule({ className, dashed, ...props }: Props) {
  return (
    <hr
      className={cn(
        "border-0 h-px",
        dashed
          ? "bg-transparent bg-[repeating-linear-gradient(to_right,var(--border)_0_5px,transparent_5px_10px)]"
          : "bg-border",
        className
      )}
      {...props}
    />
  );
}
