import * as React from "react";
import { cn } from "@/lib/cn";

type ToolbarProps = React.HTMLAttributes<HTMLDivElement>;

export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <div
      className={cn(
        "toolbar-dark inline-flex items-center gap-1 p-1.5",
        className
      )}
      {...props}
    />
  );
}

type ToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function ToolbarButton({
  className,
  active,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        "w-9 h-9 rounded-md flex items-center justify-center",
        "text-white/70 hover:text-white hover:bg-white/10",
        "transition-all duration-150",
        active && "bg-white/15 text-white",
        className
      )}
      {...props}
    />
  );
}

