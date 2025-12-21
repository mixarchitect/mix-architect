import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "dark";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = "secondary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 select-none",
        "h-11 px-5 rounded-sm text-sm font-semibold",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        variant === "dark" && "btn-dark",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        className
      )}
      {...props}
    />
  );
}

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "dark";
};

export function IconButton({
  className,
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        variant === "default" && "btn-icon",
        variant === "dark" && "btn-icon-dark",
        className
      )}
      {...props}
    />
  );
}
