import * as React from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type ActionProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ActionProps;
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizes: Record<string, number> = { sm: 24, md: 32, lg: 48 };

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "text-center",
        size === "sm" && "px-4 py-5",
        size === "md" &&
          "rounded-lg border border-dashed border-border px-6 py-10",
        size === "lg" &&
          "rounded-lg border border-dashed border-border px-8 py-16 flex flex-col items-center justify-center min-h-[40vh]",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "mx-auto flex items-center justify-center text-muted",
            size === "sm" && "mb-2",
            size === "md" && "mb-4",
            size === "lg" && "mb-5",
          )}
        >
          <Icon size={iconSizes[size]} strokeWidth={1.5} />
        </div>
      )}

      <div
        className={cn(
          "font-semibold text-text",
          size === "sm" && "text-sm",
          size === "md" && "text-sm",
          size === "lg" && "text-lg",
        )}
      >
        {title}
      </div>

      {description && (
        <p
          className={cn(
            "text-muted mt-1.5 mx-auto",
            size === "sm" && "text-xs max-w-xs",
            size === "md" && "text-sm max-w-sm",
            size === "lg" && "text-sm max-w-md",
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div
          className={cn(
            "flex items-center justify-center gap-3",
            size === "sm" && "mt-3",
            size === "md" && "mt-5",
            size === "lg" && "mt-6",
          )}
        >
          {action && <EmptyStateAction {...action} size={size} />}
          {secondaryAction && (
            <EmptyStateAction {...secondaryAction} variant="ghost" size={size} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Action sub-component ── */

function EmptyStateAction({
  label,
  href,
  onClick,
  variant = "primary",
  size,
}: ActionProps & { size: string }) {
  const isPrimary = variant === "primary";

  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out rounded-sm",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-signal-muted",
    size === "sm" && "h-8 px-3 text-xs",
    (size === "md" || size === "lg") && "h-10 px-5 text-sm",
    isPrimary && "btn-primary",
    !isPrimary && "btn-ghost",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
