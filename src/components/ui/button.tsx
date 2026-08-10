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
  size?: "default" | "sm";
};

export function IconButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: IconButtonProps) {
  // Icon-only buttons need an accessible name (aria-label, or title as a
  // fallback). Enforced at runtime in dev instead of the type level only
  // because a few call sites live in files frozen by in-flight work; make
  // aria-label a required prop once those land.
  if (
    process.env.NODE_ENV !== "production" &&
    !props["aria-label"] &&
    !props["aria-labelledby"] &&
    !props.title
  ) {
    console.warn(
      "IconButton rendered without an accessible name: add aria-label (or title).",
    );
  }
  return (
    <button
      className={cn(
        size === "sm" && variant === "default" && "btn-icon-sm",
        size === "default" && variant === "default" && "btn-icon",
        variant === "dark" && "btn-icon-dark",
        // 44x44 minimum hit area; icon size is set by the child SVG.
        "min-h-11 min-w-11 inline-flex items-center justify-center",
        className
      )}
      {...props}
    />
  );
}
